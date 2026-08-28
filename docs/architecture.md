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

## Executable API Contract Boundary

The API exports one `openApiDocument` for `/demo/openapi.json` and Scalar. A Vitest contract suite resolves response schemas from that same object, registers the full document with Ajv, calls the real Hono application, and validates the returned JSON. Represented resource schemas reject undocumented fields as well as missing required fields, so response drift fails locally and in CI rather than remaining a documentation-only discrepancy.

Coverage is intentionally representative: liveness, readiness, the shared authentication error, workspace lists, uptime-check create/list/detail responses, and incident list/detail responses including notification attempts. The database-backed cases run through the normal authenticated handlers with PostgreSQL and Redis available. Request bodies and many other endpoint responses remain description-only, so this is not a claim of complete OpenAPI conformance. `/metrics` is an internal operator surface and remains outside the public document. See [`adr/0011-executable-openapi-response-contracts.md`](adr/0011-executable-openapi-response-contracts.md).

## API Lifecycle And Dependency Health

The Compose API process runs Node directly as PID 1. `SIGINT` and `SIGTERM` start one bounded shutdown operation: readiness changes to `503`, the HTTP listener stops accepting traffic, API-owned BullMQ and Redis resources close, and Prisma disconnects. The default deadline is 10 seconds; expiry force-closes HTTP connections and exits nonzero. See [`adr/0006-bounded-api-shutdown.md`](adr/0006-bounded-api-shutdown.md).

Readiness proves that both PostgreSQL and Redis are reachable and returns within the configured route deadline. The internal metrics endpoint has a separate deadline and returns `503` when Redis or BullMQ cannot provide a snapshot. Both endpoints recover after the dependency returns without restarting the API.

These deadlines bound the HTTP response, not the underlying JavaScript operation: Prisma and BullMQ promises do not support cancellation in this implementation. A timed-out probe may remain pending until the dependency recovers or the client closes. Operator scrape rates should therefore remain modest, and a future high-frequency deployment should use driver-level cancellation or isolated probe clients rather than layering more `Promise.race` calls.

## Worker Lifecycle

The Compose worker also runs Node directly as PID 1. `SIGINT` and `SIGTERM` start one coalesced bounded shutdown operation. The uptime and notification BullMQ workers begin graceful drain concurrently; shared queue clients, metrics Redis, and Prisma close only after both consumers settle. The default `WORKER_SHUTDOWN_TIMEOUT_MS` deadline is 10 seconds. Expiry force-closes both workers and exits nonzero instead of leaving container termination unbounded. See [`adr/0007-bounded-worker-shutdown.md`](adr/0007-bounded-worker-shutdown.md).

Graceful drain allows an active result transaction to commit before exit. Forced termination relies on the existing BullMQ stalled-job behavior, PostgreSQL execution lease, dispatch generation, and idempotent result transaction for recovery. Force-closing a BullMQ worker does not cancel an HTTP request, Prisma operation, or notification provider call already running, so external effects remain at least once even though committed PostgreSQL effects are deduplicated.

## Tenant Authorization Boundary

An API key authenticates a `User`, not a workspace. Workspace access is resolved through `WorkspaceMember`; nested resources prove ownership by joining back through project and workspace membership. This rule is applied to reads and writes for projects, monitored services, uptime checks, incidents, notifications, webhook ingestion, audit logs, and usage metrics.

Resource endpoints deliberately return the same `404` for unknown and foreign ids. Nested collection endpoints first authorize the parent, so a guessed foreign workspace, project, or service id does not produce a distinguishable empty success response. Global audit and usage collection queries apply membership inside the database filter; an explicit foreign `workspaceId` therefore returns an empty collection.

The integration suite creates two independent users, API keys, memberships, and resource trees in PostgreSQL. It attempts cross-tenant reads, creates, updates, deletes, notification replay, webhook ingestion, API-key revocation, and operational-history filters, then queries PostgreSQL to prove the foreign rows were unchanged. This is an application-level boundary; PostgreSQL row-level security is not enabled, so every new repository query must preserve the membership predicate.

