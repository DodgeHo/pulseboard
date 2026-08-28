# ADR 0004: Worker Crash Recovery And Dispatch Generations

- Status: Accepted
- Date: 2026-08-28

## Context

PulseBoard delivers uptime work through BullMQ while PostgreSQL stores the authoritative `CheckExecution` state. A worker first claims an execution with a database lease, performs the external HTTP request, and then commits the check result, incident transition, notification outbox row, audit events, usage metric, and execution completion in one transaction.

The original queue identity reused one retained BullMQ job id for every delivery of an execution. That creates a recovery race when a worker is killed inside the result transaction:

1. PostgreSQL rolls back the partial result transaction, but the separately committed execution lease remains `RUNNING` until it expires.
2. BullMQ may detect the original job as stalled before the database lease expires.
3. A replacement worker receives that stalled job, cannot claim the still-leased execution, and returns without changing durable state.
4. BullMQ marks the retained job complete.
5. A later scheduler scan cannot add the same completed job id, so the database execution can remain stranded.

Correctness should not depend on configuring the BullMQ lock duration and PostgreSQL lease duration to expire in one exact order.

## Decision

PostgreSQL remains authoritative and BullMQ delivery remains at least once.

Each scheduler dispatch uses a generation-aware job id:

```text
check-execution-<executionId>-<attemptNumber>
```

The next dispatch generation is `CheckExecution.attemptCount + 1`. A worker increments `attemptCount` only when it atomically claims a `PENDING` execution or a `RUNNING` execution with an expired lease. If an earlier stalled delivery completes while the database lease is still active, the scheduler can add a new generation after lease expiry instead of colliding with the completed BullMQ job.

The HTTP request remains outside the result transaction. Durable result effects remain inside one PostgreSQL transaction protected by a service-row lock and unique idempotency keys. A process kill after `CheckRun` insertion therefore rolls back the run, incident, notification, audit, usage, and execution-completion writes together.

Worker recovery timing is explicit configuration:

- `CHECK_EXECUTION_LEASE_MS`
- `UPTIME_JOB_LOCK_DURATION_MS`
- `UPTIME_JOB_STALLED_INTERVAL_MS`

Structured worker logs include the execution, worker, attempt, workspace, project, service, uptime check, BullMQ job, and queue identifiers needed to correlate a failed delivery with its replacement.

## Consequences

- A completed stale delivery no longer prevents a later scheduler generation from being enqueued.
- Recovery latency is bounded by the PostgreSQL lease expiry plus the next scheduler scan, assuming PostgreSQL, Redis, and a worker are available.
- The external HTTP request can occur more than once. PulseBoard guarantees idempotent durable database effects, not exactly-once network activity.
- Retained queue jobs may show multiple generations for one execution. This is intentional operational evidence rather than a claim that BullMQ deduplicates the whole workflow.
- The scheduler and worker still require reasonably synchronized clocks. Lease values must exceed normal check execution time, including the configured HTTP timeout and expected database latency.

## Verification

`apps/worker/test/recovery.integration.test.ts` starts real BullMQ workers in child processes against PostgreSQL and Redis. It sends `SIGKILL` immediately after `CheckRun` creation inside the transaction, verifies rollback, intentionally lets BullMQ recover before the database lease expires, and then proves a fresh scheduler generation commits exactly one durable incident flow.

Run the fault-injection path with:

```bash
pnpm compose:integration
```

The test is skipped by the normal unit-test command and enabled only by `RUN_WORKER_INTEGRATION_TESTS=true` in the Compose integration script.
