# ADR 0006: Bounded API Shutdown And Dependency Probes

- Status: Accepted
- Date: 2026-08-28

## Context

The API previously started an HTTP listener without retaining the server handle or registering signal handlers. Docker could stop the container, but the application did not explicitly stop accepting traffic, close Redis/BullMQ clients, or disconnect Prisma. Readiness and metrics also waited on dependency clients without a route-level deadline, which could make an outage appear as a hanging probe rather than a timely unhealthy response.

PulseBoard uses one small Compose deployment and does not need a separate lifecycle supervisor. It does need behavior that can be explained and reproduced during deploys and dependency failures.

## Decision

The API retains the Node HTTP server and handles `SIGINT` and `SIGTERM` through one coalesced shutdown operation. Shutdown immediately marks the process as draining, closes the HTTP listener, closes API-owned BullMQ and Redis clients, disconnects Prisma, and records a completion log.

Shutdown has a default 10-second deadline controlled by `API_SHUTDOWN_TIMEOUT_MS`. If cleanup does not finish, the API force-closes HTTP connections, logs failure, and exits nonzero. Docker Compose launches Node directly so it is PID 1 and receives the container signal without relying on package-manager signal forwarding.

`GET /health/ready` returns `503` with `reason: "shutting_down"` while draining. PostgreSQL and Redis dependency checks share a default two-second route deadline controlled by `READINESS_TIMEOUT_MS`. The internal metrics scrape has a separate default two-second deadline controlled by `METRICS_SCRAPE_TIMEOUT_MS` and returns `503` instead of a false zero snapshot when Redis or BullMQ cannot be read.

## Consequences

- A deployment can remove the API from readiness before resource cleanup finishes.
- Container stop has an observable success or failure outcome instead of relying on implicit process termination.
- Dependency outages produce bounded `503` responses and recover without restarting the API.
- Direct Node execution is less convenient than a watch command inside Compose, but it makes signal behavior deterministic and remains compatible with source execution through `tsx`.
- Route-level promise racing does not cancel Prisma or BullMQ work already in progress. The client response is bounded, but a timed-out operation may finish later after recovery. This is acceptable for low-rate operator probes and is documented rather than described as hard cancellation.
- This decision covers the API only. The worker still requires its own bounded in-flight `SIGTERM` contract and fault-injection test.

## Rejected Alternatives

- **Rely on Docker's stop timeout:** simple, but it provides no application-level draining state or owned-resource cleanup evidence.
- **Run through `pnpm` in Compose:** convenient for development, but signal forwarding depends on the process tree rather than making Node the clear container process.
- **Return readiness immediately after starting shutdown cleanup:** this leaves a window in which traffic can still be routed to a draining process.
- **Add Kubernetes lifecycle hooks:** unnecessary for the current single-host Compose scope.

## Verification

`apps/api/test/shutdown.test.ts` verifies callback-based HTTP close, repeated-signal coalescing, and deadline failure with forced connection closure. `apps/api/test/app.test.ts` verifies the draining readiness response.

`scripts/local-compose-fault-injection.sh` stops and restarts real PostgreSQL and Redis containers, verifies readiness and metrics failure/recovery, stops the API with Docker `SIGTERM`, checks exit code `0` and the completion log, then restarts the API and verifies readiness. The drill passed locally on 2026-08-28.
