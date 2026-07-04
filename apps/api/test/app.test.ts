import { afterAll, describe, expect, it } from 'vitest';

import { prisma } from '@pulseboard/db';

import { closeAppResources, createApp } from '../src/app.js';

const shouldRunIntegration = process.env.RUN_INTEGRATION_TESTS === 'true';
const describeIntegration = shouldRunIntegration ? describe : describe.skip;
const demoApiKey = process.env.DEMO_API_KEY ?? 'pb_local_demo_key_change_me';

afterAll(async () => {
  await closeAppResources();
  await prisma.$disconnect();
});

describe('health endpoints', () => {
  it('returns liveness without authentication', async () => {
    const response = await createApp().request('/health/live');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok' });
  });

  it('propagates request ids on public responses', async () => {
    const response = await createApp().request('/health/live', {
      headers: { 'X-Request-Id': 'test-request-id' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Request-Id')).toBe('test-request-id');
  });
});

describe('error responses', () => {
  it('includes the request id in error responses', async () => {
    const response = await createApp().request('/v1/workspaces', {
      headers: { 'X-Request-Id': 'missing-auth-request' },
    });

    expect(response.status).toBe(401);
    expect(response.headers.get('X-Request-Id')).toBe('missing-auth-request');
    await expect(response.json()).resolves.toMatchObject({
      error: 'Missing API key.',
      requestId: 'missing-auth-request',
    });
  });
});

describeIntegration('workspace API flow', () => {
  it('creates and revokes API keys for the authenticated user', async () => {
    const app = createApp();
    const headers = {
      Authorization: `Bearer ${demoApiKey}`,
      'Content-Type': 'application/json',
    };

    const created = await app.request('/v1/api-keys', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Integration rotation key' }),
    });
    expect(created.status).toBe(201);
    const createdBody = await created.json();
    const createdKey = createdBody.data.key as string;
    const createdId = createdBody.data.id as string;

    expect(createdKey).toMatch(/^pb_/);
    expect(createdBody.data.prefix).toBe(createdKey.slice(0, 10));

    const newKeyHeaders = {
      Authorization: `Bearer ${createdKey}`,
      'Content-Type': 'application/json',
    };
    const workspaces = await app.request('/v1/workspaces', { headers: newKeyHeaders });
    expect(workspaces.status).toBe(200);

    const revoked = await app.request(`/v1/api-keys/${createdId}`, {
      method: 'DELETE',
      headers,
    });
    expect(revoked.status).toBe(200);
    const revokedBody = await revoked.json();
    expect(revokedBody.data.revokedAt).toBeTruthy();

    const afterRevoke = await app.request('/v1/workspaces', { headers: newKeyHeaders });
    expect(afterRevoke.status).toBe(401);
    await expect(afterRevoke.json()).resolves.toMatchObject({ error: 'Invalid API key.' });
  });

  it('creates, reads, updates, and deletes a workspace', async () => {
    const app = createApp();
    const headers = {
      Authorization: `Bearer ${demoApiKey}`,
      'Content-Type': 'application/json',
    };
    const slug = `integration-${Date.now()}`;

    const created = await app.request('/v1/workspaces', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Integration Workspace', slug }),
    });
    expect(created.status).toBe(201);
    const createdBody = await created.json();
    const id = createdBody.data.id as string;

    const fetched = await app.request(`/v1/workspaces/${id}`, { headers });
    expect(fetched.status).toBe(200);

    const updated = await app.request(`/v1/workspaces/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ name: 'Integration Workspace Updated' }),
    });
    expect(updated.status).toBe(200);

    const deleted = await app.request(`/v1/workspaces/${id}`, {
      method: 'DELETE',
      headers,
    });
    expect(deleted.status).toBe(200);
  });

  it('exercises project, service, uptime check, webhook, audit, and incident APIs', async () => {
    const app = createApp();
    const headers = {
      Authorization: `Bearer ${demoApiKey}`,
      'Content-Type': 'application/json',
    };
    const suffix = Date.now().toString(36);

    const workspaceResponse = await app.request('/v1/workspaces', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Integration Main Flow', slug: `integration-main-${suffix}` }),
    });
    expect(workspaceResponse.status).toBe(201);
    const workspace = (await workspaceResponse.json()).data;

    const projectResponse = await app.request(`/v1/workspaces/${workspace.id}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Customer Platform',
        slug: `customer-platform-${suffix}`,
      }),
    });
    expect(projectResponse.status).toBe(201);
    const project = (await projectResponse.json()).data;

    const projectDetail = await app.request(`/v1/projects/${project.id}`, { headers });
    expect(projectDetail.status).toBe(200);

    const serviceResponse = await app.request(`/v1/projects/${project.id}/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Public API',
        slug: `public-api-${suffix}`,
        baseUrl: 'https://example.com',
      }),
    });
    expect(serviceResponse.status).toBe(201);
    const service = (await serviceResponse.json()).data;

    const serviceDetail = await app.request(`/v1/services/${service.id}`, { headers });
    expect(serviceDetail.status).toBe(200);

    const checkResponse = await app.request(`/v1/services/${service.id}/uptime-checks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Example homepage',
        url: 'https://example.com',
        expectedStatus: 200,
        intervalSeconds: 60,
      }),
    });
    expect(checkResponse.status).toBe(201);
    const check = (await checkResponse.json()).data;

    const checkDetail = await app.request(`/v1/uptime-checks/${check.id}`, { headers });
    expect(checkDetail.status).toBe(200);

    const webhookResponse = await app.request('/v1/webhooks/events', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        workspaceId: workspace.id,
        source: 'integration-test',
        eventType: 'deployment.finished',
        externalId: `deploy-${suffix}`,
        payload: { service: service.slug, status: 'succeeded' },
      }),
    });
    expect(webhookResponse.status).toBe(202);

    const incident = await prisma.incident.create({
      data: {
        serviceId: service.id,
        title: 'Synthetic test incident',
        severity: 'minor',
      },
    });

    const incidentDetail = await app.request(`/v1/incidents/${incident.id}`, { headers });
    expect(incidentDetail.status).toBe(200);

    const incidentUpdate = await app.request(`/v1/incidents/${incident.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'ACKNOWLEDGED', summary: 'Acknowledged by integration test.' }),
    });
    expect(incidentUpdate.status).toBe(200);
    await expect(incidentUpdate.json()).resolves.toMatchObject({ data: { status: 'ACKNOWLEDGED' } });

    const auditLogs = await app.request(`/v1/audit-logs?workspaceId=${workspace.id}`, { headers });
    expect(auditLogs.status).toBe(200);
    const auditBody = await auditLogs.json();
    expect(auditBody.data.length).toBeGreaterThanOrEqual(5);

    const usageMetrics = await app.request(`/v1/usage-metrics?workspaceId=${workspace.id}`, { headers });
    expect(usageMetrics.status).toBe(200);
    const usageBody = await usageMetrics.json();
    expect(usageBody.data.map((metric: { name: string }) => metric.name)).toEqual(
      expect.arrayContaining(['projects_created', 'services_created', 'uptime_checks_configured', 'webhook_events_ingested']),
    );

    await app.request(`/v1/workspaces/${workspace.id}`, { method: 'DELETE', headers });
  });

  it('does not leak audit logs across workspaces owned by different users', async () => {
    const app = createApp();
    const headers = {
      Authorization: `Bearer ${demoApiKey}`,
      'Content-Type': 'application/json',
    };
    const suffix = Date.now().toString(36);
    const otherApiKey = `pb_integration_other_${suffix}`;
    const salt = process.env.API_KEY_HASH_SALT ?? 'local-development-only';
    const { createHash } = await import('node:crypto');
    const keyHash = createHash('sha256').update(`${salt}:${otherApiKey}`).digest('hex');

    const otherUser = await prisma.user.create({
      data: {
        email: `other-${suffix}@pulseboard.local`,
        name: 'Other Tenant Owner',
        apiKeys: {
          create: {
            name: 'Other integration key',
            prefix: otherApiKey.slice(0, 10),
            keyHash,
          },
        },
      },
    });

    const ownWorkspaceResponse = await app.request('/v1/workspaces', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Own Audit Scope', slug: `own-audit-${suffix}` }),
    });
    expect(ownWorkspaceResponse.status).toBe(201);
    const ownWorkspace = (await ownWorkspaceResponse.json()).data;

    const otherHeaders = {
      Authorization: `Bearer ${otherApiKey}`,
      'Content-Type': 'application/json',
    };
    const otherWorkspaceResponse = await app.request('/v1/workspaces', {
      method: 'POST',
      headers: otherHeaders,
      body: JSON.stringify({ name: 'Other Audit Scope', slug: `other-audit-${suffix}` }),
    });
    expect(otherWorkspaceResponse.status).toBe(201);
    const otherWorkspace = (await otherWorkspaceResponse.json()).data;

    const auditLogs = await app.request('/v1/audit-logs', { headers });
    expect(auditLogs.status).toBe(200);
    const body = await auditLogs.json();
    const workspaceIds = new Set(body.data.map((log: { workspaceId: string }) => log.workspaceId));

    expect(workspaceIds.has(ownWorkspace.id)).toBe(true);
    expect(workspaceIds.has(otherWorkspace.id)).toBe(false);

    await app.request(`/v1/workspaces/${ownWorkspace.id}`, { method: 'DELETE', headers });
    await prisma.workspace.delete({ where: { id: otherWorkspace.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  it('does not leak usage metrics across workspaces owned by different users', async () => {
    const app = createApp();
    const headers = {
      Authorization: `Bearer ${demoApiKey}`,
      'Content-Type': 'application/json',
    };
    const suffix = Date.now().toString(36);
    const otherApiKey = `pb_metrics_other_${suffix}`;
    const salt = process.env.API_KEY_HASH_SALT ?? 'local-development-only';
    const { createHash } = await import('node:crypto');
    const keyHash = createHash('sha256').update(`${salt}:${otherApiKey}`).digest('hex');

    const otherUser = await prisma.user.create({
      data: {
        email: `metrics-other-${suffix}@pulseboard.local`,
        name: 'Other Metrics Owner',
        apiKeys: {
          create: {
            name: 'Other metrics key',
            prefix: otherApiKey.slice(0, 10),
            keyHash,
          },
        },
      },
    });

    const ownWorkspaceResponse = await app.request('/v1/workspaces', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Own Metrics Scope', slug: `own-metrics-${suffix}` }),
    });
    expect(ownWorkspaceResponse.status).toBe(201);
    const ownWorkspace = (await ownWorkspaceResponse.json()).data;

    await prisma.usageMetric.create({
      data: {
        workspaceId: ownWorkspace.id,
        name: 'own_metric',
        value: 1,
      },
    });

    const otherWorkspace = await prisma.workspace.create({
      data: {
        name: 'Other Metrics Scope',
        slug: `other-metrics-${suffix}`,
        members: { create: { userId: otherUser.id, role: 'owner' } },
        usageMetrics: { create: { name: 'other_metric', value: 1 } },
      },
    });

    const metrics = await app.request('/v1/usage-metrics', { headers });
    expect(metrics.status).toBe(200);
    const body = await metrics.json();
    const workspaceIds = new Set(body.data.map((metric: { workspaceId: string }) => metric.workspaceId));
    const metricNames = new Set(body.data.map((metric: { name: string }) => metric.name));

    expect(workspaceIds.has(ownWorkspace.id)).toBe(true);
    expect(workspaceIds.has(otherWorkspace.id)).toBe(false);
    expect(metricNames.has('other_metric')).toBe(false);

    await app.request(`/v1/workspaces/${ownWorkspace.id}`, { method: 'DELETE', headers });
    await prisma.workspace.delete({ where: { id: otherWorkspace.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });
});
