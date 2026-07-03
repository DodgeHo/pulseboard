import { Scalar } from '@scalar/hono-api-reference';
import {
  apiKeyInputSchema,
  incidentUpdateSchema,
  projectInputSchema,
  serviceInputSchema,
  uptimeCheckInputSchema,
  webhookIngestSchema,
  workspaceInputSchema,
} from '@pulseboard/core';
import { prisma } from '@pulseboard/db';
import type { Prisma } from '@pulseboard/db';
import { createQueues } from '@pulseboard/queues';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Redis } from 'ioredis';
import { randomBytes } from 'node:crypto';

import { apiKeyAuth, hashApiKey } from './auth.js';
import type { ApiVariables } from './auth.js';
import { logger } from './logger.js';
import { openApiDocument } from './openapi.js';
import { createWriteRateLimit } from './rate-limit.js';
import { requestContext } from './request-context.js';
import { errorResponse } from './responses.js';
import { parseJson } from './validation.js';

let queueSingleton: ReturnType<typeof createQueues> | null = null;

function queues() {
  queueSingleton ??= createQueues();
  return queueSingleton;
}

export async function closeAppResources() {
  if (!queueSingleton) return;

  await Promise.all([
    queueSingleton.uptimeChecks.close(),
    queueSingleton.notifications.close(),
  ]);
  queueSingleton = null;
}

async function writeAudit(input: {
  action:
    | 'CREATED'
    | 'UPDATED'
    | 'DELETED'
    | 'INGESTED'
    | 'INCIDENT_ACKNOWLEDGED'
    | 'INCIDENT_RESOLVED';
  entityType: string;
  entityId: string;
  message: string;
  workspaceId?: string | null;
  actorId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      actorType: input.actorId ? 'user' : 'system',
      actorId: input.actorId,
      message: input.message,
      workspaceId: input.workspaceId ?? undefined,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

async function recordUsageMetric(input: { workspaceId: string; name: string; value?: number }) {
  await prisma.usageMetric.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      value: input.value ?? 1,
    },
  });
}

