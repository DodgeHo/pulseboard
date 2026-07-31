import type { PrismaClient } from '@pulseboard/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createWorkerHandlers,
  NotificationDeliveryError,
  type HttpCheckRunner,
  type NotificationProvider,
  type WorkerQueues,
} from '../src/handlers.js';

const fixedNow = new Date('2026-07-30T12:00:00.000Z');
const baseCheck = {
  id: 'check_1', name: 'Primary health endpoint', method: 'GET', url: 'https://api.example.test/health',
  expectedStatus: 200, timeoutMs: 1_000, intervalSeconds: 60, consecutiveFailuresToOpen: 2,
  consecutiveSuccessesToResolve: 1, isActive: true, serviceId: 'service_1',
  service: { id: 'service_1', name: 'API', status: 'ACTIVE', project: { workspaceId: 'workspace_1' } },
};
const baseExecution = {
  id: 'execution_1', idempotencyKey: 'check:check_1:2026-07-30T12:00:00.000Z', status: 'RUNNING',
  attemptCount: 1, uptimeCheck: baseCheck,
};

function createQueuesStub() {
  return {
    uptimeChecks: { add: vi.fn().mockResolvedValue(undefined) },
    notifications: { add: vi.fn().mockResolvedValue(undefined) },
  } satisfies WorkerQueues;
}

function createPrismaStub(options: {
  recentStatuses?: Array<'UP' | 'DOWN' | 'DEGRADED'>;
  openIncident?: { id: string; title: string; status: 'OPEN' | 'ACKNOWLEDGED' } | null;
  claimResults?: number[];
  dueChecks?: Array<{ id: string; intervalSeconds: number; nextRunAt: Date }>;
  pendingExecutions?: Array<{ id: string }>;
  notification?: Record<string, unknown> | null;
} = {}) {
  const claimResults = [...(options.claimResults ?? [1])];
  const prisma: Record<string, any> = {
    $queryRaw: vi.fn().mockResolvedValue([{ id: 'service_1' }]),
    uptimeCheck: {
      findMany: vi.fn().mockResolvedValue(options.dueChecks ?? []),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    checkExecution: {
      updateMany: vi.fn().mockImplementation(async (args) => {
        if (args.data?.status === 'RUNNING') return { count: claimResults.shift() ?? 0 };
        return { count: 1 };
      }),
      findUnique: vi.fn().mockResolvedValue(baseExecution),
      findMany: vi.fn().mockResolvedValue(options.pendingExecutions ?? []),
      upsert: vi.fn().mockResolvedValue(baseExecution),
      update: vi.fn().mockResolvedValue(baseExecution),
    },
    checkRun: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'run_1' }),
      findMany: vi.fn().mockResolvedValue((options.recentStatuses ?? ['UP']).map((status) => ({ status }))),
    },
    incident: {
      findFirst: vi.fn().mockResolvedValue(options.openIncident ?? null),
      create: vi.fn().mockImplementation(async ({ data }) => ({ id: 'incident_1', title: data.title, status: 'OPEN' })),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: options.openIncident?.id ?? 'incident_1', title: 'Recovered', status: 'RESOLVED' }),
    },
    notification: {
      create: vi.fn().mockResolvedValue({ id: 'notification_1' }),
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockResolvedValue(options.notification ?? null),
      update: vi.fn().mockResolvedValue({ id: 'notification_1' }),
    },
    notificationAttempt: { create: vi.fn().mockResolvedValue({ id: 'attempt_1' }) },
    auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit_1' }) },
    usageMetric: { create: vi.fn().mockResolvedValue({ id: 'usage_1' }) },
  };
  prisma.$transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback(prisma));
  return prisma as unknown as PrismaClient;
}

