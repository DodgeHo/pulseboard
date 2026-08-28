# PulseBoard

PulseBoard is a lightweight incident, uptime, and background-job monitoring SaaS backend for small remote engineering teams. It is intentionally scoped as a backend/platform portfolio project: PostgreSQL for durable state, Redis and BullMQ for async work, Hono for the API surface, Prisma for data access, and Docker Compose for a reproducible local environment.

The project voice is deliberately modest: never boastful, never hucksterish; humble in spirit, genuine in products.

## Why It Exists

This repository is built to demonstrate real backend and cloud engineering judgment without pretending to be a finished commercial product. The first phase focuses on the system surfaces that interviewers can inspect and discuss:

- API design for workspaces, projects, services, uptime checks, incidents, webhooks, and audit logs.
- Workspace-membership authorization with a PostgreSQL-backed two-tenant isolation matrix.
- High-entropy API keys stored only as salted hashes, with production configuration validation and explicit revocation.
- Background jobs for scheduled uptime checks and mocked notifications.
- SSRF-resistant HTTP checks with public-address validation, DNS pinning, redirect revalidation, and a single timeout budget.
- Health/readiness endpoints, structured logs, seed data, and API documentation.
- Representative executable OpenAPI response contracts checked against the real Hono application.
- A local-first deployment path that can later move to a low-cost Linux staging host and then AWS Lightsail or a small EC2 instance.

## Architecture

```mermaid
flowchart LR
  Client["API client / demo scripts"] --> API["Hono API"]
  API --> DB[("PostgreSQL")]
  API --> Redis[("Redis")]
  API --> Queue["BullMQ queues"]
  Worker["Worker process"] --> Queue
  Worker --> DB
  Worker --> Redis
  Worker --> Target["Monitored HTTP services"]
  Worker --> Notify["Mock email / Slack notifications"]
```

## Repository Layout

```text
apps/api          Hono API, auth middleware, OpenAPI/Scalar docs, HTTP routes
apps/worker       BullMQ workers for uptime checks and notifications
apps/web          Vanilla TypeScript frontend for the public frontend + backend demo
packages/core     Business rules, validation schemas, check runner helpers
packages/db       Prisma schema, seed data, Prisma client
packages/queues   Redis/BullMQ queue factories
docs              Architecture notes and deployment plan
```

## Local Setup

Windows path:

```text
F:\Jobs overseas\pulseboard
```

WSL path:

```bash
/mnt/f/Jobs\ overseas/pulseboard
```

Run from WSL Ubuntu:

```bash
cd /mnt/f/Jobs\ overseas/pulseboard
cp .env.example .env
pnpm install
pnpm run doctor
pnpm compose:up
```

`pnpm run doctor` checks the required local toolchain plus optional cloud-readiness tools such as Terraform, AWS CLI, and GitHub CLI. Optional AWS/Terraform warnings do not block local development; they matter only when preparing an approved AWS plan.

The API listens on `http://localhost:4000`.

The compose `migrate` service runs Prisma generate, migration deploy, and seed data before the API and worker start.

For a Linux host behind a reverse proxy, start from [`docker-compose.production.example.yml`](docker-compose.production.example.yml). It keeps PostgreSQL and Redis private to the Docker network and binds the API to `127.0.0.1:4000`.

If WSL resolves `pnpm` or `corepack` to Windows paths, or if Docker Compose reports that the daemon is not running, see [`docs/local-development.md`](docs/local-development.md).

Useful endpoints:

- `GET /health/live`
- `GET /health/ready`
- `GET /docs`
- `GET /openapi.json`

Public demo entry point:

- `https://anlan.store/` (project portal)
- `https://anlan.store/demo/` (PulseBoard)
- `https://anlan.store/demo/docs` (API docs)

API examples are available in [`docs/api-examples.md`](docs/api-examples.md).

For a reviewer-oriented guide through the architecture, demo flow, and interview discussion points, see [`docs/interview-walkthrough.md`](docs/interview-walkthrough.md).

Local demo API key:

```text
pb_local_demo_key_change_me
```

Use it as:

```bash
curl -H "Authorization: Bearer pb_local_demo_key_change_me" http://localhost:4000/v1/workspaces
```

