# Operations Runbook

This runbook is intentionally small. PulseBoard is a portfolio-grade backend demo, not a production service, but the operational model should still be easy to explain.

## Local Health Checks

```bash
curl http://localhost:4000/health/live
curl http://localhost:4000/health/ready
```

- `/health/live` proves the API process is responding.
- `/health/ready` proves the API can reach PostgreSQL and Redis.
- `/health/ready` returns `503` immediately after graceful shutdown starts, before resource cleanup completes.
- PostgreSQL and Redis readiness work is bounded by `READINESS_TIMEOUT_MS` (default `2000`).

## Public Demo Checks

The current public portfolio entry point is `https://anlan.store/` on the existing Tencent Ubuntu host.

```bash
curl -I https://www.anlan.store
curl https://anlan.store/demo/health/live
curl https://anlan.store/demo/health/ready
curl -I https://anlan.store/demo/docs
curl https://anlan.store/demo/openapi.json
```

- `www.anlan.store` should redirect to `https://anlan.store/`.
- `/v1/*` API routes remain API-key protected.
- PostgreSQL and Redis remain private to Docker Compose.
- Existing Career Radar `/jobs/` and study portal paths `/saa/`, `/sap/`, and `/ispm/` remain served by Nginx.

## Request Correlation

The API returns an `X-Request-Id` header on every response. Clients may pass their own request id:

```bash
curl -H "X-Request-Id: demo-123" http://localhost:4000/health/live -i
```

Structured API logs include:

- `requestId`
- `method`
- `path`
- `status`
- `durationMs`
- `userId` when API key auth has completed

Error responses also include `requestId`, so a reported API failure can be matched to logs.

## API Key Configuration And Replacement

Local development may use `API_KEY_HASH_SALT=local-development-only`. Never use that value outside local development. With `NODE_ENV=production`, API startup and the production seed path reject a missing salt, the local fallback, or a salt shorter than 32 characters.

Generate the API key hash salt independently from the bearer keys and store it in the server-side secret configuration. For example:

```bash
openssl rand -base64 48
```

Changing the salt invalidates every stored API key hash. Treat a salt change as a credential migration: create replacement keys under the new plan, update clients, and revoke old keys before removing the previous deployment. PulseBoard does not yet support two active hash salts or automatic rotation lineage, so an unplanned salt change requires restoring the previous secret or reseeding/reissuing keys.

Application keys are replaced manually:

1. Create a new key and capture the plaintext once.
2. Update the client secret store and verify the replacement key.
3. Revoke the old key through `DELETE /v1/api-keys/:id`.

Do not log plaintext keys or place them in committed `.env` files.

## Tenant Isolation Checks

Run the PostgreSQL-backed API integration suite before changing authorization predicates:

```bash
pnpm compose:integration
```

The two-tenant matrix covers resource CRUD, nested collections, API-key ownership, incidents, notification replay, webhook writes, audit logs, and usage metrics. Foreign resource ids receive tenant-safe `404` responses; foreign audit/usage filters return empty arrays. The test also verifies directly in PostgreSQL that denied requests did not mutate or create foreign data.

## Background Worker Signals

Worker logs include queue scheduling, uptime check execution, incident transitions, notification sends, and failed BullMQ jobs. The worker records check activity in PostgreSQL through `CheckRun`, `AuditLog`, and `UsageMetric`.

Uptime execution logs include `executionId`, `workerId`, `attemptNumber`, `workspaceId`, `projectId`, `serviceId`, `uptimeCheckId`, `jobId`, and `queueName`. Use these fields to follow one database execution across a stalled BullMQ delivery and a later dispatch generation.

Incident automation follows a small state machine:

- Consecutive `DOWN` or `DEGRADED` check runs open an incident once the check threshold is reached.
- Consecutive `UP` check runs resolve an `OPEN` or `ACKNOWLEDGED` incident once the recovery threshold is reached.
- Mock email or Slack notifications are stored in PostgreSQL and then marked `SENT` by the notification worker.
- Audit logs are workspace-scoped for check runs, incident transitions, and incident-linked notifications.

## Operational Metrics

The API exposes Prometheus text on the local operator route:

```bash
curl --fail --silent http://127.0.0.1:4000/metrics
```

The route is intentionally not published under `/demo`. Keep it loopback-only or protect a future internal reverse-proxy route with network and authentication controls. API-key authentication is not used for the local scrape because the series are system-level rather than tenant-level.

Metrics collection is bounded by `METRICS_SCRAPE_TIMEOUT_MS` (default `2000`). Redis or BullMQ failure returns `503`; the endpoint does not publish a fabricated zero snapshot.

Available signals:

