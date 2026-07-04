import { runHttpCheck } from '@pulseboard/core';
import { prisma } from '@pulseboard/db';
import { createQueues, createRedisConnection, queueNames } from '@pulseboard/queues';
import { Worker } from 'bullmq';

import { createWorkerHandlers } from './handlers.js';
import { logger } from './logger.js';

const schedulerIntervalMs = Number(process.env.CHECK_SCHEDULER_INTERVAL_MS ?? 60_000);
const queues = createQueues();
const workerConnection = createRedisConnection();
const notificationConnection = createRedisConnection();
const handlers = createWorkerHandlers({
  logger,
  prisma,
  queues,
  runHttpCheck,
  schedulerIntervalMs,
});

const uptimeWorker = new Worker(
  queueNames.uptimeChecks,
  async (job) => {
    if (job.name === 'run-due-checks') {
      await handlers.runDueChecks();
      return;
    }
    if (job.name === 'perform-check') {
      await handlers.performCheck(job.data.uptimeCheckId);
      return;
    }
    logger.warn({ jobName: job.name }, 'unknown uptime job');
  },
  { connection: workerConnection, concurrency: 5 },
);

const notificationWorker = new Worker(
  queueNames.notifications,
  async (job) => {
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
logger.info('PulseBoard worker started');

async function shutdown() {
  logger.info('shutting down worker');
  await uptimeWorker.close();
  await notificationWorker.close();
  await queues.uptimeChecks.close();
  await queues.notifications.close();
  await prisma.$disconnect();
}

process.on('SIGINT', () => void shutdown().then(() => process.exit(0)));
process.on('SIGTERM', () => void shutdown().then(() => process.exit(0)));
