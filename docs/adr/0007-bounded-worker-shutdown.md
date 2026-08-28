# ADR 0007: Bounded Worker Shutdown

- Status: Accepted
- Date: 2026-08-28

## Context

BullMQ delivers jobs at least once, while PostgreSQL stores the authoritative execution lease and durable result. The worker previously handled `SIGINT` and `SIGTERM` by closing its two BullMQ workers sequentially and then closing queue, metrics, and database resources. That implementation had three operational gaps:

1. repeated signals could start overlapping cleanup;
2. the first worker could wait indefinitely for an active job while the second worker continued accepting jobs; and
3. Compose launched the worker through a package-manager process, so direct signal delivery to Node was not explicit.

A normal deployment should allow a short in-flight check or notification to finish. It must not wait forever for a hung HTTP request, provider call, Redis operation, or database operation.

## Decision

The worker now runs Node directly as PID 1 in Docker Compose. `SIGINT` and `SIGTERM` start one coalesced shutdown operation.

Both BullMQ workers begin graceful `close()` concurrently. This stops new job acquisition and waits for active processors. Only after both workers settle does the process close queue clients, the metrics Redis client, and Prisma. Cleanup uses `Promise.allSettled` so one failed close does not prevent the remaining owned resources from receiving a close attempt.

Shutdown has a default 10-second deadline configured by `WORKER_SHUTDOWN_TIMEOUT_MS`. If graceful drain exceeds the deadline, both BullMQ workers receive `close(true)`, the process logs failure, and exits nonzero. Forced termination may leave a PostgreSQL execution or notification lease in its processing state. The scheduler can dispatch a fresh job generation after that lease expires; unique keys and the transactional result flow prevent duplicate durable effects.

## Consequences

- Short in-flight jobs can commit before a normal container stop completes.
- A hung processor cannot block a deploy indefinitely.
- Uptime and notification workers stop accepting jobs at the same time instead of sequentially.
- Deadline expiry is an unhealthy shutdown outcome and intentionally produces a nonzero exit code.
- Force-closing a BullMQ worker does not cancel JavaScript, HTTP, Prisma, or provider promises. Process exit is the final interruption boundary.
- An external uptime request or notification provider call may have happened before forced exit. PulseBoard guarantees idempotent database effects, not exactly-once external side effects.
- The shutdown deadline should exceed the normal HTTP check timeout plus expected database commit latency. Increasing it is not a substitute for diagnosing a stuck dependency.

## Rejected Alternatives

- **Wait indefinitely for `Worker.close()`:** preserves every active processor but can block deploys and host shutdown forever.
- **Always force-close immediately:** short jobs would be interrupted unnecessarily and recovery latency would increase.
- **Close workers sequentially:** the second worker could continue claiming work while the first one drains.
- **Add a separate process supervisor:** unnecessary for the current single-host Compose deployment.

## Verification

`apps/worker/test/shutdown.test.ts` verifies concurrent drain, cleanup after worker settlement, aggregate cleanup failure, repeated-signal coalescing, and forced close on deadline expiry.

`apps/worker/test/recovery.integration.test.ts` sends `SIGTERM` after an in-flight check has inserted its `CheckRun` inside an uncommitted transaction. The shared shutdown implementation waits for the handler to commit, exits with code `0`, and the test proves exactly one check run, incident, notification, audit flow, usage metric, and completed execution.

The existing crash-recovery scenario remains complementary evidence: `SIGKILL` rolls back the transaction, leaves a leased execution, and a later dispatch generation commits exactly one durable result after lease expiry.

`scripts/local-compose-fault-injection.sh` also stops the real Compose worker, verifies exit code `0` and the `PulseBoard worker stopped` log, then restarts it.
