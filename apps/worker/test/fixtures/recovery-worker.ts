import { prisma } from '@pulseboard/db';
import { createRedisConnection } from '@pulseboard/queues';
import { Queue, Worker } from 'bullmq';

import { createWorkerHandlers } from '../../src/handlers.js';
import { closeWorkerResources, createBoundedWorkerShutdown } from '../../src/shutdown.js';

const mode = process.env.RECOVERY_WORKER_MODE;
const executionId = process.env.RECOVERY_EXECUTION_ID;
const uptimeQueueName = process.env.RECOVERY_UPTIME_QUEUE;
const notificationQueueName = process.env.RECOVERY_NOTIFICATION_QUEUE;
const checkLeaseMs = Number(process.env.RECOVERY_CHECK_LEASE_MS ?? 1_200);
const lockDuration = Number(process.env.RECOVERY_LOCK_DURATION_MS ?? 400);
const stalledInterval = Number(process.env.RECOVERY_STALLED_INTERVAL_MS ?? 100);
const shutdownTimeoutMs = Number(process.env.RECOVERY_SHUTDOWN_TIMEOUT_MS ?? 2_000);
const gracefulHookDelayMs = Number(process.env.RECOVERY_GRACEFUL_HOOK_DELAY_MS ?? 300);

if ((mode !== 'crash' && mode !== 'recover' && mode !== 'graceful') || !executionId || !uptimeQueueName || !notificationQueueName) {
  throw new Error('Recovery worker fixture is missing required environment variables.');
}

function writeMarker(marker: string, data: Record<string, unknown> = {}) {
  process.stdout.write(`${marker} ${JSON.stringify(data)}\n`);
}

const uptimeQueue = new Queue(uptimeQueueName, { connection: createRedisConnection() });
const notificationQueue = new Queue(notificationQueueName, { connection: createRedisConnection() });
const handlers = createWorkerHandlers({
  prisma,
  queues: { uptimeChecks: uptimeQueue, notifications: notificationQueue },
  runHttpCheck: async () => ({
    status: 'DOWN',
    statusCode: 503,
    latencyMs: 7,
    errorMessage: 'Injected dependency failure.',
  }),
  logger: {
    info: (context: unknown, message?: string) => writeMarker('WORKER_LOG', { context, message }),
    warn: (context: unknown, message?: string) => writeMarker('WORKER_WARN', { context, message }),
  },
  schedulerIntervalMs: 60_000,
  checkLeaseMs,
  workerId: `recovery-fixture-${mode}`,
  testHooks: mode === 'crash' || mode === 'graceful'
    ? {
        afterCheckRunPersisted: async () => {
          if (mode === 'crash') {
            writeMarker('CRASH_POINT_REACHED', { executionId });
            process.kill(process.pid, 'SIGKILL');
            await new Promise<never>(() => undefined);
          }
          writeMarker('GRACEFUL_DRAIN_POINT_REACHED', { executionId });
          await new Promise((resolve) => setTimeout(resolve, gracefulHookDelayMs));
        },
      }
    : undefined,
});

const worker = new Worker(
  uptimeQueueName,
  async (job) => {
    if (job.name !== 'perform-check' || job.data.executionId !== executionId) return;
    await handlers.performCheck(job.data.executionId, {
      jobId: job.id === undefined ? undefined : String(job.id),
      queueName: job.queueName,
    });
  },
  {
    connection: createRedisConnection(),
    concurrency: 1,
    lockDuration,
    stalledInterval,
    maxStalledCount: 1,
  },
);

worker.on('completed', async (job) => {
  if (mode !== 'recover' || job.data.executionId !== executionId) return;
  const execution = await prisma.checkExecution.findUnique({
    where: { id: executionId },
    select: { status: true, attemptCount: true },
  });
  if (execution?.status === 'RUNNING') {
    writeMarker('LEASE_CONTENTION_COMPLETED', { jobId: job.id, attemptCount: execution.attemptCount });
    return;
  }
  if (execution?.status === 'SUCCEEDED') {
    writeMarker('RECOVERY_SUCCEEDED', { jobId: job.id, attemptCount: execution.attemptCount });
    await closeForExit(0);
  }
});

worker.on('failed', (job, error) => {
  writeMarker('RECOVERY_JOB_FAILED', { jobId: job?.id, error: error.message });
  if (mode === 'recover') void closeForExit(1);
});

worker.on('error', (error) => {
  writeMarker('RECOVERY_WORKER_ERROR', { error: error.message });
});

const closeResources = () => closeWorkerResources({
  workers: [worker],
  closeAfterWorkers: [
    () => uptimeQueue.close(),
    () => notificationQueue.close(),
    () => prisma.$disconnect(),
  ],
});
let exiting = false;

async function closeForExit(exitCode: number) {
  if (exiting) return;
  exiting = true;
  await closeResources();
  process.exit(exitCode);
}

const shutdown = createBoundedWorkerShutdown({
  timeoutMs: shutdownTimeoutMs,
  onStart: (signal) => writeMarker('WORKER_SHUTDOWN_STARTED', { signal, shutdownTimeoutMs }),
  close: closeResources,
  forceClose: () => {
    void worker.close(true);
  },
});

function handleSignal(signal: NodeJS.Signals) {
  void shutdown(signal).then(
    () => {
      writeMarker('WORKER_SHUTDOWN_COMPLETED', { signal });
      process.exit(0);
    },
    (error) => {
      writeMarker('WORKER_SHUTDOWN_FAILED', {
        signal,
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    },
  );
}

process.once('SIGINT', () => handleSignal('SIGINT'));
process.once('SIGTERM', () => handleSignal('SIGTERM'));

await worker.waitUntilReady();
writeMarker('WORKER_READY', { mode });
