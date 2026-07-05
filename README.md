# PulseBoard

PulseBoard is a lightweight incident, uptime, and background-job monitoring SaaS backend for small remote engineering teams. It is intentionally scoped as a backend/platform portfolio project: PostgreSQL for durable state, Redis and BullMQ for async work, Hono for the API surface, Prisma for data access, and Docker Compose for a reproducible local environment.

The project voice is deliberately modest: never boastful, never hucksterish; humble in spirit, genuine in products.

## Why It Exists

This repository is built to demonstrate real backend and cloud engineering judgment without pretending to be a finished commercial product. The first phase focuses on the system surfaces that interviewers can inspect and discuss:

- API design for workspaces, projects, services, uptime checks, incidents, webhooks, and audit logs.
- Background jobs for scheduled uptime checks and mocked notifications.
- Health/readiness endpoints, structured logs, seed data, and API documentation.
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
pnpm doctor
pnpm compose:up
```

The API listens on `http://localhost:4000`.

The compose `migrate` service runs Prisma generate, migration deploy, and seed data before the API and worker start.

For a Linux host behind a reverse proxy, start from [`docker-compose.production.example.yml`](docker-compose.production.example.yml). It keeps PostgreSQL and Redis private to the Docker network and binds the API to `127.0.0.1:4000`.

If WSL resolves `pnpm` or `corepack` to Windows paths, or if Docker Compose reports that the daemon is not running, see [`docs/local-development.md`](docs/local-development.md).

Useful endpoints:

- `GET /health/live`
- `GET /health/ready`
- `GET /docs`
- `GET /openapi.json`

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

CI runs both fast unit/type checks and a Postgres/Redis-backed integration job that applies migrations, seeds the demo API key, and exercises the main API flows.

## Background Jobs

PulseBoard uses BullMQ with Redis:

- `uptime-checks`: schedules and performs HTTP health checks.
- `notifications`: records mocked notification deliveries for incident state changes.

The worker creates incidents after failed checks and resolves open incidents after a recovery check. Notifications are stored in PostgreSQL instead of calling paid third-party providers.

## Observability

The API emits structured request logs and returns `X-Request-Id` on every response. Error bodies also include `requestId` for log correlation. See [`docs/operations.md`](docs/operations.md).

## Deployment Plan

Phase 1 stays local with Windows + WSL + Docker Compose. Phase 2 can use the Tencent Cloud Ubuntu host as a staging rehearsal for Linux deployment, HTTPS, reverse proxy, and restart policy. Phase 3 should move to AWS only after tests, deployment docs, Terraform plan, cost guardrails, and destroy instructions exist.

Deployment notes:

- [`docs/interview-walkthrough.md`](docs/interview-walkthrough.md)
- [`docs/project-status.md`](docs/project-status.md)
- [`docs/phase-plan.md`](docs/phase-plan.md)
- [`docs/deployment/tencent-staging.md`](docs/deployment/tencent-staging.md)
- [`docs/deployment/tencent-staging-deploy-secrets.md`](docs/deployment/tencent-staging-deploy-secrets.md)
- [`docs/deployment/aws-low-cost.md`](docs/deployment/aws-low-cost.md)
- [`docs/deployment/aws-cost-estimate.md`](docs/deployment/aws-cost-estimate.md)

## Cost Estimate

Local development costs nothing beyond the machine. A later staging server can run on an already-owned Ubuntu VPS. The final AWS demo should stay on a low-cost Lightsail instance or small EC2 instance with Docker Compose, avoiding EKS, RDS, NAT Gateway, and ALB unless there is a deliberate reason to pay for them.

## Tradeoffs

- Checked-in Prisma migrations are used by Docker Compose and future deployment paths. `prisma db push` remains available for short-lived local experiments.
- API key auth is intentionally simple and inspectable. OAuth is out of scope for the first phase.
- Notifications are mocked to avoid real account setup and paid SaaS dependencies.
- The system is a modular monolith, not microservices, because the goal is credible backend design with low operational overhead.
