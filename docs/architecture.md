# Architecture Notes

PulseBoard is a modular monolith with separate runtime processes for API and background workers.

## Phase 1 Scope

- Hono API with API key auth.
- PostgreSQL schema for tenants, monitored resources, check runs, incidents, webhooks, notifications, usage metrics, and audit logs.
- Redis-backed BullMQ queues.
- Worker-driven uptime checks with incident transitions.
- OpenAPI JSON and Scalar API reference.
- Unit tests for business rules, handler-level worker tests, and integration tests for representative API flows.
- Redis-backed write-path rate limiting for authenticated mutation routes.

## Runtime Boundaries

- The API process owns synchronous HTTP concerns: validation, auth, CRUD operations, webhook ingest, and queue enqueueing.
- The worker owns background concerns: scheduled checks, HTTP probing, incident transition decisions, and mocked notification delivery.
- PostgreSQL is the source of truth.
- Redis is disposable queue infrastructure.

## Observability

- API requests receive or generate an `X-Request-Id`.
- API logs include request id, method, path, status, duration, and authenticated user id when available.
- Worker logs include queue scheduling, check execution, incident transitions, and notification sends.
- PostgreSQL keeps durable operational history through check runs, audit logs, usage metrics, incidents, and notifications.

## Local-First Development

Development starts in WSL Ubuntu with Docker Compose. This keeps the developer workflow close to a production Linux environment without creating cloud cost early.
## Reliability Core (Phase 3)

PulseBoard treats BullMQ delivery as **at least once**. Redis is useful for dispatch and backoff, but PostgreSQL remains the authoritative record of whether a scheduled check or notification delivery may change durable state. The design does not claim exactly-once execution; it provides idempotent durable effects when jobs are delivered more than once.

### Check execution and concurrent workers

1. The scheduler advances `UptimeCheck.nextRunAt` with a compare-and-swap update. Only the scheduler that observes the expected timestamp may create that scheduled execution.
2. Every scheduled occurrence has a durable `CheckExecution` row and a stable key: `check:<uptimeCheckId>:<scheduledFor ISO>`.
3. A worker claims a `PENDING` execution, or an expired `RUNNING` execution, by atomically changing its status and lease owner. The dispatcher also re-enqueues expired executions so a worker or Redis process loss does not permanently strand work.
4. The HTTP probe happens outside the database transaction. Its durable effects happen inside one transaction after locking the owning `MonitoredService` row with `FOR UPDATE`.
5. `CheckRun.idempotencyKey` is unique. A repeated execution that finds the run already committed links the execution to that run and exits without repeating incident, audit, usage, or outbox writes.

Multiple services can be processed concurrently. Checks for the same service serialize only while the short result/incident transaction holds the service row lock.

### Incident consistency

The result transaction writes the `CheckRun`, evaluates recent outcomes, opens or resolves the incident, creates the notification outbox record, writes audit and usage records, and completes the execution atomically. A PostgreSQL partial unique index enforces at most one incident in `OPEN` or `ACKNOWLEDGED` state per service, even if application-level checks race.

API-driven transitions follow an explicit state machine:

- `OPEN -> ACKNOWLEDGED | RESOLVED`
- `ACKNOWLEDGED -> RESOLVED`
- `RESOLVED` is terminal
- same-status detail updates are allowed

The API locks the incident row and writes the transition plus its audit record in one transaction.

### Notification outbox and recovery

Incident transitions create a durable `Notification` in the same transaction as the incident state change. Queue publication is an acceleration path, not the source of truth: a recurring dispatcher scans due `QUEUED`/`FAILED` rows and expired `PROCESSING` leases.

Delivery state is `QUEUED -> PROCESSING -> SENT`, with temporary failures moving to `FAILED` and permanent or exhausted failures moving to `DEAD_LETTER`. Each provider call creates a `NotificationAttempt`, stores the response status or failure reason, increments total and replay-cycle counters, and uses exponential retry delay. Manual replay resets the cycle counter and requeues the same notification through `POST /v1/notifications/:id/replay`; total attempts remain visible.

### Reliability boundaries

- A network call cannot be made atomically with a PostgreSQL commit. A webhook receiver may observe a duplicate if a worker sends successfully and fails before recording `SENT`, or if a delivery exceeds its lease. Receivers should use the notification id as their deduplication key.
- A probe may be performed again after a worker crash or lease expiry. The unique execution/check-run key prevents duplicate durable effects, but cannot make the external HTTP GET itself exactly once.
- Leases require reasonably synchronized clocks and configured timeouts longer than normal provider/check latency.
- The outbox currently uses polling rather than PostgreSQL notifications or a dedicated relay. This is intentional for the modular-monolith scope.
- Email and Slack providers remain mock-compatible demo transports. Webhooks perform real HTTP POSTs but require no committed token.

See [`adr/0001-reliability-core-hardening.md`](adr/0001-reliability-core-hardening.md) for the decision record.
