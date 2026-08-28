import * as AjvModule from 'ajv';
import type { AnySchema, ValidateFunction } from 'ajv';
import * as AjvFormatsModule from 'ajv-formats';
import { afterAll, describe, expect, it } from 'vitest';

import { prisma } from '@pulseboard/db';

import { closeAppResources, createApp } from '../src/app.js';
import { openApiDocument } from '../src/openapi.js';

const shouldRunIntegration = process.env.RUN_INTEGRATION_TESTS === 'true';
const describeIntegration = shouldRunIntegration ? describe : describe.skip;
const demoApiKey = process.env.DEMO_API_KEY ?? 'pb_local_demo_key_change_me';
const openApiSchemaId = 'https://pulseboard.local/demo/openapi.json';

type HttpMethod = 'get' | 'post' | 'patch' | 'delete';
type JsonRecord = Record<string, unknown>;

const Ajv = AjvModule.default as unknown as typeof AjvModule.Ajv;
const addFormats = AjvFormatsModule.default as unknown as AjvFormatsModule.FormatsPlugin;
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(openApiDocument as unknown as AnySchema, openApiSchemaId);

afterAll(async () => {
  await closeAppResources();
  await prisma.$disconnect();
});

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeJsonPointer(value: string): string {
  return value.replaceAll('~', '~0').replaceAll('/', '~1');
}

function readLocalPointer(pointer: string): unknown {
  if (!pointer.startsWith('#/')) throw new Error(`Only local OpenAPI references are supported: ${pointer}`);

  return pointer
    .slice(2)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce<unknown>((current, part) => {
      if (!isRecord(current) || !(part in current)) throw new Error(`OpenAPI pointer does not exist: ${pointer}`);
      return current[part];
    }, openApiDocument);
}

function responseValidator(documentedPath: string, method: HttpMethod, status: number): ValidateFunction {
  let responsePointer = `#/paths/${escapeJsonPointer(documentedPath)}/${method}/responses/${status}`;
  let response = readLocalPointer(responsePointer);

  if (isRecord(response) && typeof response.$ref === 'string') {
    responsePointer = response.$ref;
    response = readLocalPointer(responsePointer);
  }

  if (!isRecord(response)) throw new Error(`OpenAPI response is not an object: ${method.toUpperCase()} ${documentedPath} ${status}`);

  const content = response.content;
  if (!isRecord(content) || !isRecord(content['application/json'])) {
    throw new Error(`OpenAPI response has no application/json contract: ${method.toUpperCase()} ${documentedPath} ${status}`);
  }
  if (!isRecord(content['application/json'].schema)) {
    throw new Error(`OpenAPI response has no JSON schema: ${method.toUpperCase()} ${documentedPath} ${status}`);
  }

  return ajv.compile({ $ref: `${openApiSchemaId}${responsePointer}/content/application~1json/schema` });
}

async function expectResponseMatchesOpenApi(
  response: Response,
  documentedPath: string,
  method: HttpMethod,
  status: number,
): Promise<unknown> {
  expect(response.status).toBe(status);
  expect(response.headers.get('content-type')).toContain('application/json');

  const body: unknown = await response.json();
  const validate = responseValidator(documentedPath, method, status);
  const valid = validate(body);
  expect(
    valid,
    `${method.toUpperCase()} ${documentedPath} ${status} violated its OpenAPI response schema:\n${JSON.stringify(validate.errors, null, 2)}`,
  ).toBe(true);
  return body;
}

describe('executable OpenAPI response contracts', () => {
  it('validates public liveness and draining readiness responses', async () => {
    const live = await createApp().request('/health/live');
    await expectResponseMatchesOpenApi(live, '/demo/health/live', 'get', 200);

    const notReady = await createApp({ isDraining: () => true }).request('/health/ready', {
      headers: { 'X-Request-Id': 'openapi-draining-request' },
    });
    await expectResponseMatchesOpenApi(notReady, '/demo/health/ready', 'get', 503);
  });

  it('validates the shared authentication error envelope', async () => {
    const unauthorized = await createApp().request('/v1/workspaces', {
      headers: { 'X-Request-Id': 'openapi-auth-request' },
    });
    await expectResponseMatchesOpenApi(unauthorized, '/demo/api/v1/workspaces', 'get', 401);
  });

  it('rejects response drift that omits required liveness fields', () => {
    const validate = responseValidator('/demo/health/live', 'get', 200);
    expect(validate({ status: 'ok', service: 'pulseboard-api' })).toBe(false);
    expect(validate.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ keyword: 'required', params: { missingProperty: 'release' } })]),
    );
  });
});

