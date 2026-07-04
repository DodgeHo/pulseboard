import type { PrismaClient } from '@pulseboard/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createWorkerHandlers, type HttpCheckRunner, type WorkerQueues } from '../src/handlers.js';

const baseCheck = {
  id: 'check_1',
  name: 'Primary health endpoint',
  method: 'GET',
  url: 'https://api.example.test/health',
  expectedStatus: 200,
  timeoutMs: 1_000,
  intervalSeconds: 60,
  consecutiveFailuresToOpen: 2,
  consecutiveSuccessesToResolve: 1,
  isActive: true,
  serviceId: 'service_1',
  service: {
    id: 'service_1',
    name: 'API',
    status: 'ACTIVE',
    project: {
      workspaceId: 'workspace_1',
    },
  },
};

function createQueuesStub() {
  return {
    uptimeChecks: {
      add: vi.fn().mockResolvedValue(undefined),
    },
    notifications: {
      add: vi.fn().mockResolvedValue(undefined),
    },
  } satisfies WorkerQueues;
}

function createPrismaStub(options: {
  recentStatuses: Array<'UP' | 'DOWN' | 'DEGRADED'>;
  openIncident?: { id: string; title: string; status: 'OPEN' | 'ACKNOWLEDGED' };
}) {
  return {
    uptimeCheck: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(baseCheck),
      update: vi.fn().mockResolvedValue(baseCheck),
    },
    checkRun: {
      create: vi.fn().mockResolvedValue({ id: 'run_1' }),
      findMany: vi.fn().mockResolvedValue(options.recentStatuses.map((status) => ({ status }))),
    },
    incident: {
      findFirst: vi.fn().mockResolvedValue(options.openIncident ?? null),
      create: vi.fn().mockImplementation(async ({ data }) => ({
        id: 'incident_1',
        title: data.title,
        status: 'OPEN',
      })),
      update: vi.fn().mockImplementation(async ({ where, data }) => ({
        id: where.id,
        title: options.openIncident?.title ?? 'Recovered incident',
        status: data.status,
      })),
    },
    notification: {
      create: vi.fn().mockResolvedValue({ id: 'notification_1' }),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'audit_1' }),
    },
    usageMetric: {
      create: vi.fn().mockResolvedValue({ id: 'usage_1' }),
    },
  } as unknown as PrismaClient;
}

function createHandlers(input: {
  prisma: PrismaClient;
  queues: WorkerQueues;
  runHttpCheck: HttpCheckRunner;
}) {
  return createWorkerHandlers({
    logger: { info: vi.fn() },
    schedulerIntervalMs: 60_000,
    ...input,
  });
}

describe('worker handlers', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('opens an incident and queues a notification after consecutive failures', async () => {
    const prisma = createPrismaStub({ recentStatuses: ['DOWN', 'DOWN'] });
    const queues = createQueuesStub();
    const runHttpCheck = vi.fn().mockResolvedValue({
      status: 'DOWN',
      statusCode: 503,
      latencyMs: 250,
      errorMessage: 'Service unavailable',
    }) satisfies HttpCheckRunner;
    const handlers = createHandlers({ prisma, queues, runHttpCheck });

    await handlers.performCheck('check_1');

    expect(runHttpCheck).toHaveBeenCalledWith({
      method: 'GET',
      url: baseCheck.url,
      expectedStatus: 200,
      timeoutMs: 1_000,
    });
    expect(prisma.incident.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        serviceId: 'service_1',
        severity: 'major',
        title: 'API is failing Primary health endpoint',
      }),
    });
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        channel: 'EMAIL',
        incidentId: 'incident_1',
        target: 'ops@example.com',
      }),
    });
    expect(queues.notifications.add).toHaveBeenCalledWith('send-notification', { notificationId: 'notification_1' });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'INCIDENT_OPENED',
        entityId: 'incident_1',
        workspaceId: 'workspace_1',
      }),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'CHECK_RAN',
        entityId: 'check_1',
        metadata: expect.objectContaining({ statusCode: 503 }),
      }),
    });
    expect(prisma.usageMetric.create).toHaveBeenCalledWith({
      data: {
        workspaceId: 'workspace_1',
        name: 'uptime_checks_performed',
        value: 1,
      },
    });
  });

  it('resolves an open incident and queues a recovery notification after successful checks', async () => {
    const prisma = createPrismaStub({
      recentStatuses: ['UP'],
      openIncident: { id: 'incident_open', title: 'API outage', status: 'ACKNOWLEDGED' },
    });
    const queues = createQueuesStub();
    const runHttpCheck = vi.fn().mockResolvedValue({
      status: 'UP',
      statusCode: 200,
      latencyMs: 42,
    }) satisfies HttpCheckRunner;
    const handlers = createHandlers({ prisma, queues, runHttpCheck });

    await handlers.performCheck('check_1');

    expect(prisma.incident.update).toHaveBeenCalledWith({
      where: { id: 'incident_open' },
      data: expect.objectContaining({
        status: 'RESOLVED',
        resolvedAt: expect.any(Date),
      }),
    });
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        channel: 'SLACK',
        incidentId: 'incident_open',
        target: '#ops-demo',
      }),
    });
    expect(queues.notifications.add).toHaveBeenCalledWith('send-notification', { notificationId: 'notification_1' });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'INCIDENT_RESOLVED',
        entityId: 'incident_open',
        workspaceId: 'workspace_1',
      }),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'CHECK_RAN',
        entityId: 'check_1',
        metadata: expect.objectContaining({ statusCode: 200 }),
      }),
    });
  });
});
