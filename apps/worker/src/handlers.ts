import { evaluateIncidentTransition } from '@pulseboard/core';
import type { HttpCheckRequest, HttpCheckResult } from '@pulseboard/core';
import { Prisma } from '@pulseboard/db';
import type { PrismaClient } from '@pulseboard/db';
import { randomUUID } from 'node:crypto';

import type { logger as defaultLogger } from './logger.js';

export type HttpCheckRunner = (input: HttpCheckRequest) => Promise<HttpCheckResult>;

interface QueueClient {
  add(name: string, data: unknown, options?: unknown): Promise<unknown>;
}

export interface WorkerQueues {
  uptimeChecks: QueueClient;
  notifications: QueueClient;
}

export interface NotificationDelivery {
  responseStatus?: number;
}

export type NotificationProvider = (notification: {
  id: string;
  channel: 'EMAIL' | 'SLACK' | 'WEBHOOK';
  target: string;
  payload: Prisma.JsonValue;
}) => Promise<NotificationDelivery>;

export class NotificationDeliveryError extends Error {
  constructor(
    message: string,
    public readonly permanent = false,
    public readonly responseStatus?: number,
  ) {
    super(message);
    this.name = 'NotificationDeliveryError';
  }
}

export interface WorkerHandlerDependencies {
  prisma: PrismaClient;
  queues: WorkerQueues;
  runHttpCheck: HttpCheckRunner;
  logger: Pick<typeof defaultLogger, 'info' | 'warn'>;
  schedulerIntervalMs: number;
  notificationProvider?: NotificationProvider;
  workerId?: string;
  now?: () => Date;
  checkLeaseMs?: number;
  notificationLeaseMs?: number;
  testHooks?: {
    afterCheckRunPersisted?: () => Promise<void>;
  };
}

function executionKey(uptimeCheckId: string, scheduledFor: Date) {
  return `check:${uptimeCheckId}:${scheduledFor.toISOString()}`;
}

function notificationBackoffMs(cycleAttemptCount: number) {
  return Math.min(60_000, 1_000 * 2 ** Math.max(0, cycleAttemptCount - 1));
}