| Metric | Interpretation |
| --- | --- |
| `pulseboard_uptime_checks_total` | Committed check results by outcome. Compare changes over the same observation window; do not treat a lifetime total as a failure rate. |
| `pulseboard_uptime_check_duration_ms` | Cumulative latency histogram for committed checks. A shift into higher buckets can indicate target, DNS, network, or worker pressure. |
| `pulseboard_check_execution_lease_contention_total` | Duplicate/stalled deliveries that found a live PostgreSQL lease. Occasional increments are compatible with at-least-once delivery; sustained growth needs investigation. |
| `pulseboard_notification_terminal_failures_total` | Notifications committed to `DEAD_LETTER` by channel. Any increment should be matched to `NotificationAttempt`, audit, and worker log records. |
| `pulseboard_queue_jobs` | BullMQ waiting, active, delayed, and retained failed jobs at scrape time. `failed` includes retained history, not only actionable work. |

This repository does not claim production alert thresholds because it has no representative traffic baseline. For a local or staging investigation:

1. Confirm `/health/ready` and `/metrics` both respond. A `503` scrape means Redis or BullMQ collection failed; it is not converted to zero.
2. Compare queue waiting/delayed counts over several scheduler intervals. A count that does not drain is more meaningful than one transient sample.
3. Correlate lease-contention growth with worker logs using `executionId`, `workerId`, `jobId`, and `queueName`.
4. Query the matching `CheckExecution`, `CheckRun`, `Notification`, and `NotificationAttempt` rows before replaying or changing leases.
5. Preserve the logs and database state before restarting dependencies when investigating a reproducible failure.

Redis is disposable in this design. Redis restart or replacement resets the cumulative counters and histogram. Durable check, incident, notification, audit, and attempt records remain in PostgreSQL.

## API And Worker Lifecycle Drill

Run the repeatable Compose drill after changing API startup, shutdown, health probes, Redis clients, Prisma configuration, metrics, or Compose commands:

```bash
pnpm compose:fault-injection
```

The drill stops and restarts PostgreSQL and Redis, verifies bounded readiness and metrics failure/recovery, sends `SIGTERM` to the API and worker containers, checks exit code `0` and both shutdown completion logs, then restarts both processes and verifies readiness. The full procedure, expected output, WSL image overrides, triage steps, and known boundaries are in [`fault-injection.md`](fault-injection.md).

The API uses `API_SHUTDOWN_TIMEOUT_MS` (default `10000`). It marks readiness unavailable, stops accepting HTTP traffic, closes API-owned BullMQ/Redis resources, disconnects Prisma, and exits successfully. Deadline expiry force-closes HTTP connections and exits nonzero. Compose runs Node directly as PID 1 so the application receives container signals without depending on package-manager forwarding.

The worker uses `WORKER_SHUTDOWN_TIMEOUT_MS` (default `10000`). It starts `Worker.close()` for the uptime and notification consumers concurrently, waits for active processors to finish, and only then closes shared queue clients, metrics Redis, and Prisma. Repeated signals share one shutdown operation. Deadline expiry force-closes both BullMQ workers and exits nonzero so the container restart policy or operator can recover work through BullMQ redelivery and the PostgreSQL execution lease.

The timeout is a process-lifecycle bound, not cancellation of arbitrary JavaScript work. A forced close cannot cancel an HTTP request, Prisma query, or provider call that is already executing. Durable database effects remain idempotent, but an external probe or notification can still be observed more than once across forced termination.

## Worker Crash And Graceful-Drain Integration Drills

Run the PostgreSQL/Redis/BullMQ fault-injection test with the full integration suite:

```bash
pnpm compose:integration
```

The crash scenario kills a child process with `SIGKILL` immediately after inserting a `CheckRun` inside the result transaction. It verifies that no partial run, incident, notification, audit, or usage row commits. It then starts a replacement worker, lets BullMQ redeliver the stalled job while the database lease is still active, waits for lease expiry, invokes the scheduler, and verifies that the next dispatch generation commits exactly one result flow.

The graceful scenario sends `SIGTERM` at the same in-flight transaction boundary. The shared bounded-shutdown path waits for the active processor, the child exits `0`, and the test proves exactly one successful execution, check run, incident, notification, incident/check audit pair, usage metric, and completed BullMQ job. This is stronger than testing only an idle worker because it exercises signal handling while PostgreSQL work is still uncommitted.

The relevant timing settings are:

- `CHECK_EXECUTION_LEASE_MS`: database ownership window for one execution attempt.
- `UPTIME_JOB_LOCK_DURATION_MS`: BullMQ lock lifetime for an active uptime job.
- `UPTIME_JOB_STALLED_INTERVAL_MS`: how often BullMQ checks for lost locks.

