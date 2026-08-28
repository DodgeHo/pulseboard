import { RedisOperationalMetrics, renderPrometheusMetrics } from '@pulseboard/observability';
import type { QueueDepthSnapshot } from '@pulseboard/observability';
import { Redis } from 'ioredis';

interface QueueDepthSource {
  name: string;
  getActiveCount(): Promise<number>;
  getDelayedCount(): Promise<number>;
  getFailedCount(): Promise<number>;
  getWaitingCount(): Promise<number>;
}

interface MetricsQueues {
  uptimeChecks: QueueDepthSource;
  notifications: QueueDepthSource;
}

let metricsRedis: Redis | null = null;
let metricsStore: RedisOperationalMetrics | null = null;

function operationalMetrics() {
  if (!metricsRedis) {
    metricsRedis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }
  metricsStore ??= new RedisOperationalMetrics(
    metricsRedis,
    process.env.OPERATIONAL_METRICS_REDIS_PREFIX,
  );
  return metricsStore;
}

async function readQueueDepth(queue: QueueDepthSource): Promise<QueueDepthSnapshot> {
  const [waiting, active, delayed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getDelayedCount(),
    queue.getFailedCount(),
  ]);

  return { queue: queue.name, counts: { waiting, active, delayed, failed } };
}

export async function collectPrometheusMetrics(queues: MetricsQueues) {
  const timeoutMs = Number(process.env.METRICS_SCRAPE_TIMEOUT_MS ?? 2_000);
  let timeout: NodeJS.Timeout | undefined;

  const snapshot = await Promise.race([
    (async () => {
      const metricsSnapshot = await operationalMetrics().readSnapshot();
      const [uptimeChecks, notifications] = await Promise.all([
        readQueueDepth(queues.uptimeChecks),
        readQueueDepth(queues.notifications),
      ]);
      return { metricsSnapshot, uptimeChecks, notifications };
    })(),
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`Metrics scrape exceeded ${timeoutMs}ms.`)), timeoutMs);
    }),
  ]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });

  return renderPrometheusMetrics(snapshot.metricsSnapshot, [snapshot.uptimeChecks, snapshot.notifications]);
}

export async function closeMetricsResources() {
  await metricsRedis?.quit().catch(() => metricsRedis?.disconnect());
  metricsRedis = null;
  metricsStore = null;
}
