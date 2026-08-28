import { afterAll, describe, expect, it } from 'vitest';

import { hashApiKey } from '@pulseboard/core';
import { prisma } from '@pulseboard/db';
import { RedisOperationalMetrics } from '@pulseboard/observability';
import { Redis } from 'ioredis';

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
    await expect(response.json()).resolves.toMatchObject({
      status: 'ok',
      release: 'unversioned',
      contract: 'current',
    });
  });

  it('reports the immutable image revision in liveness', async () => {
    const previousRevision = process.env.PULSEBOARD_BUILD_REVISION;
    const previousContract = process.env.PULSEBOARD_BUILD_CONTRACT;
    process.env.PULSEBOARD_BUILD_REVISION = 'rollback-test-candidate';
    process.env.PULSEBOARD_BUILD_CONTRACT = 'candidate-v3';

    try {
      const response = await createApp().request('/health/live');
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        status: 'ok',
        release: 'rollback-test-candidate',
        contract: 'candidate-v3',
      });
    } finally {
      if (previousRevision === undefined) delete process.env.PULSEBOARD_BUILD_REVISION;
      else process.env.PULSEBOARD_BUILD_REVISION = previousRevision;
      if (previousContract === undefined) delete process.env.PULSEBOARD_BUILD_CONTRACT;
      else process.env.PULSEBOARD_BUILD_CONTRACT = previousContract;
    }
  });

  it('propagates request ids on public responses', async () => {
    const response = await createApp().request('/health/live', {
      headers: { 'X-Request-Id': 'test-request-id' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Request-Id')).toBe('test-request-id');
  });

  it('reports not ready as soon as graceful shutdown starts', async () => {
    const response = await createApp({ isDraining: () => true }).request('/health/ready', {
      headers: { 'X-Request-Id': 'shutdown-request-id' },
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: 'not_ready',
      reason: 'shutting_down',
      requestId: 'shutdown-request-id',
    });
  });
});

describeIntegration('dependency health', () => {
  it('reports ready when PostgreSQL and Redis are reachable', async () => {
    const response = await createApp().request('/health/ready');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ready' });
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

describeIntegration('operational metrics', () => {
  it('exposes committed worker counters and BullMQ queue depth without API-key authentication', async () => {
    const previousPrefix = process.env.OPERATIONAL_METRICS_REDIS_PREFIX;
    const prefix = `pulseboard:test:operational-metrics:${Date.now()}`;
    process.env.OPERATIONAL_METRICS_REDIS_PREFIX = prefix;
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    const metrics = new RedisOperationalMetrics(redis, prefix);

    try {
      await redis.del(metrics.key);
      await metrics.recordUptimeCheck('DOWN', 750);
      await metrics.recordCheckExecutionLeaseContention();
      await metrics.recordNotificationTerminalFailure('WEBHOOK');

      const response = await createApp().request('/metrics');
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain; version=0.0.4');
      const body = await response.text();

      expect(body).toContain('pulseboard_uptime_checks_total{outcome="DOWN"} 1');
      expect(body).toContain('pulseboard_uptime_check_duration_ms_bucket{le="1000"} 1');
      expect(body).toContain('pulseboard_uptime_check_duration_ms_sum 750');
      expect(body).toContain('pulseboard_check_execution_lease_contention_total 1');
      expect(body).toContain('pulseboard_notification_terminal_failures_total{channel="WEBHOOK"} 1');
      expect(body).toContain('pulseboard_queue_jobs{queue="uptime-checks",state="waiting"}');
      expect(body).toContain('pulseboard_queue_jobs{queue="notifications",state="failed"}');
    } finally {
      await closeAppResources();
      await redis.del(metrics.key);
      await redis.quit();
      if (previousPrefix === undefined) delete process.env.OPERATIONAL_METRICS_REDIS_PREFIX;
      else process.env.OPERATIONAL_METRICS_REDIS_PREFIX = previousPrefix;
    }
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

    const checkCountBeforeUnsafeRequest = await prisma.uptimeCheck.count({ where: { serviceId: service.id } });
    const unsafeCheckResponse = await app.request(`/v1/services/${service.id}/uptime-checks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Cloud metadata endpoint',
        url: 'http://169.254.169.254/latest/meta-data',
      }),
    });
    expect(unsafeCheckResponse.status).toBe(400);
    await expect(unsafeCheckResponse.json()).resolves.toMatchObject({
      error: expect.stringContaining('private, local, reserved, or non-routable'),
    });
    await expect(prisma.uptimeCheck.count({ where: { serviceId: service.id } })).resolves.toBe(
      checkCountBeforeUnsafeRequest,
    );

    const checkResponse = await app.request(`/v1/services/${service.id}/uptime-checks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Example homepage',
        description: 'Primary public availability check.',
        url: 'https://example.com',
        expectedStatus: 200,
        intervalSeconds: 60,
      }),
    });
    expect(checkResponse.status).toBe(201);
    const check = (await checkResponse.json()).data;
    expect(check.description).toBe('Primary public availability check.');

    const checkDetail = await app.request(`/v1/uptime-checks/${check.id}`, { headers });
    expect(checkDetail.status).toBe(200);

    const checkUpdate = await app.request(`/v1/uptime-checks/${check.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ expectedStatus: 204, description: 'Updated operator context.' }),
    });
    expect(checkUpdate.status).toBe(200);
    await expect(checkUpdate.json()).resolves.toMatchObject({
      data: { expectedStatus: 204, description: 'Updated operator context.' },
    });

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

    await expect(
      prisma.incident.create({
        data: { serviceId: service.id, title: 'Duplicate active incident must fail', severity: 'major' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });

    const resolved = await app.request(`/v1/incidents/${incident.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ status: 'RESOLVED' }),
    });
    expect(resolved.status).toBe(200);
    const invalidReopen = await app.request(`/v1/incidents/${incident.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ status: 'OPEN' }),
    });
    expect(invalidReopen.status).toBe(409);

    const failedNotification = await prisma.notification.create({
      data: {
        idempotencyKey: `integration:failed-notification:${suffix}`, incidentId: incident.id, channel: 'WEBHOOK',
        target: 'https://example.invalid/webhook', payload: { incidentId: incident.id }, status: 'DEAD_LETTER',
        attemptCount: 3, cycleAttemptCount: 3, deadLetteredAt: new Date(), errorMessage: 'integration failure',
      },
    });
    const replay = await app.request(`/v1/notifications/${failedNotification.id}/replay`, { method: 'POST', headers });
    expect(replay.status).toBe(202);
    await expect(replay.json()).resolves.toMatchObject({
      data: { status: 'QUEUED', cycleAttemptCount: 0, errorMessage: null },
    });

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

  it('enforces a two-tenant isolation matrix across resource and operational endpoints', async () => {
    const app = createApp();
    const suffix = Date.now().toString(36);
    const ownApiKey = `pb_tenant_a_${suffix}`;
    const foreignApiKey = `pb_tenant_b_${suffix}`;
    const ownUser = await prisma.user.create({
      data: {
        email: `tenant-a-${suffix}@pulseboard.local`,
        name: 'Tenant A Owner',
        apiKeys: {
          create: {
            name: 'Tenant A integration key',
            prefix: ownApiKey.slice(0, 10),
            keyHash: hashApiKey(ownApiKey),
          },
        },
      },
      include: { apiKeys: true },
    });
    const foreignUser = await prisma.user.create({
      data: {
        email: `tenant-b-${suffix}@pulseboard.local`,
        name: 'Tenant B Owner',
        apiKeys: {
          create: {
            name: 'Tenant B integration key',
            prefix: foreignApiKey.slice(0, 10),
            keyHash: hashApiKey(foreignApiKey),
          },
        },
      },
      include: { apiKeys: true },
    });
    const ownWorkspace = await prisma.workspace.create({
      data: {
        name: 'Tenant A Workspace',
        slug: `tenant-a-${suffix}`,
        members: { create: { userId: ownUser.id, role: 'owner' } },
      },
    });
    const ownProject = await prisma.project.create({
      data: { workspaceId: ownWorkspace.id, name: 'Tenant A Project', slug: `tenant-a-project-${suffix}` },
    });
    const ownService = await prisma.monitoredService.create({
      data: {
        projectId: ownProject.id,
        name: 'Tenant A Service',
        slug: `tenant-a-service-${suffix}`,
        baseUrl: 'https://example.com',
      },
    });
    const ownIncident = await prisma.incident.create({
      data: { serviceId: ownService.id, title: 'Tenant A incident', severity: 'minor' },
    });
    const ownAudit = await prisma.auditLog.create({
      data: {
        action: 'CREATED',
        entityType: 'tenant_isolation_fixture',
        entityId: ownWorkspace.id,
        actorType: 'system',
        message: 'Tenant A isolation fixture.',
        workspaceId: ownWorkspace.id,
      },
    });
    const ownUsage = await prisma.usageMetric.create({
      data: { workspaceId: ownWorkspace.id, name: `tenant_a_metric_${suffix}`, value: 1 },
    });

    const foreignWorkspace = await prisma.workspace.create({
      data: {
        name: 'Tenant B Workspace',
        slug: `tenant-b-${suffix}`,
        members: { create: { userId: foreignUser.id, role: 'owner' } },
      },
    });
    const foreignProject = await prisma.project.create({
      data: {
        workspaceId: foreignWorkspace.id,
        name: 'Tenant B Project',
        slug: `tenant-b-project-${suffix}`,
      },
    });
    const foreignService = await prisma.monitoredService.create({
      data: {
        projectId: foreignProject.id,
        name: 'Tenant B Service',
        slug: `tenant-b-service-${suffix}`,
        baseUrl: 'https://example.com',
      },
    });
    const foreignCheck = await prisma.uptimeCheck.create({
      data: { serviceId: foreignService.id, name: 'Tenant B check', url: 'https://example.com' },
    });
    const foreignIncident = await prisma.incident.create({
      data: { serviceId: foreignService.id, title: 'Tenant B incident', severity: 'major' },
    });
    const foreignNotification = await prisma.notification.create({
      data: {
        idempotencyKey: `tenant-b-notification-${suffix}`,
        incidentId: foreignIncident.id,
        channel: 'WEBHOOK',
        target: 'https://example.invalid/webhook',
        payload: { incidentId: foreignIncident.id },
        status: 'DEAD_LETTER',
        attemptCount: 1,
        cycleAttemptCount: 1,
        maxAttempts: 1,
        deadLetteredAt: new Date(),
      },
    });
    const foreignAudit = await prisma.auditLog.create({
      data: {
        action: 'CREATED',
        entityType: 'tenant_isolation_fixture',
        entityId: foreignWorkspace.id,
        actorType: 'system',
        message: 'Tenant B isolation fixture.',
        workspaceId: foreignWorkspace.id,
      },
    });
    const foreignUsage = await prisma.usageMetric.create({
      data: { workspaceId: foreignWorkspace.id, name: `tenant_b_metric_${suffix}`, value: 1 },
    });

    const headers = {
      Authorization: `Bearer ${ownApiKey}`,
      'Content-Type': 'application/json',
    };
    const request = (path: string, init: RequestInit = {}) => app.request(path, { ...init, headers });
    const expectNotFound = async (response: Response, error: string) => {
      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toMatchObject({ error });
    };

    try {
      const apiKeys = await request('/v1/api-keys');
      expect(apiKeys.status).toBe(200);
      const apiKeyIds = new Set((await apiKeys.json()).data.map((key: { id: string }) => key.id));
      expect(apiKeyIds.has(ownUser.apiKeys[0]!.id)).toBe(true);
      expect(apiKeyIds.has(foreignUser.apiKeys[0]!.id)).toBe(false);
      await expectNotFound(
        await request(`/v1/api-keys/${foreignUser.apiKeys[0]!.id}`, { method: 'DELETE' }),
        'API key not found.',
      );

      const workspaces = await request('/v1/workspaces');
      expect(workspaces.status).toBe(200);
      const workspaceIds = new Set((await workspaces.json()).data.map((workspace: { id: string }) => workspace.id));
      expect(workspaceIds.has(ownWorkspace.id)).toBe(true);
      expect(workspaceIds.has(foreignWorkspace.id)).toBe(false);
      await expectNotFound(await request(`/v1/workspaces/${foreignWorkspace.id}`), 'Workspace not found.');
      await expectNotFound(
        await request(`/v1/workspaces/${foreignWorkspace.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Unauthorized workspace update' }),
        }),
        'Workspace not found.',
      );
      await expectNotFound(
        await request(`/v1/workspaces/${foreignWorkspace.id}`, { method: 'DELETE' }),
        'Workspace not found.',
      );

      await expectNotFound(
        await request(`/v1/workspaces/${foreignWorkspace.id}/projects`),
        'Workspace not found.',
      );
      await expectNotFound(
        await request(`/v1/workspaces/${foreignWorkspace.id}/projects`, {
          method: 'POST',
          body: JSON.stringify({ name: 'Unauthorized project', slug: `unauthorized-project-${suffix}` }),
        }),
        'Workspace not found.',
      );
      await expectNotFound(await request(`/v1/projects/${foreignProject.id}`), 'Project not found.');
      await expectNotFound(
        await request(`/v1/projects/${foreignProject.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Unauthorized project update' }),
        }),
        'Project not found.',
      );
      await expectNotFound(await request(`/v1/projects/${foreignProject.id}`, { method: 'DELETE' }), 'Project not found.');

      await expectNotFound(await request(`/v1/projects/${foreignProject.id}/services`), 'Project not found.');
      await expectNotFound(
        await request(`/v1/projects/${foreignProject.id}/services`, {
          method: 'POST',
          body: JSON.stringify({
            name: 'Unauthorized service',
            slug: `unauthorized-service-${suffix}`,
            baseUrl: 'https://example.com',
          }),
        }),
        'Project not found.',
      );
      await expectNotFound(await request(`/v1/services/${foreignService.id}`), 'Service not found.');
      await expectNotFound(
        await request(`/v1/services/${foreignService.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Unauthorized service update' }),
        }),
        'Service not found.',
      );
      await expectNotFound(await request(`/v1/services/${foreignService.id}`, { method: 'DELETE' }), 'Service not found.');

      await expectNotFound(
        await request(`/v1/services/${foreignService.id}/uptime-checks`),
        'Service not found.',
      );
      await expectNotFound(
        await request(`/v1/services/${foreignService.id}/uptime-checks`, {
          method: 'POST',
          body: JSON.stringify({ name: 'Unauthorized check', url: 'https://example.com' }),
        }),
        'Service not found.',
      );
      await expectNotFound(await request(`/v1/uptime-checks/${foreignCheck.id}`), 'Uptime check not found.');
      await expectNotFound(
        await request(`/v1/uptime-checks/${foreignCheck.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Unauthorized check update' }),
        }),
        'Uptime check not found.',
      );
      await expectNotFound(
        await request(`/v1/uptime-checks/${foreignCheck.id}`, { method: 'DELETE' }),
        'Uptime check not found.',
      );

      const incidents = await request('/v1/incidents');
      expect(incidents.status).toBe(200);
      const incidentIds = new Set((await incidents.json()).data.map((incident: { id: string }) => incident.id));
      expect(incidentIds.has(ownIncident.id)).toBe(true);
      expect(incidentIds.has(foreignIncident.id)).toBe(false);
      await expectNotFound(await request(`/v1/incidents/${foreignIncident.id}`), 'Incident not found.');
      await expectNotFound(
        await request(`/v1/incidents/${foreignIncident.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'ACKNOWLEDGED' }),
        }),
        'Incident not found.',
      );
      await expectNotFound(
        await request(`/v1/notifications/${foreignNotification.id}/replay`, { method: 'POST' }),
        'Notification not found.',
      );
      await expectNotFound(
        await request('/v1/webhooks/events', {
          method: 'POST',
          body: JSON.stringify({
            workspaceId: foreignWorkspace.id,
            source: 'tenant-isolation-test',
            eventType: 'unauthorized.event',
            payload: {},
          }),
        }),
        'Workspace not found.',
      );

      const auditLogs = await request('/v1/audit-logs');
      expect(auditLogs.status).toBe(200);
      const auditIds = new Set((await auditLogs.json()).data.map((audit: { id: string }) => audit.id));
      expect(auditIds.has(ownAudit.id)).toBe(true);
      expect(auditIds.has(foreignAudit.id)).toBe(false);
      const foreignAuditLogs = await request(`/v1/audit-logs?workspaceId=${foreignWorkspace.id}`);
      expect(foreignAuditLogs.status).toBe(200);
      await expect(foreignAuditLogs.json()).resolves.toMatchObject({ data: [] });

      const usageMetrics = await request('/v1/usage-metrics');
      expect(usageMetrics.status).toBe(200);
      const usageIds = new Set((await usageMetrics.json()).data.map((metric: { id: string }) => metric.id));
      expect(usageIds.has(ownUsage.id)).toBe(true);
      expect(usageIds.has(foreignUsage.id)).toBe(false);
      const foreignUsageMetrics = await request(`/v1/usage-metrics?workspaceId=${foreignWorkspace.id}`);
      expect(foreignUsageMetrics.status).toBe(200);
      await expect(foreignUsageMetrics.json()).resolves.toMatchObject({ data: [] });

      await expect(prisma.workspace.findUniqueOrThrow({ where: { id: foreignWorkspace.id } })).resolves.toMatchObject({
        name: 'Tenant B Workspace',
      });
      await expect(prisma.project.count({ where: { workspaceId: foreignWorkspace.id } })).resolves.toBe(1);
      await expect(prisma.monitoredService.count({ where: { projectId: foreignProject.id } })).resolves.toBe(1);
      await expect(prisma.uptimeCheck.count({ where: { serviceId: foreignService.id } })).resolves.toBe(1);
      await expect(prisma.incident.findUniqueOrThrow({ where: { id: foreignIncident.id } })).resolves.toMatchObject({
        status: 'OPEN',
      });
      await expect(prisma.notification.findUniqueOrThrow({ where: { id: foreignNotification.id } })).resolves.toMatchObject({
        status: 'DEAD_LETTER',
        replayedAt: null,
      });
      await expect(prisma.webhookEvent.count({ where: { workspaceId: foreignWorkspace.id } })).resolves.toBe(0);
      await expect(prisma.apiKey.findUniqueOrThrow({ where: { id: foreignUser.apiKeys[0]!.id } })).resolves.toMatchObject({
        revokedAt: null,
      });
    } finally {
      await prisma.workspace.deleteMany({ where: { id: { in: [ownWorkspace.id, foreignWorkspace.id] } } });
      await prisma.user.deleteMany({ where: { id: { in: [ownUser.id, foreignUser.id] } } });
    }
  });
});
