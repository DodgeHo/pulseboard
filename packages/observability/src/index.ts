export const uptimeCheckDurationBucketsMs = [100, 250, 500, 1_000, 2_500, 5_000, 10_000] as const;

export const uptimeCheckOutcomes = ['UP', 'DEGRADED', 'DOWN'] as const;
export const notificationChannels = ['EMAIL', 'SLACK', 'WEBHOOK'] as const;
export const queueStates = ['waiting', 'active', 'delayed', 'failed'] as const;

export type UptimeCheckOutcome = (typeof uptimeCheckOutcomes)[number];
export type NotificationChannel = (typeof notificationChannels)[number];
export type QueueState = (typeof queueStates)[number];

export interface OperationalMetrics {
  recordUptimeCheck(outcome: UptimeCheckOutcome, durationMs: number): Promise<void>;
  recordCheckExecutionLeaseContention(): Promise<void>;
  recordNotificationTerminalFailure(channel: NotificationChannel): Promise<void>;
}

export interface RedisMetricsClient {
  eval(script: string, numberOfKeys: number, ...args: Array<string | number>): Promise<unknown>;
  hgetall(key: string): Promise<Record<string, string>>;
  hincrby(key: string, field: string, increment: number): Promise<number>;
}

export interface OperationalMetricsSnapshot {
  uptimeChecksTotal: Record<UptimeCheckOutcome, number>;
  uptimeCheckDurationMs: {
    buckets: Array<{ le: number | '+Inf'; count: number }>;
    count: number;
    sum: number;
  };
  checkExecutionLeaseContentionTotal: number;
  notificationTerminalFailuresTotal: Record<NotificationChannel, number>;
}

export interface QueueDepthSnapshot {
  queue: string;
  counts: Record<QueueState, number>;
}

const recordUptimeCheckScript = `
local key = KEYS[1]
local outcome = ARGV[1]
local duration = math.max(0, tonumber(ARGV[2]) or 0)

redis.call('HINCRBY', key, 'uptime_checks_total:' .. outcome, 1)
redis.call('HINCRBY', key, 'uptime_check_duration_ms_count', 1)
redis.call('HINCRBYFLOAT', key, 'uptime_check_duration_ms_sum', duration)

for index = 3, #ARGV do
  local bucket = tonumber(ARGV[index])
  if duration <= bucket then
    redis.call('HINCRBY', key, 'uptime_check_duration_ms_bucket:' .. ARGV[index], 1)
  end
end

redis.call('HINCRBY', key, 'uptime_check_duration_ms_bucket:+Inf', 1)
return 1
`;

function numericValue(values: Record<string, string>, field: string) {
  const value = Number(values[field] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function escapeLabelValue(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll('"', '\\"');
}

export class RedisOperationalMetrics implements OperationalMetrics {
  readonly key: string;

  constructor(
    private readonly redis: RedisMetricsClient,
    keyPrefix = 'pulseboard:operational-metrics:v1',
  ) {
    this.key = `${keyPrefix}:values`;
  }

  async recordUptimeCheck(outcome: UptimeCheckOutcome, durationMs: number) {
    await this.redis.eval(
      recordUptimeCheckScript,
      1,
      this.key,
      outcome,
      Math.max(0, durationMs),
      ...uptimeCheckDurationBucketsMs,
    );
  }

  async recordCheckExecutionLeaseContention() {
    await this.redis.hincrby(this.key, 'check_execution_lease_contention_total', 1);
  }

  async recordNotificationTerminalFailure(channel: NotificationChannel) {
    await this.redis.hincrby(this.key, `notification_terminal_failures_total:${channel}`, 1);
  }

  async readSnapshot(): Promise<OperationalMetricsSnapshot> {
    const values = await this.redis.hgetall(this.key);

    return {
      uptimeChecksTotal: Object.fromEntries(
        uptimeCheckOutcomes.map((outcome) => [outcome, numericValue(values, `uptime_checks_total:${outcome}`)]),
      ) as Record<UptimeCheckOutcome, number>,
      uptimeCheckDurationMs: {
        buckets: [
          ...uptimeCheckDurationBucketsMs.map((le) => ({
            le,
            count: numericValue(values, `uptime_check_duration_ms_bucket:${le}`),
          })),
          { le: '+Inf' as const, count: numericValue(values, 'uptime_check_duration_ms_bucket:+Inf') },
        ],
        count: numericValue(values, 'uptime_check_duration_ms_count'),
        sum: numericValue(values, 'uptime_check_duration_ms_sum'),
      },
      checkExecutionLeaseContentionTotal: numericValue(values, 'check_execution_lease_contention_total'),
      notificationTerminalFailuresTotal: Object.fromEntries(
        notificationChannels.map((channel) => [
          channel,
          numericValue(values, `notification_terminal_failures_total:${channel}`),
        ]),
      ) as Record<NotificationChannel, number>,
    };
  }
}

export function renderPrometheusMetrics(
  snapshot: OperationalMetricsSnapshot,
  queueDepths: QueueDepthSnapshot[],
) {
  const lines = [
    '# HELP pulseboard_uptime_checks_total Committed uptime check results by outcome.',
    '# TYPE pulseboard_uptime_checks_total counter',
    ...uptimeCheckOutcomes.map(
      (outcome) => `pulseboard_uptime_checks_total{outcome="${outcome}"} ${snapshot.uptimeChecksTotal[outcome]}`,
    ),
    '# HELP pulseboard_uptime_check_duration_ms Duration reported by committed uptime checks in milliseconds.',
    '# TYPE pulseboard_uptime_check_duration_ms histogram',
    ...snapshot.uptimeCheckDurationMs.buckets.map(
      (bucket) => `pulseboard_uptime_check_duration_ms_bucket{le="${bucket.le}"} ${bucket.count}`,
    ),
    `pulseboard_uptime_check_duration_ms_sum ${snapshot.uptimeCheckDurationMs.sum}`,
    `pulseboard_uptime_check_duration_ms_count ${snapshot.uptimeCheckDurationMs.count}`,
    '# HELP pulseboard_check_execution_lease_contention_total Check jobs skipped while another worker held the database lease.',
    '# TYPE pulseboard_check_execution_lease_contention_total counter',
    `pulseboard_check_execution_lease_contention_total ${snapshot.checkExecutionLeaseContentionTotal}`,
    '# HELP pulseboard_notification_terminal_failures_total Notifications moved to dead-letter by channel.',
    '# TYPE pulseboard_notification_terminal_failures_total counter',
    ...notificationChannels.map(
      (channel) =>
        `pulseboard_notification_terminal_failures_total{channel="${channel}"} ${snapshot.notificationTerminalFailuresTotal[channel]}`,
    ),
    '# HELP pulseboard_queue_jobs BullMQ jobs by queue and state at scrape time.',
    '# TYPE pulseboard_queue_jobs gauge',
    ...queueDepths.flatMap(({ queue, counts }) =>
      queueStates.map(
        (state) =>
          `pulseboard_queue_jobs{queue="${escapeLabelValue(queue)}",state="${state}"} ${counts[state]}`,
      ),
    ),
  ];

  return `${lines.join('\n')}\n`;
}