async function defaultNotificationProvider(notification: Parameters<NotificationProvider>[0]): Promise<NotificationDelivery> {
  if (notification.channel !== 'WEBHOOK') return { responseStatus: 202 };

  let response: Response;
  try {
    response = await fetch(notification.target, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(notification.payload),
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    throw new NotificationDeliveryError(error instanceof Error ? error.message : 'Webhook delivery failed.');
  }

  if (!response.ok) {
    const permanent = response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429;
    throw new NotificationDeliveryError(`Webhook returned HTTP ${response.status}.`, permanent, response.status);
  }

  return { responseStatus: response.status };
}

export function createWorkerHandlers(dependencies: WorkerHandlerDependencies) {
  const {
    logger,
    prisma,
    queues,
    runHttpCheck,
    schedulerIntervalMs,
    notificationProvider = defaultNotificationProvider,
    workerId = randomUUID(),
    now = () => new Date(),
    checkLeaseMs = 60_000,
    notificationLeaseMs = 30_000,
    testHooks,
  } = dependencies;

  async function scheduleRecurringChecks() {
    await queues.uptimeChecks.add('run-due-checks', {}, { jobId: 'uptime-scheduler', repeat: { every: schedulerIntervalMs } });
    logger.info({ schedulerIntervalMs }, 'scheduled recurring uptime scan');
  }

  async function scheduleRecurringNotifications() {
    await queues.notifications.add(
      'dispatch-notifications',
      {},
      { jobId: 'notification-dispatcher', repeat: { every: Math.max(1_000, Math.min(schedulerIntervalMs, 10_000)) } },
    );
    logger.info('scheduled recurring notification dispatch');
  }

  async function runDueChecks() {
    const scanTime = now();
    const dueChecks = await prisma.uptimeCheck.findMany({
      where: { isActive: true, nextRunAt: { lte: scanTime }, service: { status: 'ACTIVE' } },
      select: { id: true, intervalSeconds: true, nextRunAt: true },
      take: 100,
      orderBy: { nextRunAt: 'asc' },
    });

    for (const check of dueChecks) {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.uptimeCheck.updateMany({
          where: { id: check.id, isActive: true, nextRunAt: check.nextRunAt },
          data: { nextRunAt: new Date(check.nextRunAt.getTime() + check.intervalSeconds * 1_000) },
        });
        if (claimed.count === 0) return;
        await tx.checkExecution.upsert({
          where: { idempotencyKey: executionKey(check.id, check.nextRunAt) },
          create: {
            uptimeCheckId: check.id,
            scheduledFor: check.nextRunAt,
            idempotencyKey: executionKey(check.id, check.nextRunAt),
          },
          update: {},
        });
      });
    }

    const pending = await prisma.checkExecution.findMany({
      where: {
        scheduledFor: { lte: scanTime },
        OR: [
          { status: 'PENDING' },
          { status: 'RUNNING', leaseExpiresAt: { lt: scanTime } },
        ],
      },
      select: { id: true },
      orderBy: { scheduledFor: 'asc' },
      take: 200,
    });
    await Promise.all(
      pending.map((execution) =>
        queues.uptimeChecks.add('perform-check', { executionId: execution.id }, { jobId: `check-execution-${execution.id}` }),
      ),
    );
    logger.info({ scheduled: dueChecks.length, dispatched: pending.length }, 'scheduled and dispatched due uptime checks');
  }

  async function performCheck(executionId: string) {
    const claimTime = now();
    const claimed = await prisma.checkExecution.updateMany({
      where: {
        id: executionId,
        OR: [
          { status: 'PENDING' },
          { status: 'RUNNING', leaseExpiresAt: { lt: claimTime } },
        ],
      },
      data: {
        status: 'RUNNING',
        leaseOwner: workerId,
        leaseExpiresAt: new Date(claimTime.getTime() + checkLeaseMs),
        attemptCount: { increment: 1 },
        lastError: null,
      },
    });
    if (claimed.count === 0) {
      logger.info({ executionId }, 'skipping already claimed or completed check execution');
      return;
    }

    const execution = await prisma.checkExecution.findUnique({
      where: { id: executionId },
      include: { uptimeCheck: { include: { service: { include: { project: true } } } } },
    });
    if (!execution) return;
    const check = execution.uptimeCheck;
    if (!check.isActive || check.service.status !== 'ACTIVE') {
      await prisma.checkExecution.update({
        where: { id: execution.id },
        data: { status: 'SUCCEEDED', leaseOwner: null, leaseExpiresAt: null, lastError: 'Skipped inactive check.' },
      });
      return;
    }

    try {
      const result = await runHttpCheck({
        method: check.method as 'GET' | 'HEAD',
        url: check.url,
        expectedStatus: check.expectedStatus,
        timeoutMs: check.timeoutMs,
      });

      const notificationIds = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw(Prisma.sql`SELECT id FROM "MonitoredService" WHERE id = ${check.serviceId} FOR UPDATE`);

        const existingRun = await tx.checkRun.findUnique({ where: { idempotencyKey: execution.idempotencyKey } });
        if (existingRun) {
          await tx.checkExecution.update({
            where: { id: execution.id },
            data: { status: 'SUCCEEDED', checkRunId: existingRun.id, leaseOwner: null, leaseExpiresAt: null, lastError: null },
          });
          return [] as string[];
        }

        const checkRun = await tx.checkRun.create({
          data: {
            idempotencyKey: execution.idempotencyKey,
            uptimeCheckId: check.id,
            serviceId: check.serviceId,
            status: result.status,
            statusCode: result.statusCode,
            latencyMs: result.latencyMs,
            errorMessage: result.errorMessage,
          },
        });
        await testHooks?.afterCheckRunPersisted?.();

        const recentRuns = await tx.checkRun.findMany({
          where: { uptimeCheckId: check.id },
          orderBy: { checkedAt: 'desc' },
          take: Math.max(check.consecutiveFailuresToOpen, check.consecutiveSuccessesToResolve),
        });
        const activeIncident = await tx.incident.findFirst({
          where: { serviceId: check.serviceId, status: { in: ['OPEN', 'ACKNOWLEDGED'] } },
          orderBy: { openedAt: 'desc' },
        });
        const decision = evaluateIncidentTransition({
          latestOutcome: result.status,
          recentOutcomesNewestFirst: recentRuns.map((run) => run.status),
          consecutiveFailuresToOpen: check.consecutiveFailuresToOpen,
          consecutiveSuccessesToResolve: check.consecutiveSuccessesToResolve,
          hasOpenIncident: Boolean(activeIncident),
        });
        const createdNotificationIds: string[] = [];

        if (decision.action === 'open') {
          const incident = await tx.incident.create({
            data: {
              serviceId: check.serviceId,
              title: `${check.service.name} is failing ${check.name}`,
              summary: decision.reason,
              severity: result.status === 'DEGRADED' ? 'minor' : 'major',
              openIdempotencyKey: `incident:open:${checkRun.id}`,
            },
          });
          const notification = await tx.notification.create({
            data: {
              idempotencyKey: `notification:incident-opened:${incident.id}`,
              incidentId: incident.id,
              channel: 'EMAIL',
              target: 'ops@example.com',
              payload: { incidentId: incident.id, title: incident.title, status: incident.status },
            },
          });
          createdNotificationIds.push(notification.id);
          await tx.auditLog.create({
            data: {
              idempotencyKey: `audit:incident-opened:${incident.id}`,
              action: 'INCIDENT_OPENED', entityType: 'incident', entityId: incident.id,
              workspaceId: check.service.project.workspaceId, actorType: 'worker', message: decision.reason,
            },
          });
        }

        if (decision.action === 'resolve' && activeIncident) {
          const updated = await tx.incident.updateMany({
            where: { id: activeIncident.id, status: { in: ['OPEN', 'ACKNOWLEDGED'] } },
            data: {
              status: 'RESOLVED', resolvedAt: now(), summary: decision.reason,
              resolveIdempotencyKey: `incident:resolve:${checkRun.id}`,
            },
          });
          if (updated.count === 1) {
            const incident = await tx.incident.findUniqueOrThrow({ where: { id: activeIncident.id } });
            const notification = await tx.notification.create({
              data: {
                idempotencyKey: `notification:incident-resolved:${incident.id}`,
                incidentId: incident.id, channel: 'SLACK', target: '#ops-demo',
                payload: { incidentId: incident.id, title: incident.title, status: incident.status },
              },
            });
            createdNotificationIds.push(notification.id);
            await tx.auditLog.create({
              data: {
                idempotencyKey: `audit:incident-resolved:${incident.id}`,
                action: 'INCIDENT_RESOLVED', entityType: 'incident', entityId: incident.id,
                workspaceId: check.service.project.workspaceId, actorType: 'worker', message: decision.reason,
              },
            });
          }
        }

        await tx.auditLog.create({
          data: {
            idempotencyKey: `audit:check-ran:${checkRun.id}`,
            action: 'CHECK_RAN', entityType: 'uptime_check', entityId: check.id,
            workspaceId: check.service.project.workspaceId, actorType: 'worker',
            message: `Check ${check.name} finished with ${result.status}.`,
            metadata: { checkRunId: checkRun.id, statusCode: result.statusCode, latencyMs: result.latencyMs, errorMessage: result.errorMessage },
          },
        });
        await tx.usageMetric.create({
          data: {
            idempotencyKey: `usage:check-ran:${checkRun.id}`, workspaceId: check.service.project.workspaceId,
            name: 'uptime_checks_performed', value: 1,
          },
        });
        await tx.checkExecution.update({
          where: { id: execution.id },
          data: { status: 'SUCCEEDED', checkRunId: checkRun.id, leaseOwner: null, leaseExpiresAt: null, lastError: null },
        });
        return createdNotificationIds;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

      await Promise.all(notificationIds.map((notificationId) =>
        queues.notifications.add('send-notification', { notificationId }, { jobId: `notification-${notificationId}-1` }),
      ));
      logger.info({ executionId, uptimeCheckId: check.id, status: result.status }, 'performed idempotent uptime check');
    } catch (error) {
      await prisma.checkExecution.updateMany({
        where: { id: execution.id, status: 'RUNNING', leaseOwner: workerId },
        data: { status: 'PENDING', leaseOwner: null, leaseExpiresAt: null, lastError: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  async function dispatchNotifications() {
    const dispatchTime = now();
    const pending = await prisma.notification.findMany({
      where: {
        OR: [
          {
            status: { in: ['QUEUED', 'FAILED'] }, nextAttemptAt: { lte: dispatchTime },
            OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: dispatchTime } }],
          },
          { status: 'PROCESSING', leaseExpiresAt: { lt: dispatchTime } },
        ],
      },
      select: { id: true, attemptCount: true }, orderBy: { nextAttemptAt: 'asc' }, take: 200,
    });
    await Promise.all(pending.map((notification) =>
      queues.notifications.add(
        'send-notification', { notificationId: notification.id },
        { jobId: `notification-${notification.id}-${notification.attemptCount + 1}` },
      ),
    ));
    logger.info({ count: pending.length }, 'dispatched pending notifications');
  }

  async function sendNotification(notificationId: string) {
    const claimTime = now();
    const claimed = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        OR: [
          {
            status: { in: ['QUEUED', 'FAILED'] }, nextAttemptAt: { lte: claimTime },
            OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: claimTime } }],
          },
          { status: 'PROCESSING', leaseExpiresAt: { lt: claimTime } },
        ],
      },
      data: { status: 'PROCESSING', leaseOwner: workerId, leaseExpiresAt: new Date(claimTime.getTime() + notificationLeaseMs) },
    });
    if (claimed.count === 0) return;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { incident: { include: { service: { include: { project: true } } } } },
    });
    if (!notification) return;
    const attemptNumber = notification.attemptCount + 1;
    const cycleAttemptCount = notification.cycleAttemptCount + 1;

    try {
      const delivery = await notificationProvider(notification);
      await prisma.$transaction(async (tx) => {
        await tx.notificationAttempt.create({
          data: { notificationId, attemptNumber, succeeded: true, responseStatus: delivery.responseStatus },
        });
        await tx.notification.update({
          where: { id: notificationId },
          data: {
            status: 'SENT', sentAt: now(), errorMessage: null, attemptCount: attemptNumber,
            cycleAttemptCount, lastAttemptAt: now(), leaseOwner: null, leaseExpiresAt: null, deadLetteredAt: null,
          },
        });
        await tx.auditLog.create({
          data: {
            idempotencyKey: `audit:notification-sent:${notificationId}:${attemptNumber}`,
            action: 'NOTIFICATION_SENT', entityType: 'notification', entityId: notificationId,
            workspaceId: notification.incident?.service.project.workspaceId, actorType: 'worker',
            message: `${notification.channel} notification sent to ${notification.target} on attempt ${attemptNumber}.`,
          },
        });
      });
      logger.info({ notificationId, attemptNumber, channel: notification.channel }, 'notification sent');
    } catch (error) {
      const deliveryError = error instanceof NotificationDeliveryError
        ? error
        : new NotificationDeliveryError(error instanceof Error ? error.message : String(error));
      const deadLetter = deliveryError.permanent || cycleAttemptCount >= notification.maxAttempts;
      await prisma.$transaction(async (tx) => {
        await tx.notificationAttempt.create({
          data: {
            notificationId, attemptNumber, succeeded: false, errorMessage: deliveryError.message,
            responseStatus: deliveryError.responseStatus,
          },
        });
        await tx.notification.update({
          where: { id: notificationId },
          data: {
            status: deadLetter ? 'DEAD_LETTER' : 'FAILED', errorMessage: deliveryError.message,
            attemptCount: attemptNumber, cycleAttemptCount, lastAttemptAt: now(),
            nextAttemptAt: new Date(now().getTime() + notificationBackoffMs(cycleAttemptCount)),
            deadLetteredAt: deadLetter ? now() : null, leaseOwner: null, leaseExpiresAt: null,
          },
        });
        await tx.auditLog.create({
          data: {
            idempotencyKey: `audit:notification-failed:${notificationId}:${attemptNumber}`,
            action: 'NOTIFICATION_FAILED', entityType: 'notification', entityId: notificationId,
            workspaceId: notification.incident?.service.project.workspaceId, actorType: 'worker',
            message: deadLetter
              ? `Notification moved to dead-letter after attempt ${attemptNumber}: ${deliveryError.message}`
              : `Notification attempt ${attemptNumber} failed and will retry: ${deliveryError.message}`,
            metadata: { permanent: deliveryError.permanent, responseStatus: deliveryError.responseStatus },
          },
        });
      });
      logger.warn({ notificationId, attemptNumber, deadLetter, error: deliveryError.message }, 'notification delivery failed');
    }
  }

  return {
    dispatchNotifications,
    performCheck,
    runDueChecks,
    scheduleRecurringChecks,
    scheduleRecurringNotifications,
    sendNotification,
  };
}