## API Key Storage

New keys contain 24 random bytes encoded as base64url with a `pb_` prefix. The plaintext is returned once. PostgreSQL stores only a display prefix, salted SHA-256 digest, ownership, creation/last-use timestamps, and optional revocation timestamp.

Salted SHA-256 is suitable here because generated keys have high entropy and are not human passwords. The global salt is still secret configuration: in production it must be independently generated, must contain at least 32 characters, and cannot use the local fallback. The API validates this before listening, and the production migration/seed service validates it before hashing the demo key. The model currently has no expiry, rotation lineage, per-key salt, or grace-period workflow. See [`adr/0003-tenant-isolation-and-api-key-storage.md`](adr/0003-tenant-isolation-and-api-key-storage.md).

## Observability

- API requests receive or generate an `X-Request-Id`.
- API logs include request id, method, path, status, duration, and authenticated user id when available.
- Worker logs include queue scheduling, check execution, incident transitions, notification sends, and request/job/tenant/resource correlation fields where those identifiers exist.
- PostgreSQL keeps durable operational history through check runs, audit logs, usage metrics, incidents, and notifications.
- Redis stores low-cardinality operational counters and a cumulative check-duration histogram shared by the API and worker processes.
- The local `GET /metrics` endpoint renders Prometheus-compatible text and adds current BullMQ queue counts for waiting, active, delayed, and retained failed jobs.

Metrics are recorded only after the related PostgreSQL transaction commits. Idempotent reprocessing that reuses an existing `CheckRun` does not increment check totals twice. Metric write failure is logged but never rolls back or retries an already committed business operation.

The metric surface intentionally excludes tenant, request, job, service, URL, and execution labels. Redis replacement resets cumulative counters, and BullMQ failed-job counts include retained history, so these signals are operational hints rather than durable evidence. `/metrics` is a loopback/internal operator route and is intentionally absent from the public `/demo` reverse-proxy and OpenAPI contract. See [`adr/0005-redis-backed-operational-metrics.md`](adr/0005-redis-backed-operational-metrics.md).

## Local-First Development

Development starts in WSL Ubuntu with Docker Compose. This keeps the developer workflow close to a production Linux environment without creating cloud cost early.

## Data Recovery Boundary

PostgreSQL is the only durable recovery source. A repeatable Compose rehearsal applies the real migrations and seed, creates representative reliability state, writes a custom-format logical backup, restores it into an independent database, re-runs invariants, and compares fingerprints for every current application table plus `_prisma_migrations`. The rehearsal uses a unique Compose project with separate volumes and never targets the normal `postgres_data` volume.

Redis is deliberately excluded. BullMQ deliveries and operational-metric counters may be lost when Redis is replaced; PostgreSQL-backed uptime executions and notification rows allow dispatchers to rebuild pending work. Metric history is not reconstructed. The logical backup also excludes PostgreSQL cluster roles, tablespaces, host configuration, application secrets, and reverse-proxy files.

This is a tested recovery procedure, not continuous backup or PITR. RPO is limited by the age of the last retained verified dump, and RTO has not been measured for production-sized data. See [`postgresql-backup-restore.md`](postgresql-backup-restore.md) and [`adr/0008-postgresql-logical-backup-restore.md`](adr/0008-postgresql-logical-backup-restore.md).

## Application Release And Rollback Boundary

The production-like Compose contract separates application rollback from data recovery. Migration, API, worker, and static-site tasks select one immutable image tag or digest, and `GET /health/live` exposes its embedded build revision and reviewed compatibility contract. Deployments apply only checked-in forward migrations; rollback recreates application containers from a previously recorded image without rebuilding a Git checkout and without attempting a Prisma down-migration.