The local key and `API_KEY_HASH_SALT=local-development-only` are deliberately unsafe defaults for local development only. With `NODE_ENV=production`, both the API startup path and database seed require an independently generated hash salt of at least 32 characters. API key plaintext is returned only at creation; PostgreSQL stores the key prefix and a salted SHA-256 digest. See [`docs/adr/0003-tenant-isolation-and-api-key-storage.md`](docs/adr/0003-tenant-isolation-and-api-key-storage.md).

Run the local product flow after the compose stack is healthy:

```bash
pnpm demo:flow
```

The script creates a temporary API key, provisions a workspace/project/service, configures healthy and intentionally failing uptime checks, waits for the worker to record check runs, opens and resolves an incident through a controlled recovery, ingests a webhook event, reads audit logs and usage metrics, and revokes the temporary key.

For a full WSL/Linux compose smoke test, run:

```bash
pnpm compose:e2e
```

To run the API integration suite against the compose PostgreSQL and Redis services:

```bash
pnpm compose:integration
```

CI runs fast unit/type checks, builds and verifies the root project portal plus the namespaced PulseBoard artifacts, checks that `deploy/anlan/index.html` and `deploy/anlan/demo/` are up to date, runs a Postgres/Redis-backed integration job, and configures isolated backup/restore plus application-rollback rehearsals. Both the fast and database-backed API suites validate representative real responses against schemas resolved from the exported OpenAPI document. Configured jobs are not described as remotely passing until a corresponding workflow run is recorded.

The executable response coverage currently includes liveness, readiness, the shared `401` envelope, workspace lists, uptime-check create/list/detail responses, and incident list/detail responses including notification attempts. It deliberately does not claim full OpenAPI conformance: request bodies and many remaining endpoint responses are still description-only. The operator-only `/metrics` route remains outside the public contract. See [`docs/adr/0011-executable-openapi-response-contracts.md`](docs/adr/0011-executable-openapi-response-contracts.md).

Rehearse a PostgreSQL custom-format backup and isolated restore:

```bash
pnpm compose:backup-restore
```

The rehearsal uses separate source and restore volumes, verifies representative business invariants, and compares full-table fingerprints. It never touches the normal Compose database. Production archive handling, restore gates, Redis boundaries, and honest RPO/RTO limits are documented in [`docs/postgresql-backup-restore.md`](docs/postgresql-backup-restore.md) and [`docs/adr/0008-postgresql-logical-backup-restore.md`](docs/adr/0008-postgresql-logical-backup-restore.md).

Rehearse an immutable-image application deployment and rollback while preserving PostgreSQL and the public route contract:

```bash
pnpm compose:rollback
```

The rehearsal builds a checked-in pre-`0003` baseline contract with an old generated Prisma Client and a current candidate contract with nullable `UptimeCheck.description`. It applies the migration forward, writes the new field, rolls API and worker back without down-migrating PostgreSQL, and proves the old client still reads and updates old fields while candidate data remains stored. It also verifies source fingerprints, OCI revision/contract labels, image content IDs, running image IDs, migration contents, tenant state, audit history, and PostgreSQL identity. This proves one controlled expand-contract case, not arbitrary historical or destructive migration compatibility. See [`docs/application-rollback.md`](docs/application-rollback.md), [`docs/adr/0009-immutable-image-application-rollback.md`](docs/adr/0009-immutable-image-application-rollback.md), and [`docs/adr/0010-expand-contract-compatibility-fixture.md`](docs/adr/0010-expand-contract-compatibility-fixture.md).


## Public Portal and PulseBoard Demo

`anlan.store` has two distinct public layers:

- `/` is the `ANLAN.STORE` project directory, with direct entries for PulseBoard, Career Radar, SAA, SAP, and ISPM.
- `/demo/` is the PulseBoard Live Ops Console, with its customer UI at `/demo/frontend/` and backend evidence under `/demo/health/*`, `/demo/openapi.json`, `/demo/docs`, and `/demo/api/v1/*`.

PulseBoard keeps its 10-language interface. English is first and remains the default, Traditional Chinese is included, and Simplified Chinese is last. A locale can be selected with `?lang=<locale>`, for example `/demo/?lang=zh-TW`.