export function createApp() {
  const app = new Hono<{ Variables: ApiVariables }>();

  app.use('*', cors());
  app.use('*', requestContext);

  app.get('/', (c) => c.json({ name: 'PulseBoard API', docs: '/docs' }));
  app.get('/openapi.json', (c) => c.json(openApiDocument));
  app.get(
    '/docs',
    Scalar({
      url: '/openapi.json',
      theme: 'saturn',
      pageTitle: 'PulseBoard API Reference',
    }),
  );

  app.get('/health/live', (c) =>
    c.json({
      status: 'ok',
      service: 'pulseboard-api',
      checkedAt: new Date().toISOString(),
    }),
  );

  app.get('/health/ready', async (c) => {
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    try {
      await prisma.$queryRaw`SELECT 1`;
      await redis.connect();
      await redis.ping();
      return c.json({ status: 'ready' });
    } catch (error) {
      logger.warn({ error }, 'readiness check failed');
      return c.json({ status: 'not_ready', requestId: c.var.requestId }, 503);
    } finally {
      redis.disconnect();
    }
  });

  app.use('/v1/*', apiKeyAuth);
  app.use('/v1/*', createWriteRateLimit());

  app.get('/v1/api-keys', async (c) => {
    const keys = await prisma.apiKey.findMany({
      where: { userId: c.get('userId') },
      select: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return c.json({ data: keys });
  });

  app.post('/v1/api-keys', async (c) => {
    const input = await parseJson(c, apiKeyInputSchema);
    if (input instanceof Response) return input;

    const key = `pb_${randomBytes(24).toString('base64url')}`;
    const created = await prisma.apiKey.create({
      data: {
        name: input.name,
        prefix: key.slice(0, 10),
        keyHash: hashApiKey(key),
        userId: c.get('userId'),
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
      },
    });

    return c.json({ data: { ...created, key } }, 201);
  });

  app.delete('/v1/api-keys/:id', async (c) => {
    const key = await prisma.apiKey.findFirst({
      where: {
        id: c.req.param('id'),
        userId: c.get('userId'),
      },
    });
    if (!key) return errorResponse(c, 404, 'API key not found.');

    const revoked = await prisma.apiKey.update({
      where: { id: key.id },
      data: { revokedAt: new Date() },
      select: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
      },
    });
    return c.json({ data: revoked });
  });

  app.get('/v1/workspaces', async (c) => {
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: c.get('userId') } } },
      orderBy: { createdAt: 'asc' },
    });
    return c.json({ data: workspaces });
  });

  app.post('/v1/workspaces', async (c) => {
    const input = await parseJson(c, workspaceInputSchema);
    if (input instanceof Response) return input;

    const workspace = await prisma.workspace.create({
      data: {
        ...input,
        members: { create: { userId: c.get('userId'), role: 'owner' } },
      },
    });
    await writeAudit({
      action: 'CREATED',
      entityType: 'workspace',
      entityId: workspace.id,
      workspaceId: workspace.id,
      actorId: c.get('userId'),
      message: `Workspace ${workspace.slug} was created.`,
    });
    return c.json({ data: workspace }, 201);
  });

  app.get('/v1/workspaces/:id', async (c) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: c.req.param('id'), members: { some: { userId: c.get('userId') } } },
      include: { projects: true },
    });
    if (!workspace) return errorResponse(c, 404, 'Workspace not found.');
    return c.json({ data: workspace });
  });

  app.patch('/v1/workspaces/:id', async (c) => {
    const input = await parseJson(c, workspaceInputSchema.partial());
    if (input instanceof Response) return input;

    const existing = await prisma.workspace.findFirst({
      where: { id: c.req.param('id'), members: { some: { userId: c.get('userId') } } },
    });
    if (!existing) return errorResponse(c, 404, 'Workspace not found.');

    const workspace = await prisma.workspace.update({ where: { id: existing.id }, data: input });
    await writeAudit({
      action: 'UPDATED',
      entityType: 'workspace',
      entityId: workspace.id,
      workspaceId: workspace.id,
      actorId: c.get('userId'),
      message: `Workspace ${workspace.slug} was updated.`,
    });
    return c.json({ data: workspace });
  });

  app.delete('/v1/workspaces/:id', async (c) => {
    const existing = await prisma.workspace.findFirst({
      where: { id: c.req.param('id'), members: { some: { userId: c.get('userId') } } },
    });
    if (!existing) return errorResponse(c, 404, 'Workspace not found.');

    await prisma.workspace.delete({ where: { id: existing.id } });
    return c.json({ data: { id: existing.id, deleted: true } });
  });

  app.get('/v1/workspaces/:workspaceId/projects', async (c) => {
    const projects = await prisma.project.findMany({
      where: { workspaceId: c.req.param('workspaceId'), workspace: { members: { some: { userId: c.get('userId') } } } },
      orderBy: { createdAt: 'asc' },
    });
    return c.json({ data: projects });
  });

  app.post('/v1/workspaces/:workspaceId/projects', async (c) => {
    const input = await parseJson(c, projectInputSchema);
    if (input instanceof Response) return input;

    const workspace = await prisma.workspace.findFirst({
      where: { id: c.req.param('workspaceId'), members: { some: { userId: c.get('userId') } } },
    });
    if (!workspace) return errorResponse(c, 404, 'Workspace not found.');

    const project = await prisma.project.create({ data: { ...input, workspaceId: workspace.id } });
    await writeAudit({
      action: 'CREATED',
      entityType: 'project',
      entityId: project.id,
      workspaceId: workspace.id,
      actorId: c.get('userId'),
      message: `Project ${project.slug} was created.`,
    });
    await recordUsageMetric({ workspaceId: workspace.id, name: 'projects_created' });
    return c.json({ data: project }, 201);
  });

  app.get('/v1/projects/:id', async (c) => {
    const project = await prisma.project.findFirst({
      where: { id: c.req.param('id'), workspace: { members: { some: { userId: c.get('userId') } } } },
      include: { services: true },
    });
    if (!project) return errorResponse(c, 404, 'Project not found.');
    return c.json({ data: project });
  });

  app.patch('/v1/projects/:id', async (c) => {
    const input = await parseJson(c, projectInputSchema.partial());
    if (input instanceof Response) return input;

    const project = await prisma.project.findFirst({
      where: { id: c.req.param('id'), workspace: { members: { some: { userId: c.get('userId') } } } },
    });
    if (!project) return errorResponse(c, 404, 'Project not found.');

    const updated = await prisma.project.update({ where: { id: project.id }, data: input });
    await writeAudit({
      action: 'UPDATED',
      entityType: 'project',
      entityId: updated.id,
      workspaceId: updated.workspaceId,
      actorId: c.get('userId'),
      message: `Project ${updated.slug} was updated.`,
    });
    return c.json({ data: updated });
  });

  app.delete('/v1/projects/:id', async (c) => {
    const project = await prisma.project.findFirst({
      where: { id: c.req.param('id'), workspace: { members: { some: { userId: c.get('userId') } } } },
    });
    if (!project) return errorResponse(c, 404, 'Project not found.');

    await prisma.project.delete({ where: { id: project.id } });
    await writeAudit({
      action: 'DELETED',
      entityType: 'project',
      entityId: project.id,
      workspaceId: project.workspaceId,
      actorId: c.get('userId'),
      message: `Project ${project.slug} was deleted.`,
    });
    return c.json({ data: { id: project.id, deleted: true } });
  });

  app.get('/v1/projects/:projectId/services', async (c) => {
    const services = await prisma.monitoredService.findMany({
      where: { projectId: c.req.param('projectId'), project: { workspace: { members: { some: { userId: c.get('userId') } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return c.json({ data: services });
  });

  app.post('/v1/projects/:projectId/services', async (c) => {
    const input = await parseJson(c, serviceInputSchema);
    if (input instanceof Response) return input;

    const project = await prisma.project.findFirst({
      where: { id: c.req.param('projectId'), workspace: { members: { some: { userId: c.get('userId') } } } },
    });
    if (!project) return errorResponse(c, 404, 'Project not found.');

    const service = await prisma.monitoredService.create({ data: { ...input, projectId: project.id } });
    await writeAudit({
      action: 'CREATED',
      entityType: 'service',
      entityId: service.id,
      workspaceId: project.workspaceId,
      actorId: c.get('userId'),
      message: `Service ${service.slug} was created.`,
    });
    await recordUsageMetric({ workspaceId: project.workspaceId, name: 'services_created' });
    return c.json({ data: service }, 201);
  });

  app.get('/v1/services/:id', async (c) => {
    const service = await prisma.monitoredService.findFirst({
      where: { id: c.req.param('id'), project: { workspace: { members: { some: { userId: c.get('userId') } } } } },
      include: { uptimeChecks: true, incidents: true },
    });
    if (!service) return errorResponse(c, 404, 'Service not found.');
    return c.json({ data: service });
  });

  app.patch('/v1/services/:id', async (c) => {
    const input = await parseJson(c, serviceInputSchema.partial());
    if (input instanceof Response) return input;

    const service = await prisma.monitoredService.findFirst({
      where: { id: c.req.param('id'), project: { workspace: { members: { some: { userId: c.get('userId') } } } } },
      include: { project: true },
    });
    if (!service) return errorResponse(c, 404, 'Service not found.');

    const updated = await prisma.monitoredService.update({ where: { id: service.id }, data: input });
    await writeAudit({
      action: 'UPDATED',
      entityType: 'service',
      entityId: updated.id,
      workspaceId: service.project.workspaceId,
      actorId: c.get('userId'),
      message: `Service ${updated.slug} was updated.`,
    });
    return c.json({ data: updated });
  });

  app.delete('/v1/services/:id', async (c) => {
    const service = await prisma.monitoredService.findFirst({
      where: { id: c.req.param('id'), project: { workspace: { members: { some: { userId: c.get('userId') } } } } },
      include: { project: true },
    });
    if (!service) return errorResponse(c, 404, 'Service not found.');

    const updated = await prisma.monitoredService.update({
      where: { id: service.id },
      data: { status: 'ARCHIVED' },
    });
    await writeAudit({
      action: 'DELETED',
      entityType: 'service',
      entityId: updated.id,
      workspaceId: service.project.workspaceId,
      actorId: c.get('userId'),
      message: `Service ${updated.slug} was archived.`,
    });
    return c.json({ data: updated });
  });

  app.get('/v1/services/:serviceId/uptime-checks', async (c) => {
    const checks = await prisma.uptimeCheck.findMany({
      where: { serviceId: c.req.param('serviceId'), service: { project: { workspace: { members: { some: { userId: c.get('userId') } } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return c.json({ data: checks });
  });

  app.post('/v1/services/:serviceId/uptime-checks', async (c) => {
    const input = await parseJson(c, uptimeCheckInputSchema);
    if (input instanceof Response) return input;

    const service = await prisma.monitoredService.findFirst({
      where: { id: c.req.param('serviceId'), project: { workspace: { members: { some: { userId: c.get('userId') } } } } },
      include: { project: true },
    });
    if (!service) return errorResponse(c, 404, 'Service not found.');

    const uptimeCheck = await prisma.uptimeCheck.create({
      data: { ...input, serviceId: service.id, nextRunAt: new Date() },
    });
    await queues().uptimeChecks.add('perform-check', { uptimeCheckId: uptimeCheck.id });
    await writeAudit({
      action: 'CREATED',
      entityType: 'uptime_check',
      entityId: uptimeCheck.id,
      workspaceId: service.project.workspaceId,
      actorId: c.get('userId'),
      message: `Uptime check ${uptimeCheck.name} was created and queued.`,
    });
    await recordUsageMetric({ workspaceId: service.project.workspaceId, name: 'uptime_checks_configured' });
    return c.json({ data: uptimeCheck }, 201);
  });

  app.get('/v1/uptime-checks/:id', async (c) => {
    const check = await prisma.uptimeCheck.findFirst({
      where: { id: c.req.param('id'), service: { project: { workspace: { members: { some: { userId: c.get('userId') } } } } } },
      include: { checkRuns: { orderBy: { checkedAt: 'desc' }, take: 10 } },
    });
    if (!check) return errorResponse(c, 404, 'Uptime check not found.');
    return c.json({ data: check });
  });

  app.patch('/v1/uptime-checks/:id', async (c) => {
    const input = await parseJson(c, uptimeCheckInputSchema.partial());
    if (input instanceof Response) return input;

    const check = await prisma.uptimeCheck.findFirst({
      where: { id: c.req.param('id'), service: { project: { workspace: { members: { some: { userId: c.get('userId') } } } } } },
      include: { service: { include: { project: true } } },
    });
    if (!check) return errorResponse(c, 404, 'Uptime check not found.');

    const updated = await prisma.uptimeCheck.update({ where: { id: check.id }, data: input });
    await writeAudit({
      action: 'UPDATED',
      entityType: 'uptime_check',
      entityId: updated.id,
      workspaceId: check.service.project.workspaceId,
      actorId: c.get('userId'),
      message: `Uptime check ${updated.name} was updated.`,
    });
    return c.json({ data: updated });
  });

  app.delete('/v1/uptime-checks/:id', async (c) => {
    const check = await prisma.uptimeCheck.findFirst({
      where: { id: c.req.param('id'), service: { project: { workspace: { members: { some: { userId: c.get('userId') } } } } } },
      include: { service: { include: { project: true } } },
    });
    if (!check) return errorResponse(c, 404, 'Uptime check not found.');

    const updated = await prisma.uptimeCheck.update({ where: { id: check.id }, data: { isActive: false } });
    await writeAudit({
      action: 'DELETED',
      entityType: 'uptime_check',
      entityId: updated.id,
      workspaceId: check.service.project.workspaceId,
      actorId: c.get('userId'),
      message: `Uptime check ${updated.name} was disabled.`,
    });
    return c.json({ data: updated });
  });

  app.get('/v1/incidents', async (c) => {
    const status = c.req.query('status') as 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | undefined;
    const incidents = await prisma.incident.findMany({
      where: {
        status,
        service: { project: { workspace: { members: { some: { userId: c.get('userId') } } } } },
      },
      include: { service: true },
      orderBy: { openedAt: 'desc' },
      take: 100,
    });
    return c.json({ data: incidents });
  });

  app.get('/v1/incidents/:id', async (c) => {
    const incident = await prisma.incident.findFirst({
      where: { id: c.req.param('id'), service: { project: { workspace: { members: { some: { userId: c.get('userId') } } } } } },
      include: { service: true, notifications: true },
    });
    if (!incident) return errorResponse(c, 404, 'Incident not found.');
    return c.json({ data: incident });
  });

  app.patch('/v1/incidents/:id', async (c) => {
    const input = await parseJson(c, incidentUpdateSchema);
    if (input instanceof Response) return input;

    const incident = await prisma.incident.findFirst({
      where: { id: c.req.param('id'), service: { project: { workspace: { members: { some: { userId: c.get('userId') } } } } } },
      include: { service: { include: { project: true } } },
    });
    if (!incident) return errorResponse(c, 404, 'Incident not found.');

    const statusDates =
      input.status === 'ACKNOWLEDGED'
        ? { acknowledgedAt: new Date() }
        : input.status === 'RESOLVED'
          ? { resolvedAt: new Date() }
          : {};
    const updated = await prisma.incident.update({
      where: { id: incident.id },
      data: { ...input, ...statusDates },
    });
    await writeAudit({
      action: input.status === 'RESOLVED' ? 'INCIDENT_RESOLVED' : input.status === 'ACKNOWLEDGED' ? 'INCIDENT_ACKNOWLEDGED' : 'UPDATED',
      entityType: 'incident',
      entityId: updated.id,
      workspaceId: incident.service.project.workspaceId,
      actorId: c.get('userId'),
      message: `Incident ${updated.id} changed to ${updated.status}.`,
    });
    return c.json({ data: updated });
  });

  app.post('/v1/webhooks/events', async (c) => {
    const input = await parseJson(c, webhookIngestSchema);
    if (input instanceof Response) return input;

    const workspace = await prisma.workspace.findFirst({
      where: { id: input.workspaceId, members: { some: { userId: c.get('userId') } } },
    });
    if (!workspace) return errorResponse(c, 404, 'Workspace not found.');

    const event = await prisma.webhookEvent.create({
      data: {
        workspaceId: workspace.id,
        source: input.source,
        eventType: input.eventType,
        externalId: input.externalId,
        payload: input.payload as Prisma.InputJsonValue,
        processedAt: new Date(),
      },
    });
    await writeAudit({
      action: 'INGESTED',
      entityType: 'webhook_event',
      entityId: event.id,
      workspaceId: workspace.id,
      actorId: c.get('userId'),
      message: `Webhook event ${input.eventType} was ingested from ${input.source}.`,
      metadata: { externalId: input.externalId },
    });
    await recordUsageMetric({ workspaceId: workspace.id, name: 'webhook_events_ingested' });
    return c.json({ data: event }, 202);
  });

  app.get('/v1/usage-metrics', async (c) => {
    const workspaceId = c.req.query('workspaceId');
    const metrics = await prisma.usageMetric.findMany({
      where: {
        workspace: {
          ...(workspaceId ? { id: workspaceId } : {}),
          members: { some: { userId: c.get('userId') } },
        },
      },
      orderBy: { recordedAt: 'desc' },
      take: 200,
    });
    return c.json({ data: metrics });
  });

  app.get('/v1/audit-logs', async (c) => {
    const workspaceId = c.req.query('workspaceId');
    const logs = await prisma.auditLog.findMany({
      where: {
        workspace: {
          ...(workspaceId ? { id: workspaceId } : {}),
          members: { some: { userId: c.get('userId') } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return c.json({ data: logs });
  });

  app.onError((error, c) => {
    logger.error({ error, requestId: c.var.requestId }, 'request failed');
    return errorResponse(c, 500, 'Internal server error.');
  });

  app.notFound((c) => errorResponse(c, 404, 'Not found.'));

  return app;
}
