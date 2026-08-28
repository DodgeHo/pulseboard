import { randomUUID } from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { prisma } from '@pulseboard/db';
import { checkExecutionDispatchJobId, createRedisConnection } from '@pulseboard/queues';
import { Queue } from 'bullmq';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

import { createWorkerHandlers } from '../src/handlers.js';

const shouldRunIntegration = process.env.RUN_WORKER_INTEGRATION_TESTS === 'true';
const integrationDescribe = shouldRunIntegration ? describe : describe.skip;
const fixturePath = fileURLToPath(new URL('./fixtures/recovery-worker.ts', import.meta.url));

interface ManagedChild {
  child: ChildProcess;
  output: () => string;
  waitForMarker: (marker: string, timeoutMs?: number) => Promise<void>;
}

const children = new Set<ChildProcess>();
let uptimeQueue: Queue | undefined;
let notificationQueue: Queue | undefined;
let workspaceId: string | undefined;

function startFixture(
  mode: 'crash' | 'recover' | 'graceful',
  input: { executionId: string; uptimeQueueName: string; notificationQueueName: string },
): ManagedChild {
  const child = spawn(process.execPath, ['--import', 'tsx', fixturePath], {
    env: {
      ...process.env,
      RECOVERY_WORKER_MODE: mode,
      RECOVERY_EXECUTION_ID: input.executionId,
      RECOVERY_UPTIME_QUEUE: input.uptimeQueueName,
      RECOVERY_NOTIFICATION_QUEUE: input.notificationQueueName,
      RECOVERY_CHECK_LEASE_MS: '1200',
      RECOVERY_LOCK_DURATION_MS: '400',
      RECOVERY_STALLED_INTERVAL_MS: '100',
      RECOVERY_SHUTDOWN_TIMEOUT_MS: '2000',
      RECOVERY_GRACEFUL_HOOK_DELAY_MS: '300',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.add(child);
  child.once('exit', () => children.delete(child));

  let output = '';
  child.stdout?.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr?.on('data', (chunk) => { output += chunk.toString(); });

  return {
    child,
    output: () => output,
    waitForMarker: async (marker, timeoutMs = 10_000) => {
      const startedAt = Date.now();
      while (!output.includes(marker)) {
        if (child.exitCode !== null || child.signalCode !== null) {
          throw new Error(`Worker exited before ${marker}. Output:\n${output}`);
        }
        if (Date.now() - startedAt >= timeoutMs) {
          throw new Error(`Timed out waiting for ${marker}. Output:\n${output}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    },
  };
}

async function waitForExit(managed: ManagedChild, timeoutMs = 10_000) {
  if (managed.child.exitCode !== null || managed.child.signalCode !== null) {
    return { code: managed.child.exitCode, signal: managed.child.signalCode };
  }
  return await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for worker exit. Output:\n${managed.output()}`));
    }, timeoutMs);
    managed.child.once('exit', (code, signal) => {
      clearTimeout(timeout);
      resolve({ code, signal });
    });
  });
}

async function waitUntil(assertion: () => Promise<void>, timeoutMs = 5_000) {
  const startedAt = Date.now();
  let lastError: unknown;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw lastError;
}

afterEach(async () => {
  for (const child of children) child.kill('SIGKILL');
  children.clear();

  if (uptimeQueue) {
    await uptimeQueue.obliterate({ force: true });
    await uptimeQueue.close();
    uptimeQueue = undefined;
  }
  if (notificationQueue) {
    await notificationQueue.obliterate({ force: true });
    await notificationQueue.close();
    notificationQueue = undefined;
  }

  if (workspaceId) {
    const incidents = await prisma.incident.findMany({
      where: { service: { project: { workspaceId } } },
      select: { id: true },
    });
    await prisma.notification.deleteMany({ where: { incidentId: { in: incidents.map((incident) => incident.id) } } });
    await prisma.workspace.deleteMany({ where: { id: workspaceId } });
    workspaceId = undefined;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

integrationDescribe('worker crash recovery', () => {
  it('rolls back a mid-transaction crash and later commits exactly one incident flow', async () => {
    const suffix = randomUUID();
    const testStartedAt = new Date();
    const scheduledFor = new Date(testStartedAt.getTime() + 10 * 60_000);
    const schedulerScanTime = new Date(testStartedAt.getTime() + 11 * 60_000);
    const uptimeQueueName = `uptime-recovery-${suffix}`;
    const notificationQueueName = `notification-recovery-${suffix}`;
    uptimeQueue = new Queue(uptimeQueueName, {
      connection: createRedisConnection(),
      defaultJobOptions: { attempts: 1, removeOnComplete: false, removeOnFail: false },
    });
    notificationQueue = new Queue(notificationQueueName, {
      connection: createRedisConnection(),
      defaultJobOptions: { attempts: 1, removeOnComplete: false, removeOnFail: false },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: 'Worker Recovery Test',
        slug: `worker-recovery-${suffix}`,
        projects: {
          create: {
            name: 'Recovery Project',
            slug: 'recovery-project',
            services: {
              create: {
                name: 'Recovery API',
                slug: 'recovery-api',
                baseUrl: 'https://example.test',
                uptimeChecks: {
                  create: {
                    name: 'Injected failing check',
                    method: 'GET',
                    url: 'https://example.test/health',
                    expectedStatus: 200,
                    intervalSeconds: 60,
                    timeoutMs: 500,
                    consecutiveFailuresToOpen: 1,
                    consecutiveSuccessesToResolve: 1,
                    nextRunAt: new Date(testStartedAt.getTime() + 24 * 60 * 60_000),
                  },
                },
              },
            },
          },
        },
      },
      include: {
        projects: { include: { services: { include: { uptimeChecks: true } } } },
      },
    });
    workspaceId = workspace.id;
    const service = workspace.projects[0]!.services[0]!;
    const check = service.uptimeChecks[0]!;
    const execution = await prisma.checkExecution.create({
      data: {
        uptimeCheckId: check.id,
        scheduledFor,
        idempotencyKey: `integration:worker-recovery:${suffix}`,
      },
    });

    const scheduler = createWorkerHandlers({
      prisma,
      queues: { uptimeChecks: uptimeQueue, notifications: notificationQueue },
      runHttpCheck: async () => ({ status: 'DOWN', statusCode: 503, latencyMs: 7 }),
      logger: { info: () => undefined, warn: () => undefined },
      schedulerIntervalMs: 60_000,
      // Keep the execution invisible to any default Compose worker while this test owns its unique queue.
      now: () => schedulerScanTime,
    });
    await scheduler.runDueChecks();

    const firstJobId = checkExecutionDispatchJobId(execution.id, 1);
    expect(await uptimeQueue.getJob(firstJobId)).not.toBeUndefined();

    const crashWorker = startFixture('crash', { executionId: execution.id, uptimeQueueName, notificationQueueName });
    await crashWorker.waitForMarker('CRASH_POINT_REACHED');
    const crashExit = await waitForExit(crashWorker);
    expect(crashExit).toEqual({ code: null, signal: 'SIGKILL' });

    await waitUntil(async () => {
      expect(await prisma.checkRun.count({ where: { uptimeCheckId: check.id } })).toBe(0);
      expect(await prisma.incident.count({ where: { serviceId: service.id } })).toBe(0);
      expect(await prisma.notification.count({ where: { incident: { serviceId: service.id } } })).toBe(0);
      expect(await prisma.auditLog.count({ where: { workspaceId: workspace.id } })).toBe(0);
      expect(await prisma.usageMetric.count({ where: { workspaceId: workspace.id } })).toBe(0);
    });

    const crashedExecution = await prisma.checkExecution.findUniqueOrThrow({ where: { id: execution.id } });
    expect(crashedExecution.status, crashWorker.output()).toBe('RUNNING');
    expect(crashedExecution.attemptCount).toBe(1);
    expect(crashedExecution.leaseExpiresAt).not.toBeNull();

    const recoveryWorker = startFixture('recover', { executionId: execution.id, uptimeQueueName, notificationQueueName });
    await recoveryWorker.waitForMarker('LEASE_CONTENTION_COMPLETED');
    expect(await (await uptimeQueue.getJob(firstJobId))?.getState()).toBe('completed');

    const waitForLeaseMs = Math.max(0, crashedExecution.leaseExpiresAt!.getTime() - Date.now()) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitForLeaseMs));
    await scheduler.runDueChecks();

    const secondJobId = checkExecutionDispatchJobId(execution.id, 2);
    expect(await uptimeQueue.getJob(secondJobId)).not.toBeUndefined();
    await recoveryWorker.waitForMarker('RECOVERY_SUCCEEDED');
    expect(await waitForExit(recoveryWorker)).toEqual({ code: 0, signal: null });

    const recoveredExecution = await prisma.checkExecution.findUniqueOrThrow({ where: { id: execution.id } });
    expect(recoveredExecution.status).toBe('SUCCEEDED');
    expect(recoveredExecution.attemptCount).toBe(2);
    expect(recoveredExecution.checkRunId).not.toBeNull();
    expect(await prisma.checkRun.count({ where: { uptimeCheckId: check.id } })).toBe(1);
    expect(await prisma.incident.count({ where: { serviceId: service.id, status: 'OPEN' } })).toBe(1);

    const notifications = await prisma.notification.findMany({
      where: { incident: { serviceId: service.id } },
    });
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ status: 'QUEUED', channel: 'EMAIL' });
    expect(await prisma.auditLog.count({ where: { workspaceId: workspace.id, action: 'INCIDENT_OPENED' } })).toBe(1);
    expect(await prisma.auditLog.count({ where: { workspaceId: workspace.id, action: 'CHECK_RAN' } })).toBe(1);
    expect(await prisma.usageMetric.count({ where: { workspaceId: workspace.id, name: 'uptime_checks_performed' } })).toBe(1);
    expect(await (await uptimeQueue.getJob(secondJobId))?.getState()).toBe('completed');
  }, 30_000);
});

