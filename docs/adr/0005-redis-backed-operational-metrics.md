# ADR 0005: Redis-Backed Operational Metrics

- Status: Accepted
- Date: 2026-08-28

## Context

PulseBoard already stores durable business history in PostgreSQL and emits structured API and worker logs. Those records are useful for investigation, but they do not provide a cheap scrape-time view of queue pressure, check latency, duplicate delivery pressure, or terminal notification failures across the separate API and worker processes.

The portfolio deployment should remain a small modular monolith. Adding a metrics database, hosted observability service, or another long-running component would increase cost and operational surface before the project has real traffic evidence.

## Decision

The worker records a deliberately small set of low-cardinality operational counters and a cumulative latency histogram in the existing Redis instance:

- committed uptime check results by `UP`, `DEGRADED`, or `DOWN` outcome;
- committed uptime check duration in fixed millisecond buckets;
- check executions skipped because another worker holds a live PostgreSQL lease; and
- notifications moved to `DEAD_LETTER`, grouped by channel.

The API exposes a local operator endpoint at `GET /metrics`. At scrape time it reads the Redis counters and BullMQ queue counts for `waiting`, `active`, `delayed`, and retained `failed` jobs, then renders Prometheus text format. A scrape returns `503` if Redis or BullMQ cannot be read rather than fabricating a healthy zero snapshot.

The API and worker must use the same `OPERATIONAL_METRICS_REDIS_PREFIX`. The default is versioned as `pulseboard:operational-metrics:v1` so a future incompatible schema can use a new key without misreading old fields.

Metrics are recorded only after the corresponding PostgreSQL transaction commits. Replayed work that reuses an existing idempotent `CheckRun` does not increment the check counter again. Metric write failures are logged and do not fail or repeat already committed business operations.

The endpoint intentionally has no tenant, request, job, service, URL, or execution labels. This avoids an unbounded cardinality surface and prevents internal identifiers from leaking through a scrape. `/metrics` is not part of the public `/demo` OpenAPI or Nginx contract; operators may scrape it through the loopback-bound API or a separately protected internal path.

## Consequences

- API and worker processes share one inexpensive operational view without adding infrastructure.
- Queue depth is current state, while Redis counters are process-independent cumulative values.
- Redis is still disposable. Restarting or replacing it resets the counters and histogram, so these metrics are not durable evidence or billing data.
- The BullMQ `failed` gauge includes retained failed jobs and may include failures that have already been recovered or superseded.
- Prometheus can scrape the endpoint, but this repository does not deploy Prometheus, Alertmanager, Grafana, or a hosted monitoring service.
- The local endpoint is unauthenticated because it is intended for loopback/internal access. Publishing it requires explicit reverse-proxy authentication or network restriction.

## Rejected Alternatives

- **Store counters in PostgreSQL:** durable but adds write amplification and hot rows to the source-of-truth database for data that can be regenerated or reset.
- **Expose tenant and resource labels:** attractive for dashboards, but unsafe and high-cardinality for an operational endpoint.
- **Add Prometheus and Grafana to the default Compose stack:** useful later, but unnecessary for proving metric semantics and scrape compatibility now.
- **Return zero values when Redis is unavailable:** makes dependency failure indistinguishable from a healthy idle system.

## Verification

`packages/observability/test/metrics.test.ts` verifies atomic Redis command construction, missing-field normalization, stable series, and Prometheus rendering. Worker handler tests prove counters are emitted after a committed check, on live lease contention, and after a terminal notification transaction, while transaction rollback emits no check metric.

The Compose-backed API integration test writes known values through a real Redis client, scrapes `/metrics` without an API key, and verifies the counters, histogram, content type, and both BullMQ queue series.
