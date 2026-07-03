import { evaluateIncidentTransition, runHttpCheck } from '@pulseboard/core';
import { prisma } from '@pulseboard/db';
import { createQueues, createRedisConnection, queueNames } from '@pulseboard/queues';
import { Worker } from 'bullmq';

import { logger } from './logger.js';

const schedulerIntervalMs = Number(process.env.CHECK_SCHEDULER_INTERVAL_MS ?? 60_000);
const queues = createQueues();
const workerConnection = createRedisConnection();
const notificationConnection = createRedisConnection();

async function scheduleRecurringChecks() {
  await queues.uptimeChecks.add(
    'run-due-checks',
    {},
    {
      jobId: 'uptime-scheduler',
      repeat: { every: schedulerIntervalMs },
    },
  );
  logger.info({ schedulerIntervalMs }, 'scheduled recurring uptime scan');
}

async function runDueChecks() {
  const dueChecks = await prisma.uptimeCheck.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: new Date() },
      service: { status: 'ACTIVE' },
    },
    select: { id: true },
    take: 100,
    orderBy: { nextRunAt: 'asc' },
  });

  await Promise.all(
    dueChecks.map((check) =>
      queues.uptimeChecks.add('perform-check', { uptimeCheckId: check.id }, { jobId: `perform-${check.id}-${Date.now()}` }),
    ),
  );

  logger.info({ count: dueChecks.length }, 'queued due uptime checks');
}

async function performCheck(uptimeCheckId: string) {
  const check = await prisma.uptimeCheck.findUnique({
    where: { id: uptimeCheckId },
    include: { service: { include: { project: true } } },
  });

  if (!check || !check.isActive || check.service.status !== 'ACTIVE') {
    logger.info({ uptimeCheckId }, 'skipping inactive uptime check');
    return;
  }

  const result = await runHttpCheck({
    method: check.method as 'GET' | 'HEAD',
    url: check.url,
    expectedStatus: check.expectedStatus,
    timeoutMs: check.timeoutMs,
  });

  await prisma.checkRun.create({
    data: {
      uptimeCheckId: check.id,
      serviceId: check.serviceId,
      status: result.status,
      statusCode: result.statusCode,
      latencyMs: result.latencyMs,
      errorMessage: result.errorMessage,
    },
  });

  await prisma.uptimeCheck.update({
    where: { id: check.id },
    data: {
      nextRunAt: new Date(Date.now() + check.intervalSeconds * 1000),
    },
  });

  const recentRuns = await prisma.checkRun.findMany({
    where: { uptimeCheckId: check.id },
    orderBy: { checkedAt: 'desc' },
    take: Math.max(check.consecutiveFailuresToOpen, check.consecutiveSuccessesToResolve),
  });

  const openIncident = await prisma.incident.findFirst({
    where: {
      serviceId: check.serviceId,
      status: { in: ['OPEN', 'ACKNOWLEDGED'] },
    },
    orderBy: { openedAt: 'desc' },
  });

  const decision = evaluateIncidentTransition({
    latestOutcome: result.status,
    recentOutcomesNewestFirst: recentRuns.map((run) => run.status),
    consecutiveFailuresToOpen: check.consecutiveFailuresToOpen,
    consecutiveSuccessesToResolve: check.consecutiveSuccessesToResolve,
    hasOpenIncident: Boolean(openIncident),
  });

  if (decision.action === 'open') {
    const incident = await prisma.incident.create({
      data: {
        serviceId: check.serviceId,
        title: `${check.service.name} is failing ${check.name}`,
        summary: decision.reason,
        severity: result.status === 'DEGRADED' ? 'minor' : 'major',
      },
    });
    const notification = await prisma.notification.create({
      data: {
        incidentId: incident.id,
        channel: 'EMAIL',
        target: 'ops@example.com',
        payload: {
          incidentId: incident.id,
          title: incident.title,
          status: incident.status,
        },
      },
    });
    await queues.notifications.add('send-notification', { notificationId: notification.id });
    await prisma.auditLog.create({
      data: {
        action: 'INCIDENT_OPENED',
        entityType: 'incident',
        entityId: incident.id,
        workspaceId: check.service.project.workspaceId,
        actorType: 'worker',
        message: decision.reason,
      },
    });
  }

  if (decision.action === 'resolve' && openIncident) {
    const incident = await prisma.incident.update({
      where: { id: openIncident.id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        summary: decision.reason,
      },
    });
    const notification = await prisma.notification.create({
      data: {
        incidentId: incident.id,
        channel: 'SLACK',
        target: '#ops-demo',
        payload: {
          incidentId: incident.id,
          title: incident.title,
          status: incident.status,
        },
      },
    });
    await queues.notifications.add('send-notification', { notificationId: notification.id });
    await prisma.auditLog.create({
      data: {
        action: 'INCIDENT_RESOLVED',
        entityType: 'incident',
        entityId: incident.id,
        workspaceId: check.service.project.workspaceId,
        actorType: 'worker',
        message: decision.reason,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: 'CHECK_RAN',
      entityType: 'uptime_check',
      entityId: check.id,
      workspaceId: check.service.project.workspaceId,
      actorType: 'worker',
      message: `Check ${check.name} finished with ${result.status}.`,
      metadata: {
        statusCode: result.statusCode,
        latencyMs: result.latencyMs,
        errorMessage: result.errorMessage,
      },
    },
  });

  await prisma.usageMetric.create({
    data: {
      workspaceId: check.service.project.workspaceId,
      name: 'uptime_checks_performed',
      value: 1,
    },
  });

  logger.info({ uptimeCheckId, status: result.status }, 'performed uptime check');
}

async function sendNotification(notificationId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) return;

  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: 'SENT',
      sentAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'NOTIFICATION_SENT',
      entityType: 'notification',
      entityId: notification.id,
      actorType: 'worker',
      message: `Mock ${notification.channel.toLowerCase()} notification sent to ${notification.target}.`,
    },
  });

  logger.info({ notificationId, channel: notification.channel }, 'mock notification sent');
}

const uptimeWorker = new Worker(
  queueNames.uptimeChecks,
  async (job) => {
    if (job.name === 'run-due-checks') {
      await runDueChecks();
      return;
    }
    if (job.name === 'perform-check') {
      await performCheck(job.data.uptimeCheckId);
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
      await sendNotification(job.data.notificationId);
      return;
    }
    logger.warn({ jobName: job.name }, 'unknown notification job');
  },
  { connection: notificationConnection, concurrency: 5 },
);

uptimeWorker.on('failed', (job, error) => logger.error({ jobId: job?.id, error }, 'uptime job failed'));
notificationWorker.on('failed', (job, error) => logger.error({ jobId: job?.id, error }, 'notification job failed'));

await scheduleRecurringChecks();
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