function createHandlers(input: {
  prisma: PrismaClient;
  queues?: WorkerQueues;
  runHttpCheck?: HttpCheckRunner;
  notificationProvider?: NotificationProvider;
  testHooks?: { afterCheckRunPersisted?: () => Promise<void> };
}) {
  return createWorkerHandlers({
    logger: { info: vi.fn(), warn: vi.fn() }, schedulerIntervalMs: 60_000, workerId: 'worker_1', now: () => fixedNow,
    queues: input.queues ?? createQueuesStub(),
    runHttpCheck: input.runHttpCheck ?? vi.fn().mockResolvedValue({ status: 'UP', statusCode: 200, latencyMs: 12 }),
    ...input,
  });
}

function notificationFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'notification_1', channel: 'WEBHOOK', target: 'https://hooks.example.test/pulseboard', payload: { incidentId: 'incident_1' },
    status: 'PROCESSING', attemptCount: 0, cycleAttemptCount: 0, maxAttempts: 3,
    incident: { service: { project: { workspaceId: 'workspace_1' } } },
    ...overrides,
  };
}

describe('worker reliability handlers', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('atomically records a healthy check result and its idempotent audit/usage records', async () => {
    const prisma = createPrismaStub({ recentStatuses: ['UP'] });
    await createHandlers({ prisma }).performCheck('execution_1');

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.checkRun.create).toHaveBeenCalledWith({ data: expect.objectContaining({ idempotencyKey: baseExecution.idempotencyKey, status: 'UP' }) });
    expect(prisma.incident.create).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({ idempotencyKey: 'audit:check-ran:run_1', action: 'CHECK_RAN' }) });
    expect(prisma.usageMetric.create).toHaveBeenCalledWith({ data: expect.objectContaining({ idempotencyKey: 'usage:check-ran:run_1' }) });
  });

  it('opens one incident and durable notification after the unhealthy threshold', async () => {
    const prisma = createPrismaStub({ recentStatuses: ['DOWN', 'DOWN'] });
    const queues = createQueuesStub();
    const runHttpCheck = vi.fn().mockResolvedValue({ status: 'DOWN', statusCode: 503, latencyMs: 25, errorMessage: 'unavailable' });
    await createHandlers({ prisma, queues, runHttpCheck }).performCheck('execution_1');

    expect(prisma.incident.create).toHaveBeenCalledWith({ data: expect.objectContaining({ openIdempotencyKey: 'incident:open:run_1' }) });
    expect(prisma.notification.create).toHaveBeenCalledWith({ data: expect.objectContaining({ idempotencyKey: 'notification:incident-opened:incident_1' }) });
    expect(queues.notifications.add).toHaveBeenCalledWith('send-notification', { notificationId: 'notification_1' }, { jobId: 'notification-notification_1-1' });
  });

  it('resolves an active incident in the same transaction as its notification and audit', async () => {
    const prisma = createPrismaStub({ recentStatuses: ['UP'], openIncident: { id: 'incident_open', title: 'API down', status: 'OPEN' } });
    await createHandlers({ prisma }).performCheck('execution_1');

    expect(prisma.incident.updateMany).toHaveBeenCalledWith({ where: { id: 'incident_open', status: { in: ['OPEN', 'ACKNOWLEDGED'] } }, data: expect.objectContaining({ status: 'RESOLVED', resolveIdempotencyKey: 'incident:resolve:run_1' }) });
    expect(prisma.notification.create).toHaveBeenCalledWith({ data: expect.objectContaining({ idempotencyKey: 'notification:incident-resolved:incident_open' }) });
  });

  it('lets only one concurrent worker claim an execution', async () => {
    const prisma = createPrismaStub({ claimResults: [1, 0] });
    const runHttpCheck = vi.fn().mockResolvedValue({ status: 'UP', statusCode: 200, latencyMs: 10 });
    const handlers = createHandlers({ prisma, runHttpCheck });
    await Promise.all([handlers.performCheck('execution_1'), handlers.performCheck('execution_1')]);
    expect(runHttpCheck).toHaveBeenCalledTimes(1);
    expect(prisma.checkRun.create).toHaveBeenCalledTimes(1);
  });

  it('uses compare-and-swap scheduling and a stable execution job id', async () => {
    const scheduledFor = new Date('2026-07-30T11:59:00.000Z');
    const prisma = createPrismaStub({
      dueChecks: [{ id: 'check_1', intervalSeconds: 60, nextRunAt: scheduledFor }],
      pendingExecutions: [{ id: 'execution_1' }],
    });
    const queues = createQueuesStub();
    await createHandlers({ prisma, queues }).runDueChecks();

    expect(prisma.uptimeCheck.updateMany).toHaveBeenCalledWith({
      where: { id: 'check_1', isActive: true, nextRunAt: scheduledFor },
      data: { nextRunAt: fixedNow },
    });
    expect(prisma.checkExecution.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { idempotencyKey: 'check:check_1:2026-07-30T11:59:00.000Z' },
    }));
    expect(queues.uptimeChecks.add).toHaveBeenCalledWith('perform-check', { executionId: 'execution_1' }, { jobId: 'check-execution-execution_1' });
  });

  it('records a temporary notification failure and schedules a retry', async () => {
    const prisma = createPrismaStub({ notification: notificationFixture() });
    const provider = vi.fn().mockRejectedValue(new NotificationDeliveryError('temporary outage'));
    await createHandlers({ prisma, notificationProvider: provider }).sendNotification('notification_1');

    expect(prisma.notificationAttempt.create).toHaveBeenCalledWith({ data: expect.objectContaining({ attemptNumber: 1, succeeded: false, errorMessage: 'temporary outage' }) });
    expect(prisma.notification.update).toHaveBeenCalledWith({ where: { id: 'notification_1' }, data: expect.objectContaining({ status: 'FAILED', cycleAttemptCount: 1, nextAttemptAt: new Date('2026-07-30T12:00:01.000Z') }) });
  });

  it('moves permanent notification failures to dead-letter', async () => {
    const prisma = createPrismaStub({ notification: notificationFixture() });
    const provider = vi.fn().mockRejectedValue(new NotificationDeliveryError('invalid endpoint', true, 400));
    await createHandlers({ prisma, notificationProvider: provider }).sendNotification('notification_1');

    expect(prisma.notification.update).toHaveBeenCalledWith({ where: { id: 'notification_1' }, data: expect.objectContaining({ status: 'DEAD_LETTER', deadLetteredAt: fixedNow }) });
  });

  it('releases the execution when the external probe throws before persistence', async () => {
    const prisma = createPrismaStub();
    const handlers = createHandlers({
      prisma,
      runHttpCheck: vi.fn().mockRejectedValue(new Error('probe crashed')),
    });

    await expect(handlers.performCheck('execution_1')).rejects.toThrow('probe crashed');
    expect(prisma.checkRun.create).not.toHaveBeenCalled();
    expect(prisma.checkExecution.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'execution_1', status: 'RUNNING', leaseOwner: 'worker_1' },
      data: { status: 'PENDING', leaseOwner: null, leaseExpiresAt: null, lastError: 'probe crashed' },
    });
  });

  it('does not continue the transaction after an injected mid-flight failure and releases the execution for retry', async () => {
    const prisma = createPrismaStub({ recentStatuses: ['DOWN', 'DOWN'] });
    const handlers = createHandlers({
      prisma,
      runHttpCheck: vi.fn().mockResolvedValue({ status: 'DOWN', statusCode: 503, latencyMs: 1 }),
      testHooks: { afterCheckRunPersisted: vi.fn().mockRejectedValue(new Error('simulated transaction failure')) },
    });

    await expect(handlers.performCheck('execution_1')).rejects.toThrow('simulated transaction failure');
    expect(prisma.incident.create).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
    expect(prisma.checkExecution.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'execution_1', status: 'RUNNING', leaseOwner: 'worker_1' },
      data: { status: 'PENDING', leaseOwner: null, leaseExpiresAt: null, lastError: 'simulated transaction failure' },
    });
  });
});
