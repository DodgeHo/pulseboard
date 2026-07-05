import { evaluateIncidentTransition } from '@pulseboard/core';
import type { HttpCheckRequest, HttpCheckResult } from '@pulseboard/core';
import type { PrismaClient } from '@pulseboard/db';

import type { logger as defaultLogger } from './logger.js';

export type HttpCheckRunner = (input: HttpCheckRequest) => Promise<HttpCheckResult>;

interface QueueClient {
  add(name: string, data: unknown, options?: unknown): Promise<unknown>;
}

export interface WorkerQueues {
  uptimeChecks: QueueClient;
  notifications: QueueClient;
}

export interface WorkerHandlerDependencies {
  prisma: PrismaClient;
  queues: WorkerQueues;
  runHttpCheck: HttpCheckRunner;
  logger: Pick<typeof defaultLogger, 'info'>;
  schedulerIntervalMs: number;
}

export function createWorkerHandlers(dependencies: WorkerHandlerDependencies) {
  const { logger, prisma, queues, runHttpCheck, schedulerIntervalMs } = dependencies;

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
      logger.info({ incidentId: incident.id, serviceId: check.serviceId, uptimeCheckId }, 'opened incident after uptime threshold');
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
      logger.info({ incidentId: incident.id, serviceId: check.serviceId, uptimeCheckId }, 'resolved incident after recovery threshold');
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
      include: { incident: { include: { service: { include: { project: true } } } } },
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
        workspaceId: notification.incident?.service.project.workspaceId,
        actorType: 'worker',
        message: `Mock ${notification.channel.toLowerCase()} notification sent to ${notification.target}.`,
      },
    });

    logger.info({ notificationId, channel: notification.channel }, 'mock notification sent');
  }

  return {
    performCheck,
    runDueChecks,
    scheduleRecurringChecks,
    sendNotification,
  };
}