Do not treat matching lock and lease values as the correctness mechanism. Generation-aware job ids allow the scheduler to recover even when the stalled job is marked complete before the database lease expires. In normal operation, investigate repeated lease-contention logs, rising attempt numbers, or executions that remain `RUNNING` beyond one lease plus one scheduler interval.

The recovery guarantee applies to durable PostgreSQL effects. The external HTTP endpoint can still receive more than one probe when a process dies after the request but before completion is committed.

## Unsafe Target Rejections

Uptime check create/update requests return HTTP 400 when the target is not a public HTTP(S) endpoint. Worker-side rejections are recorded as `DOWN` check results because the worker repeats DNS and address validation immediately before connecting.

Expected rejection categories include localhost and internal hostnames, private or reserved IP ranges, cloud metadata endpoints, embedded URL credentials, mixed public/private DNS answers, and redirects into any of those targets. Do not add a global bypass for private monitoring. A future private-probe feature would need an explicit tenant-scoped allowlist plus host/network egress controls.

Application validation is not the only production control. Keep cloud metadata disabled where possible and apply outbound firewall or network policy rules to the worker host.

## Local Recovery

Reset local data:

```bash
docker compose down -v
docker compose up --build
```

Re-run database setup without rebuilding containers:

```bash
pnpm db:generate
pnpm db:deploy
pnpm db:seed
```

## PostgreSQL Backup And Restore

Run the isolated logical backup/restore rehearsal after migration, schema, seed, or recovery-script changes:

```bash
pnpm compose:backup-restore
```

The rehearsal creates its own Compose project and source/restore volumes, writes a custom-format archive under ignored `.artifacts/`, verifies source and restored business invariants, and compares complete table fingerprints. Cleanup removes only rehearsal resources.

Do not use `docker compose down -v` as a recovery technique for data that matters. Before a production-like update, create a restricted logical backup, record the application commit and PostgreSQL major version, and prove the archive in an isolated restore target. A real recovery must stop writers, restore the application version paired with the backup, validate migrations and authenticated reads, and retain the pre-recovery volume until acceptance.

The full command sequence, archive handling rules, Redis recovery boundary, and honest RPO/RTO limitations are in [`postgresql-backup-restore.md`](postgresql-backup-restore.md). The design decision is recorded in [`adr/0008-postgresql-logical-backup-restore.md`](adr/0008-postgresql-logical-backup-restore.md).

## Staging Deployment Guardrails

Before using the Tencent Cloud Ubuntu server:

- Do not commit SSH keys, passwords, DNS tokens, or provider credentials.
- Keep the server as staging rehearsal, not the final overseas-facing demo.
- Prefer Docker Compose with restart policies or simple systemd units.
- Put HTTPS and reverse proxy config in documented files before exposing the API.
- Roll application containers back only by a previously recorded immutable image digest; do not rebuild a previous commit on the host or automatically reverse migrations.
- Record both `release` and `contract` from `/health/live`, then confirm the selected image OCI labels match those values.
- Review every migration against the previous application contract. The checked-in baseline fixture proves only the nullable `UptimeCheck.description` expansion, not later or destructive changes.
- Follow [`application-rollback.md`](application-rollback.md) and verify the serving revision/contract, current-schema compatibility, authenticated reads, retained candidate data where applicable, and PostgreSQL identity before accepting the rollback.
- See [`deployment/tencent-staging.md`](deployment/tencent-staging.md).
- Before using the manual GitHub Actions deployment workflow, see [`deployment/tencent-staging-deploy-secrets.md`](deployment/tencent-staging-deploy-secrets.md).

## AWS Guardrails

Before creating AWS resources:

- Create a low-budget alert first.
- Produce a Terraform plan and review the monthly estimate.
- Prefer Lightsail or one small EC2 instance.
- Avoid EKS, RDS, NAT Gateway, and ALB for this demo unless there is a written reason.
- Run `pnpm run doctor` and treat missing Terraform, AWS CLI, or GitHub CLI as cloud-readiness warnings, not local development failures.
- Review [`deployment/aws-cost-estimate.md`](deployment/aws-cost-estimate.md) before provisioning.
- Document `terraform destroy` and test it in a non-production account/project.
- See [`deployment/aws-low-cost.md`](deployment/aws-low-cost.md).

## Destroy Checklist

For local:

```bash
docker compose down -v
```

For staging:

- Stop API and worker services.
- Remove containers/images if Docker Compose is used.
- Remove reverse proxy site config if it was created for PulseBoard.
- Remove temporary DNS records if any were created.

For AWS:

- Run `terraform destroy`.
- Confirm no Elastic IP, EBS volume, snapshot, hosted zone, or budgeted service remains unexpectedly.
