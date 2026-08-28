import { runHttpCheck } from '@pulseboard/core';
import { prisma } from '@pulseboard/db';
import { RedisOperationalMetrics } from '@pulseboard/observability';
import { createQueues, createRedisConnection, queueNames } from '@pulseboard/queues';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

import { createWorkerHandlers } from './handlers.js';
import { logger } from './logger.js';
import { closeWorkerResources, createBoundedWorkerShutdown } from './shutdown.js';

const schedulerIntervalMs = Number(process.env.CHECK_SCHEDULER_INTERVAL_MS ?? 60_000);
const checkLeaseMs = Number(process.env.CHECK_EXECUTION_LEASE_MS ?? 60_000);
const uptimeJobLockDurationMs = Number(process.env.UPTIME_JOB_LOCK_DURATION_MS ?? 30_000);
const uptimeJobStalledIntervalMs = Number(process.env.UPTIME_JOB_STALLED_INTERVAL_MS ?? 30_000);
const workerShutdownTimeoutMs = Number(process.env.WORKER_SHUTDOWN_TIMEOUT_MS ?? 10_000);
const queues = createQueues();
const workerConnection = createRedisConnection();
const notificationConnection = createRedisConnection();
const metricsRedis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
});
const metrics = new RedisOperationalMetrics(
  metricsRedis,
  process.env.OPERATIONAL_METRICS_REDIS_PREFIX,
);
const handlers = createWorkerHandlers({
  logger,
  prisma,
  queues,
  runHttpCheck,
  schedulerIntervalMs,
  checkLeaseMs,
  metrics,
});

const uptimeWorker = new Worker(
  queueNames.uptimeChecks,
  async (job) => {
    if (job.name === 'run-due-checks') {
      await handlers.runDueChecks();
      return;
    }
    if (job.name === 'perform-check') {
      await handlers.performCheck(job.data.executionId, {
        jobId: job.id === undefined ? undefined : String(job.id),
        queueName: job.queueName,
      });
      return;
    }
    logger.warn({ jobName: job.name }, 'unknown uptime job');
  },
  {
    connection: workerConnection,
    concurrency: 5,
    lockDuration: uptimeJobLockDurationMs,
    stalledInterval: uptimeJobStalledIntervalMs,
  },
);

const notificationWorker = new Worker(
  queueNames.notifications,
  async (job) => {
    if (job.name === 'dispatch-notifications') {
      await handlers.dispatchNotifications();
      return;
    }
    if (job.name === 'send-notification') {
      await handlers.sendNotification(job.data.notificationId);
      return;
    }
    logger.warn({ jobName: job.name }, 'unknown notification job');
  },
  { connection: notificationConnection, concurrency: 5 },
);

uptimeWorker.on('failed', (job, error) => logger.error({ jobId: job?.id, error }, 'uptime job failed'));
notificationWorker.on('failed', (job, error) => logger.error({ jobId: job?.id, error }, 'notification job failed'));

await handlers.scheduleRecurringChecks();
await handlers.scheduleRecurringNotifications();
logger.info(
  { checkLeaseMs, uptimeJobLockDurationMs, uptimeJobStalledIntervalMs, workerShutdownTimeoutMs },
  'PulseBoard worker started',
);

const shutdown = createBoundedWorkerShutdown({
  timeoutMs: workerShutdownTimeoutMs,
  onStart: (signal) => {
    logger.info({ signal, workerShutdownTimeoutMs }, 'shutting down PulseBoard worker');
  },
  close: () => closeWorkerResources({
    workers: [uptimeWorker, notificationWorker],
    closeAfterWorkers: [
      () => queues.uptimeChecks.close(),
      () => queues.notifications.close(),
      () => metricsRedis.quit().catch(() => metricsRedis.disconnect()),
      () => prisma.$disconnect(),
    ],
  }),
  forceClose: () => {
    void uptimeWorker.close(true).catch((error) => {
      logger.error({ error, queueName: queueNames.uptimeChecks }, 'failed to force-close worker');
    });
    void notificationWorker.close(true).catch((error) => {
      logger.error({ error, queueName: queueNames.notifications }, 'failed to force-close worker');
    });
  },
});

function handleSignal(signal: NodeJS.Signals) {
  void shutdown(signal).then(
    () => {
      logger.info({ signal }, 'PulseBoard worker stopped');
      process.exit(0);
    },
    (error) => {
      logger.error({ error, signal }, 'PulseBoard worker shutdown failed');
      process.exit(1);
    },
  );
}

process.once('SIGINT', () => handleSignal('SIGINT'));
process.once('SIGTERM', () => handleSignal('SIGTERM'));