A project-scoped rehearsal builds a checked-in pre-`0003` baseline contract with an older generated Prisma Client and a current candidate contract with nullable `UptimeCheck.description`. It verifies the `/demo/*` public contract, writes the new field with the candidate, then rolls API and worker back without reversing the migration. The old client still reads and updates old fields, its API omits the unknown field, and PostgreSQL retains the candidate-written value. Source fingerprints, OCI labels, content-addressed image IDs, running image IDs, migration contents, tenant state, audit history, and PostgreSQL identity are recorded as evidence.

This proves one controlled expand-contract case, not arbitrary old-binary compatibility, destructive migration rollback, image signing, registry attestation, or zero downtime. See [`application-rollback.md`](application-rollback.md), [`adr/0009-immutable-image-application-rollback.md`](adr/0009-immutable-image-application-rollback.md), and [`adr/0010-expand-contract-compatibility-fixture.md`](adr/0010-expand-contract-compatibility-fixture.md).

## Reliability Core (Phase 3)

PulseBoard treats BullMQ delivery as **at least once**. Redis is useful for dispatch and backoff, but PostgreSQL remains the authoritative record of whether a scheduled check or notification delivery may change durable state. The design does not claim exactly-once execution; it provides idempotent durable effects when jobs are delivered more than once.

### Check execution and concurrent workers

1. The scheduler advances `UptimeCheck.nextRunAt` with a compare-and-swap update. Only the scheduler that observes the expected timestamp may create that scheduled execution.
2. Every scheduled occurrence has a durable `CheckExecution` row and a stable key: `check:<uptimeCheckId>:<scheduledFor ISO>`.
3. A worker claims a `PENDING` execution, or an expired `RUNNING` execution, by atomically changing its status and lease owner. Each dispatch uses `check-execution-<executionId>-<attemptNumber>`, so an earlier stalled delivery that completed during database lease contention cannot block a fresh scheduler generation after lease expiry.
4. The HTTP probe happens outside the database transaction. Its durable effects happen inside one transaction after locking the owning `MonitoredService` row with `FOR UPDATE`.
5. `CheckRun.idempotencyKey` is unique. A repeated execution that finds the run already committed links the execution to that run and exits without repeating incident, audit, usage, or outbox writes.

Multiple services can be processed concurrently. Checks for the same service serialize only while the short result/incident transaction holds the service row lock.

### Crash and restart recovery

The PostgreSQL lease and BullMQ lock are separate recovery mechanisms. PulseBoard does not require them to expire in a particular order. If a worker is killed inside the result transaction, PostgreSQL rolls back every partial durable effect while the committed execution lease remains visible. BullMQ may redeliver the stalled job before that lease expires; the replacement worker records lease contention and leaves the database unchanged. After lease expiry, the scheduler publishes the next dispatch generation and the execution can be claimed again.

Recovery latency is therefore the remaining database lease plus the next scheduler scan, assuming dependencies are available. The fault-injection integration test deliberately uses a shorter BullMQ lock than database lease to exercise this ordering. See [`adr/0004-worker-crash-recovery.md`](adr/0004-worker-crash-recovery.md).

A complementary `SIGTERM` integration scenario pauses inside the still-uncommitted result transaction, starts the production shutdown helper, and proves that graceful drain commits one complete durable flow before the worker exits successfully. The `SIGKILL` scenario remains necessary evidence for the path where graceful drain is impossible.

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

### Outbound request safety

Uptime target URLs are untrusted even after API-key authentication. The API resolves and validates a target before persistence, and the worker repeats validation immediately before each network request. Only public HTTP(S) addresses are accepted. Local and internal hostnames, private/reserved IP ranges, cloud metadata ranges, mixed public/private DNS answers, and embedded credentials are rejected.

The worker does not use automatic redirects. Each redirect hop is resolved and validated again, and the approved IP is pinned into the actual HTTP/TLS connection while the original hostname remains available for the HTTP `Host` header and TLS SNI. One timeout covers DNS plus up to three redirect hops. See [`adr/0002-ssrf-safe-http-checks.md`](adr/0002-ssrf-safe-http-checks.md) for the threat model and boundaries.

See [`adr/0001-reliability-core-hardening.md`](adr/0001-reliability-core-hardening.md) for the decision record.
