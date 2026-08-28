import { describe, expect, it, vi } from 'vitest';

import { RedisOperationalMetrics, renderPrometheusMetrics } from '../src/index.js';

describe('RedisOperationalMetrics', () => {
  it('records one check outcome and its cumulative histogram update in one Redis command', async () => {
    const redis = {
      eval: vi.fn().mockResolvedValue(1),
      hgetall: vi.fn(),
      hincrby: vi.fn(),
    };
    const metrics = new RedisOperationalMetrics(redis, 'test:metrics');

    await metrics.recordUptimeCheck('DOWN', 750);

    expect(redis.eval).toHaveBeenCalledOnce();
    expect(redis.eval.mock.calls[0]?.slice(1)).toEqual([
      1,
      'test:metrics:values',
      'DOWN',
      750,
      100,
      250,
      500,
      1_000,
      2_500,
      5_000,
      10_000,
    ]);
  });

  it('normalizes missing Redis fields and renders stable low-cardinality Prometheus series', async () => {
    const redis = {
      eval: vi.fn(),
      hincrby: vi.fn(),
      hgetall: vi.fn().mockResolvedValue({
        'uptime_checks_total:UP': '2',
        'uptime_check_duration_ms_bucket:100': '1',
        'uptime_check_duration_ms_bucket:250': '2',
        'uptime_check_duration_ms_bucket:500': '2',
        'uptime_check_duration_ms_bucket:1000': '2',
        'uptime_check_duration_ms_bucket:2500': '2',
        'uptime_check_duration_ms_bucket:5000': '2',
        'uptime_check_duration_ms_bucket:10000': '2',
        'uptime_check_duration_ms_bucket:+Inf': '2',
        uptime_check_duration_ms_count: '2',
        uptime_check_duration_ms_sum: '175',
        check_execution_lease_contention_total: '1',
        'notification_terminal_failures_total:WEBHOOK': '3',
      }),
    };
    const snapshot = await new RedisOperationalMetrics(redis).readSnapshot();
    const output = renderPrometheusMetrics(snapshot, [
      { queue: 'uptime-checks', counts: { waiting: 4, active: 1, delayed: 2, failed: 0 } },
    ]);

    expect(output).toContain('pulseboard_uptime_checks_total{outcome="UP"} 2');
    expect(output).toContain('pulseboard_uptime_checks_total{outcome="DOWN"} 0');
    expect(output).toContain('pulseboard_uptime_check_duration_ms_bucket{le="250"} 2');
    expect(output).toContain('pulseboard_check_execution_lease_contention_total 1');
    expect(output).toContain('pulseboard_notification_terminal_failures_total{channel="WEBHOOK"} 3');
    expect(output).toContain('pulseboard_queue_jobs{queue="uptime-checks",state="waiting"} 4');
    expect(output.endsWith('\n')).toBe(true);
  });
});
