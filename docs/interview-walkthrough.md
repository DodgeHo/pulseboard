# Interview Walkthrough

PulseBoard is a backend/platform portfolio project for discussing practical SaaS engineering: API design, durable state, background jobs, deployment safety, cost control, and operational tradeoffs.

This walkthrough is written for reviewers who want a quick path through the repository before a technical conversation.

## What To Review First

1. [`README.md`](../README.md) for the product scope, architecture diagram, setup, and tradeoffs.
2. [`docs/architecture.md`](architecture.md) for service boundaries and data flow.
3. [`apps/api/src/app.ts`](../apps/api/src/app.ts) for the Hono API surface.
4. [`apps/worker/src/handlers.ts`](../apps/worker/src/handlers.ts) for incident automation and notification handling.
5. [`packages/db/prisma/schema.prisma`](../packages/db/prisma/schema.prisma) for the data model.
6. [`scripts/demo-flow.ts`](../scripts/demo-flow.ts) for the end-to-end product scenario.
7. [`docs/postgresql-backup-restore.md`](postgresql-backup-restore.md) for tested recovery scope and honest RPO/RTO boundaries.
8. [`docs/application-rollback.md`](application-rollback.md) for the tested expand-contract and old-client rollback path.
9. [`apps/api/test/openapi-contract.test.ts`](../apps/api/test/openapi-contract.test.ts) for executable API documentation checks.
10. [`docs/deployment`](deployment) and [`infra/aws-lightsail`](../infra/aws-lightsail) for staging and AWS deployment planning.

## Demo Story

The demo flow behaves like a small customer journey:

1. Create a temporary API key.
2. Provision a workspace, project, and service.
3. Configure one healthy uptime check and one intentionally failing uptime check.
4. Let the worker write check runs through BullMQ.
5. Open an incident after the failure threshold.
6. Patch the check into a recovery state and queue an immediate check.
7. Resolve the incident after recovery.
8. Ingest a deployment webhook event.
9. Read audit logs and usage metrics.
10. Revoke the temporary API key.

Run it after the local compose stack is healthy:

```bash
pnpm demo:flow
```

For a Linux compose smoke test:

```bash
pnpm compose:e2e
```

## Engineering Signals

PulseBoard is intentionally not a toy CRUD app. It includes:

- Tenant-scoped resources: workspaces, projects, services, incidents, audit logs, usage metrics, and API keys.
- Durable Postgres state through Prisma migrations.
- Redis-backed BullMQ queues for background work.
- Worker-owned incident open/resolve behavior with tests around threshold rules.
- PostgreSQL execution leases, stable idempotency keys, transactional incident transitions, and a notification outbox with retry/dead-letter state.
- Redis-backed write-path rate limiting for API mutation routes.
- Structured request logs and `X-Request-Id` propagation.
- Redis-backed low-cardinality metrics plus bounded API and worker shutdown.
- A custom-format PostgreSQL backup restored and fingerprint-checked in an independent database.
- A source-distinct expand-contract rollback rehearsal with an old generated Prisma Client, forward-only migration history, retained candidate data, and image identity evidence.
- OpenAPI JSON and interactive API docs with representative response schemas executed against the real Hono application.
- CI with typecheck, unit tests, and Postgres/Redis-backed integration tests.
- Docker Compose for local and Linux host deployment.
- Staging rehearsal docs and a manual GitHub Actions deploy workflow.
- Plan-only AWS Lightsail Terraform with cost, budget, and destroy guardrails.

## Verification Evidence

The repository is designed to be checked with these commands:

```bash
corepack pnpm typecheck
corepack pnpm test
corepack pnpm run doctor
pnpm compose:e2e
pnpm compose:integration
pnpm compose:fault-injection
pnpm compose:backup-restore
pnpm compose:rollback
```

GitHub Actions runs quality, integration, backup/restore, application rollback, and infrastructure jobs on `master` and pull requests. The quality job runs public response-contract cases, while the integration job starts Postgres and Redis, applies migrations, seeds the demo key, and runs the authenticated database-backed contract cases plus worker recovery scenarios. Both suites compile schemas from the exported OpenAPI document rather than maintaining a parallel handwritten validator. The backup/restore and rollback jobs are configured to run isolated Compose rehearsals; do not claim a remote pass for either job until a workflow run has completed.

The Tencent staging rehearsal has also run the production compose example on an Ubuntu server with the API bound to `127.0.0.1:4000`, avoiding public exposure while validating the Linux deployment path.

## Good Interview Topics

- Why this is a modular monolith instead of microservices.
- How database leases, generation-aware queue jobs, unique keys, row locks, and one transaction keep durable incident effects idempotent under at-least-once delivery.
- Why notifications are mocked and stored in Postgres instead of calling paid providers.
- How the API key model trades OAuth complexity for inspectability.
- How Redis-backed rate limiting avoids single-process counters in multi-instance deployments.
- Why the final public demo target avoids EKS, RDS, NAT Gateway, and ALB by default.
- How rollback and destroy paths are documented before cloud resources are created.
- Why application rollback selects an immutable image while database migrations remain forward-only.
- Why a checked-in compatibility fixture is stronger than retagging one source tree, but still cannot prove arbitrary historical compatibility.
- Why a custom-format logical backup and isolated restore are proportionate here, while WAL/PITR is deferred until a real recovery objective justifies it.
- Why representative executable OpenAPI response checks are useful without pretending that description-only operations or request bodies are already covered.

## Known Boundaries

- This is a portfolio-grade demo, not a production incident platform.
- There is no complex frontend; API docs, seed data, and the demo flow are the primary review surfaces.
- Authentication is API-key based and intentionally simple.
- Notifications are mocked to avoid paid third-party dependencies.
- Backup evidence is logical and local/CI-shaped; continuous backup, PITR, and production-sized RPO/RTO remain unproven.
- The rollback rehearsal proves one nullable-column compatibility case across source-distinct contracts. It accepts a controlled restart and does not prove destructive migration compatibility, arbitrary historical binaries, image signing/registry attestation, or zero downtime.
- Executable OpenAPI coverage is representative rather than complete. Request bodies and many endpoint responses remain description-only, and `/metrics` is intentionally outside the public contract.
- AWS resources are not created until budget alerts, Terraform plan review, DNS/TLS choices, and destroy instructions are approved.
