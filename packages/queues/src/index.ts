import { Queue } from 'bullmq';

import { createRedisConnection } from './connection.js';

export const queueNames = {
  uptimeChecks: 'uptime-checks',
  notifications: 'notifications',
} as const;

export type UptimeJob =
  | { name: 'run-due-checks'; data: Record<string, never> }
  | { name: 'perform-check'; data: { uptimeCheckId: string } };

export type NotificationJob = {
  name: 'send-notification';
  data: { notificationId: string };
};

export function createQueues() {
  const connection = createRedisConnection();

  return {
    uptimeChecks: new Queue(queueNames.uptimeChecks, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    }),
    notifications: new Queue(queueNames.notifications, {
      connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1500 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    }),
  };
}

export { createRedisConnection };