describeIntegration('database-backed OpenAPI response contracts', () => {
  it('validates readiness, workspace, uptime-check, and incident response bodies', async () => {
    const app = createApp();
    const headers = {
      Authorization: `Bearer ${demoApiKey}`,
      'Content-Type': 'application/json',
    };
    const testStartedAt = new Date();
    const suffix = Date.now().toString(36);
    const service = await prisma.monitoredService.findFirstOrThrow({
      where: { project: { workspace: { slug: 'acme-remote-ops' } } },
      include: { project: true },
    });

    let uptimeCheckId: string | undefined;
    let incidentId: string | undefined;

    try {
      const ready = await app.request('/health/ready');
      await expectResponseMatchesOpenApi(ready, '/demo/health/ready', 'get', 200);

      const workspaces = await app.request('/v1/workspaces', { headers });
      await expectResponseMatchesOpenApi(workspaces, '/demo/api/v1/workspaces', 'get', 200);

      const createdCheck = await app.request(`/v1/services/${service.id}/uptime-checks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `OpenAPI contract check ${suffix}`,
          description: 'Nullable operator context is part of the executable response contract.',
          url: 'https://example.com',
          intervalSeconds: 120,
        }),
      });
      const createdCheckBody = await expectResponseMatchesOpenApi(
        createdCheck,
        '/demo/api/v1/services/{serviceId}/uptime-checks',
        'post',
        201,
      );
      if (!isRecord(createdCheckBody) || !isRecord(createdCheckBody.data) || typeof createdCheckBody.data.id !== 'string') {
        throw new Error('Created uptime check response did not expose a string data.id.');
      }
      uptimeCheckId = createdCheckBody.data.id;

      const checks = await app.request(`/v1/services/${service.id}/uptime-checks`, { headers });
      await expectResponseMatchesOpenApi(checks, '/demo/api/v1/services/{serviceId}/uptime-checks', 'get', 200);

      const checkDetail = await app.request(`/v1/uptime-checks/${uptimeCheckId}`, { headers });
      await expectResponseMatchesOpenApi(checkDetail, '/demo/api/v1/uptime-checks/{id}', 'get', 200);

      const incident = await prisma.incident.create({
        data: {
          serviceId: service.id,
          title: `OpenAPI contract incident ${suffix}`,
          status: 'RESOLVED',
          severity: 'minor',
          summary: null,
          notifications: {
            create: {
              idempotencyKey: `openapi-contract-notification:${suffix}`,
              channel: 'WEBHOOK',
              status: 'DEAD_LETTER',
              target: 'https://example.invalid/openapi-contract',
              payload: { source: 'openapi-contract-test' },
              attemptCount: 1,
              cycleAttemptCount: 1,
              deadLetteredAt: new Date(),
              attempts: {
                create: {
                  attemptNumber: 1,
                  succeeded: false,
                  errorMessage: 'Synthetic contract fixture failure.',
                },
              },
            },
          },
        },
      });
      incidentId = incident.id;

      const incidents = await app.request('/v1/incidents', { headers });
      await expectResponseMatchesOpenApi(incidents, '/demo/api/v1/incidents', 'get', 200);

      const incidentDetail = await app.request(`/v1/incidents/${incidentId}`, { headers });
      await expectResponseMatchesOpenApi(incidentDetail, '/demo/api/v1/incidents/{id}', 'get', 200);
    } finally {
      if (incidentId) await prisma.incident.deleteMany({ where: { id: incidentId } });
      if (uptimeCheckId) {
        await prisma.auditLog.deleteMany({ where: { entityType: 'uptime_check', entityId: uptimeCheckId } });
        await prisma.uptimeCheck.deleteMany({ where: { id: uptimeCheckId } });
      }
      await prisma.usageMetric.deleteMany({
        where: {
          workspaceId: service.project.workspaceId,
          name: 'uptime_checks_configured',
          recordedAt: { gte: testStartedAt },
        },
      });
    }
  });
});
