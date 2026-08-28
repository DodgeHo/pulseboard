# ADR 0009: Immutable Image Application Rollback With Forward-Only Schema

- Status: Accepted
- Date: 2026-08-28

## Context

The production-like Compose example could rebuild a Git checkout on the target host, and the rollback notes used `git checkout <previous-known-good-commit>` followed by another build. That approach is reproducible only if the source tree, package registries, base images, and build tooling still produce the same artifact. It also gives weak evidence about which code is currently running and can accidentally couple application rollback to database rollback.

PulseBoard needs a low-cost rollback model appropriate for one modular monolith on Docker Compose. It must preserve PostgreSQL, keep the public `/demo/*` route contract, exercise API and worker replacement, and remain honest about schema compatibility and downtime.

## Decision

- One reviewed OCI image contains the API, worker, Prisma migrations, and generated public PulseBoard assets.
- The image records `org.opencontainers.image.revision` and `io.pulseboard.build-contract`, exporting the same values as `PULSEBOARD_BUILD_REVISION` and `PULSEBOARD_BUILD_CONTRACT`.
- `GET /health/live` reports both release identity and compatibility contract for deployment verification.
- Production Compose accepts an explicit `PULSEBOARD_IMAGE` tag or digest for migrate, API, worker, and public-site tasks.
- A candidate applies only forward Prisma migrations before application containers are replaced.
- Application rollback selects the previous immutable image and recreates application containers. It never performs an automatic down-migration.
- Destructive or incompatible schema changes require expand-contract sequencing or a forward fix before the previous application image can be considered a valid rollback target.
- The local rehearsal uses a unique Compose project, builds source-distinct baseline and candidate contracts, creates durable state through the authenticated public API, switches baseline to candidate and back, verifies PostgreSQL container and volume identity, and performs project-scoped cleanup.

## Consequences

- Operators can distinguish build identity from a mutable Git checkout and verify the serving revision through liveness.
- API, worker, migration, and static assets come from the same artifact, reducing mixed-version deployment risk.
- PostgreSQL remains available across application replacement and its migration history is not rewritten during rollback.
- The procedure may briefly interrupt requests because this small deployment does not run parallel replicas or a traffic-shifting orchestrator.
- Static files are copied from the selected image. The local named-volume rehearsal validates their version switch, but a real host still needs backup-first file replacement.
- A previous image is not automatically safe after a future migration. The controlled nullable-column fixture proves one reviewed case only; compatibility remains a release review responsibility.
- Redis remains disposable. Worker recreation may cause at-least-once delivery, which is handled by the existing database idempotency and lease design rather than by preserving a worker process.

## Rejected Alternatives

- **Rebuild a previous Git commit on the server:** depends on mutable build inputs and does not prove the rebuilt artifact matches the one previously reviewed.
- **Use `latest` and restart containers:** the tag can move, so it does not identify a rollback artifact.
- **Automatically reverse Prisma migrations:** unsafe once new code has written data and unsupported as a general rollback strategy for destructive changes.
- **Restore PostgreSQL for every application regression:** unnecessarily destructive and conflates code rollback with data recovery.
- **Introduce Kubernetes or blue-green infrastructure now:** adds operational cost and complexity beyond the stated single-host portfolio scope. A short controlled restart is an accepted tradeoff.

## Verification

[`../../scripts/local-compose-rollback-rehearsal.sh`](../../scripts/local-compose-rollback-rehearsal.sh), [`../../docker-compose.rollback-rehearsal.yml`](../../docker-compose.rollback-rehearsal.yml), and [`../application-rollback.md`](../application-rollback.md) implement and document the decision. ADR 0010 records the narrower source-distinct expand-contract fixture.

The rehearsal must verify baseline, candidate, and rollback release/contract markers; source fingerprints; selected and running image identities; public routes; authenticated sentinel visibility; its audit event; forward-only migration history; old-client access after rollback; retained candidate data; unchanged PostgreSQL container and volume identity; and removal of project-scoped resources. Local or remote success is recorded only after the corresponding run actually completes.
