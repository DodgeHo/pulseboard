# Fault-Injection Runbook

This drill verifies the failure behavior of the local Docker Compose stack. It is intentionally small enough to run before changing API lifecycle, health checks, Redis clients, Prisma configuration, or Compose process commands.

## Scope

The script proves that:

- readiness returns `200` while PostgreSQL and Redis are reachable;
- stopping PostgreSQL changes readiness to `503`, and restarting it restores `200`;
- stopping Redis changes readiness and the metrics scrape to `503`, and restarting it restores both to `200`;
- Docker sends `SIGTERM` directly to the Node API process;
- the API stops accepting traffic, closes its owned resources, exits with code `0`, and logs `PulseBoard API stopped`; and
- restarting the API restores readiness;
- the worker receives `SIGTERM` directly, drains its BullMQ workers, exits with code `0`, and logs `PulseBoard worker stopped`; and
- the worker can be restarted after the drain.

The drill does not kill the worker during an in-flight check. Worker `SIGKILL` recovery is covered by the Compose integration suite, while bounded worker `SIGTERM` behavior remains a separate follow-up.

## Run The Drill

From a Linux shell with Docker Compose:

```bash
pnpm compose:fault-injection
```

From this repository's WSL workflow, image overrides can avoid Docker Hub availability problems:

```bash
DOCKER_BUILDKIT=0 \
COMPOSE_DOCKER_CLI_BUILD=0 \
POSTGRES_IMAGE=public.ecr.aws/docker/library/postgres:16-alpine \
REDIS_IMAGE=public.ecr.aws/docker/library/redis:7-alpine \
NODE_IMAGE=public.ecr.aws/docker/library/node:22-bookworm-slim \
bash scripts/local-compose-fault-injection.sh
```

The script restores PostgreSQL, Redis, and the API on exit. It does not remove containers or volumes.

## Expected Evidence

A successful run includes these checkpoints:

```text
baseline readiness: HTTP 200
baseline metrics: HTTP 200
PostgreSQL outage readiness: HTTP 503
PostgreSQL recovery readiness: HTTP 200
Redis outage readiness: HTTP 503
Redis outage metrics: HTTP 503
Redis recovery readiness: HTTP 200
Redis recovery metrics: HTTP 200
API graceful shutdown: exit code 0 with shutdown completion log
API restart readiness: HTTP 200
Worker graceful shutdown: exit code 0 with shutdown completion log
Fault-injection drill completed successfully.
```

On 2026-08-28, this sequence passed locally against real Compose PostgreSQL, Redis, BullMQ, and the Node API process.

## Failure Triage

If readiness does not fail during a dependency outage:

1. Confirm the API is using the Compose `DATABASE_URL` and `REDIS_URL` rather than host services.
2. Inspect `docker compose logs api` for `readiness check failed` and its request id.
3. Confirm `READINESS_TIMEOUT_MS` is a positive value and longer than normal local dependency latency.

If metrics do not fail during a Redis outage:

1. Confirm API and worker use the same `OPERATIONAL_METRICS_REDIS_PREFIX` and Compose Redis URL.
2. Inspect API logs for `metrics scrape failed`.
3. Confirm `METRICS_SCRAPE_TIMEOUT_MS` is positive.

If API shutdown exits nonzero or times out:

1. Inspect the log between `shutting down PulseBoard API` and `PulseBoard API shutdown failed`.
2. Check for stuck HTTP connections and Redis/BullMQ cleanup errors.
3. Confirm Compose runs `node --import tsx apps/api/src/index.ts` directly so Node remains PID 1 and receives `SIGTERM`.
4. Increase `API_SHUTDOWN_TIMEOUT_MS` only after identifying the slow cleanup path; do not use a longer deadline to hide a leaked resource.

If worker shutdown exits nonzero or times out:

1. Inspect `docker compose logs worker` for `PulseBoard worker shutdown failed` and the active queue/job correlation fields.
2. Compare `WORKER_SHUTDOWN_TIMEOUT_MS` with the configured HTTP check timeout and expected database commit latency.
3. Confirm Compose runs `node --import tsx apps/worker/src/index.ts` directly so Node receives `SIGTERM` as PID 1.
4. Inspect `CheckExecution` and notification leases before replaying work manually. Expired leases should be recovered by the normal scheduler rather than by editing durable result rows.

## Known Boundaries

- The route-level deadlines bound client-visible readiness and metrics latency, but JavaScript promises do not cancel the underlying Prisma or BullMQ operations. A timed-out operation may remain pending until the dependency reconnects or its client is closed.
- `/health/live` intentionally remains process-only. It may return `200` while readiness is `503`.
- Redis restart resets the non-durable operational counters. PostgreSQL business records remain authoritative.
- The idle Compose stop proves signal delivery and owned-resource cleanup. The separate worker integration test proves one in-flight uptime transaction drains before exit; this runbook does not exercise an in-flight notification provider call.
- This drill validates local process and dependency behavior. It does not prove multi-host failover, production traffic behavior, an SLA, or public-host deployment of these changes.

See [`operations.md`](operations.md), [`architecture.md`](architecture.md), [`adr/0006-bounded-api-shutdown.md`](adr/0006-bounded-api-shutdown.md), and [`adr/0007-bounded-worker-shutdown.md`](adr/0007-bounded-worker-shutdown.md).
