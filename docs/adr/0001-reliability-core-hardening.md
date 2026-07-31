# ADR 0001: Reliability Core Hardening

- **Status:** Accepted
- **Date:** 2026-07-30
- **Owners:** PulseBoard maintainers

## Context

PulseBoard schedules uptime checks and notification deliveries through BullMQ. Queue delivery is at least once: jobs can be retried, duplicated, delayed, or lost when Redis is replaced. Multiple workers can also process related jobs concurrently. The original implementation performed several database writes independently and treated the queue as the primary record of pending work, which could create duplicate incidents or leave partially written state after a failure.

The portfolio goal is a reliable modular monolith, not a distributed-systems showcase. The solution must use the existing PostgreSQL, Redis, Prisma, API, and worker boundaries without introducing Kafka, Kubernetes, microservices, or Event Sourcing.

## Decision

### 1. Accept at-least-once execution and make durable effects idempotent

We do not claim exactly-once job execution. Each scheduled check occurrence is represented by a PostgreSQL `CheckExecution` with a unique stable key:

```text
check:<uptimeCheckId>:<scheduledFor ISO timestamp>
```

API-triggered checks use request-scoped keys. `CheckRun` uses the execution key as its unique idempotency key. Incident, notification, audit, and usage side effects derive unique keys from the committed check run or incident.

The scheduler advances `UptimeCheck.nextRunAt` with compare-and-swap semantics. A scan creates one execution only if the timestamp it read is still current. It then dispatches durable pending executions; expired running leases are eligible for redispatch.

### 2. Use database leases for worker claims

A worker atomically changes a check execution from `PENDING` to `RUNNING`, or reclaims it after `leaseExpiresAt`. The claim stores a worker id and increments the attempt count. Notification delivery uses the same pattern with `QUEUED`/`FAILED`/expired `PROCESSING` rows.

Leases prevent ordinary concurrent duplication without relying on process-local locks. They also allow work to recover after a process crash. Lease expiry can still permit two external calls when a slow worker continues after expiry; database idempotency prevents duplicate durable check effects, while webhook receivers should deduplicate delivery ids.

### 3. Serialize incident decisions per service

After the external probe completes, the worker starts one PostgreSQL transaction and locks the owning `MonitoredService` row with `SELECT ... FOR UPDATE`. Within that transaction it:

1. creates or reuses the idempotent `CheckRun`;
2. evaluates recent results;
3. opens or resolves an incident;
4. creates the notification outbox row;
5. writes idempotent audit and usage records; and
6. marks the execution successful.

A partial unique index provides the final invariant:

```sql
CREATE UNIQUE INDEX "Incident_one_active_per_service_idx"
ON "Incident"("serviceId")
WHERE "status" IN ('OPEN', 'ACKNOWLEDGED');
```

The API locks an incident before applying its explicit state machine and writes the audit event in the same transaction.

### 4. Treat notifications as a transactional outbox

An incident transition creates its `Notification` row inside the incident transaction. BullMQ enqueueing happens after commit for low latency, while a recurring dispatcher scans PostgreSQL so queue publication failure does not lose the delivery.

Notification states are:

```text
QUEUED -> PROCESSING -> SENT
                    -> FAILED -> PROCESSING
                    -> DEAD_LETTER
FAILED or DEAD_LETTER --manual replay--> QUEUED
```

Every provider call creates a `NotificationAttempt`. Temporary failures receive exponential retry scheduling. Permanent HTTP failures (most 4xx responses) or an exhausted replay cycle enter `DEAD_LETTER`. Manual replay is available through `POST /v1/notifications/:id/replay`; it resets the cycle count but preserves lifetime attempt history.

## Consequences

### Positive

- Duplicate queue delivery does not duplicate committed check runs, incidents, notifications, audits, or usage metrics.
- Concurrent workers can process different services while same-service incident decisions remain serialized.
- PostgreSQL can recover work after Redis or worker loss.
- Transaction failure leaves no half-written incident transition.
- Delivery failures and operator replays are visible and auditable.

### Costs and tradeoffs

- Additional tables, indexes, state transitions, and polling queries increase implementation and operational complexity.
- PostgreSQL is now both the source of truth and the coordination mechanism, so lock duration and query performance must be monitored.
- The external probe and webhook call cannot participate in the database transaction. They remain at-least-once effects.
- The notification dispatcher may enqueue a job that another dispatcher also observes; the database claim makes the duplicate queue work harmless.
- Stable keys must remain compatible when scheduling semantics change.

## Rejected alternatives

- **Exactly-once queue processing:** not achievable for arbitrary external HTTP calls and would create misleading guarantees.
- **In-memory mutexes:** do not coordinate multiple worker processes and disappear on restart.
- **Redis-only locks/state:** would make disposable queue infrastructure authoritative and complicate recovery after Redis loss.
- **Kafka, Event Sourcing, or a new outbox microservice:** disproportionate to the current modular-monolith scope.
- **Silently repairing duplicate active incidents in the migration:** risks data loss and hides an invariant violation. Operators must inspect and resolve any duplicates before applying the index.

## Follow-up

- Monitor counts and oldest age for `PENDING`/expired `RUNNING` executions and `FAILED`/`DEAD_LETTER` notifications.
- Consider an explicit receiver-facing delivery id header when webhook integrations become public.
- Add provider-specific authentication only through secret-managed runtime configuration; never commit tokens.
- Revisit lease durations if production latency approaches the configured lease windows.