Build every public static artifact:

```bash
pnpm build:public
```

Verify the generated portal and PulseBoard artifacts before deployment:

```bash
pnpm verify:artifacts
```

For local PulseBoard source development:

```bash
pnpm dev:web
```

After an approved host install, verify the portal, `/demo/` namespace, backend surface, study tools, and redirects together:

```bash
pnpm verify:public
```

See [`docs/deployment/anlan-public-site.md`](docs/deployment/anlan-public-site.md) for the route contract, backup-first install steps, verification expectations, and rollback procedure.

## Background Jobs

PulseBoard uses BullMQ with Redis:

- `uptime-checks`: schedules and performs HTTP health checks.
- `notifications`: records mocked notification deliveries for incident state changes.

The worker creates incidents after failed checks and resolves open incidents after a recovery check. Notifications are stored in PostgreSQL instead of calling paid third-party providers.

Monitoring URLs are treated as untrusted input. PulseBoard rejects private, local, reserved, metadata, credential-bearing, and mixed-DNS targets; pins the approved DNS address for the connection; and revalidates every redirect. The decision and its limitations are recorded in [`docs/adr/0002-ssrf-safe-http-checks.md`](docs/adr/0002-ssrf-safe-http-checks.md).

## Tenant And Credential Boundaries

API keys authenticate a user. Access to a workspace and all nested projects, services, uptime checks, incidents, notifications, audit logs, usage metrics, and webhook writes is then derived from `WorkspaceMember`. Resource routes return the same `404` for a nonexistent id and an id owned by another tenant, avoiding an ownership oracle. Collection filters such as a foreign `workspaceId` return an empty collection. A PostgreSQL-backed two-tenant integration test verifies both responses and unchanged foreign rows across the API surface.

The current credential lifecycle supports creation, one-time plaintext return, usage timestamps, listing metadata, and revocation. It does not yet support expiry, named rotation lineage, or a grace period between old and replacement keys; documentation calls this replacement-and-revocation rather than automatic rotation.

## Observability

The API emits structured request logs and returns `X-Request-Id` on every response. Error bodies also include `requestId` for log correlation. See [`docs/operations.md`](docs/operations.md).

## Deployment Plan

Phase 1 stays local with Windows + WSL + Docker Compose. Phase 2 can use the Tencent Cloud Ubuntu host as a staging rehearsal for Linux deployment, HTTPS, reverse proxy, and restart policy. Phase 3 should move to AWS only after tests, deployment docs, Terraform plan, cost guardrails, and destroy instructions exist.

Deployment notes:

- [`docs/interview-walkthrough.md`](docs/interview-walkthrough.md)
- [`docs/project-status.md`](docs/project-status.md)
- [`docs/phase-plan.md`](docs/phase-plan.md)
- [`docs/postgresql-backup-restore.md`](docs/postgresql-backup-restore.md)
- [`docs/deployment/tencent-staging.md`](docs/deployment/tencent-staging.md)
- [`docs/deployment/tencent-staging-deploy-secrets.md`](docs/deployment/tencent-staging-deploy-secrets.md)
- [`docs/deployment/anlan-public-site.md`](docs/deployment/anlan-public-site.md)
- [`docs/deployment/aws-low-cost.md`](docs/deployment/aws-low-cost.md)
- [`docs/deployment/aws-cost-estimate.md`](docs/deployment/aws-cost-estimate.md)

## Cost Estimate

Local development costs nothing beyond the machine. A later staging server can run on an already-owned Ubuntu VPS. The final AWS demo should stay on a low-cost Lightsail instance or small EC2 instance with Docker Compose, avoiding EKS, RDS, NAT Gateway, and ALB unless there is a deliberate reason to pay for them.

## Tradeoffs

- Checked-in Prisma migrations are used by Docker Compose and future deployment paths. `prisma db push` remains available for short-lived local experiments.
- API key auth is intentionally simple and inspectable. Keys are high entropy and stored as salted hashes, while expiry and rotation lineage remain explicit future work. OAuth is out of scope for the first phase.
- Notifications are mocked to avoid real account setup and paid SaaS dependencies.
- The system is a modular monolith, not microservices, because the goal is credible backend design with low operational overhead.