integrationDescribe('worker graceful shutdown', () => {
  it('waits for an in-flight transaction and commits one durable result before exiting', async () => {
    const suffix = randomUUID();
    const testStartedAt = new Date();
    const scheduledFor = new Date(testStartedAt.getTime() + 10 * 60_000);
    const uptimeQueueName = `uptime-shutdown-${suffix}`;
    const notificationQueueName = `notification-shutdown-${suffix}`;
    uptimeQueue = new Queue(uptimeQueueName, {
      connection: createRedisConnection(),
      defaultJobOptions: { attempts: 1, removeOnComplete: false, removeOnFail: false },
    });
    notificationQueue = new Queue(notificationQueueName, {
      connection: createRedisConnection(),
      defaultJobOptions: { attempts: 1, removeOnComplete: false, removeOnFail: false },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: 'Worker Shutdown Test',
        slug: `worker-shutdown-${suffix}`,
        projects: {
          create: {
            name: 'Shutdown Project',
            slug: 'shutdown-project',
            services: {
              create: {
                name: 'Shutdown API',
                slug: 'shutdown-api',
                baseUrl: 'https://example.test',
                uptimeChecks: {
                  create: {
                    name: 'In-flight failing check',
                    method: 'GET',
                    url: 'https://example.test/health',
                    expectedStatus: 200,
                    intervalSeconds: 60,
                    timeoutMs: 500,
                    consecutiveFailuresToOpen: 1,
                    consecutiveSuccessesToResolve: 1,
                    nextRunAt: new Date(testStartedAt.getTime() + 24 * 60 * 60_000),
                  },
                },
              },
            },
          },
        },
      },
      include: {
        projects: { include: { services: { include: { uptimeChecks: true } } } },
      },
    });
    workspaceId = workspace.id;
    const service = workspace.projects[0]!.services[0]!;
    const check = service.uptimeChecks[0]!;
    const execution = await prisma.checkExecution.create({
      data: {
        uptimeCheckId: check.id,
        scheduledFor,
        idempotencyKey: `integration:worker-shutdown:${suffix}`,
      },
    });
    const jobId = checkExecutionDispatchJobId(execution.id, 1);
    await uptimeQueue.add('perform-check', { executionId: execution.id }, { jobId });

    const gracefulWorker = startFixture('graceful', {
      executionId: execution.id,
      uptimeQueueName,
      notificationQueueName,
    });
    await gracefulWorker.waitForMarker('GRACEFUL_DRAIN_POINT_REACHED');
    expect(gracefulWorker.child.kill('SIGTERM')).toBe(true);
    await gracefulWorker.waitForMarker('WORKER_SHUTDOWN_STARTED');
    const exit = await waitForExit(gracefulWorker);

    expect(exit, gracefulWorker.output()).toEqual({ code: 0, signal: null });
    expect(gracefulWorker.output()).toContain('WORKER_SHUTDOWN_COMPLETED');
    const completedExecution = await prisma.checkExecution.findUniqueOrThrow({ where: { id: execution.id } });
    expect(completedExecution.status).toBe('SUCCEEDED');
    expect(completedExecution.attemptCount).toBe(1);
    expect(completedExecution.checkRunId).not.toBeNull();
    expect(await prisma.checkRun.count({ where: { uptimeCheckId: check.id } })).toBe(1);
    expect(await prisma.incident.count({ where: { serviceId: service.id, status: 'OPEN' } })).toBe(1);
    expect(await prisma.notification.count({ where: { incident: { serviceId: service.id } } })).toBe(1);
    expect(await prisma.auditLog.count({ where: { workspaceId: workspace.id, action: 'INCIDENT_OPENED' } })).toBe(1);
    expect(await prisma.auditLog.count({ where: { workspaceId: workspace.id, action: 'CHECK_RAN' } })).toBe(1);
    expect(await prisma.usageMetric.count({
      where: { workspaceId: workspace.id, name: 'uptime_checks_performed' },
    })).toBe(1);
    expect(await (await uptimeQueue.getJob(jobId))?.getState()).toBe('completed');
  }, 30_000);
});
