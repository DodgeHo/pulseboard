# Phase Plan

## Phase 1: Local Backend MVP

Goal: a credible local-first SaaS backend that runs in WSL with Docker Compose.

Included:

- Modular TypeScript monorepo.
- Hono API with health endpoints and API key auth.
- Prisma/PostgreSQL data model and seed data.
- Redis/BullMQ queues.
- Worker for scheduled uptime checks and mocked notifications.
- OpenAPI JSON and Scalar API reference.
- Unit tests, representative API integration tests, and handler-level worker tests for incident open/resolve behavior.
- README, architecture notes, local development notes, and CI.

Remaining hardening:

- Full Docker Compose smoke flow passed locally through `scripts/local-compose-e2e.sh` on 2026-07-04.
- API integration tests passed against the compose PostgreSQL and Redis services through `scripts/local-compose-integration.sh` on 2026-07-04.
- Add follow-up Prisma migrations as the schema evolves; the initial migration is checked in.
- Verify Redis-backed distributed write rate limiting in the full compose stack before any multi-instance deployment.
- Repeat compose smoke and integration checks after any Dockerfile, migration, worker, or queue changes.

## Phase 2: Tencent Cloud Staging Rehearsal

Use the existing Ubuntu server only as a staging rehearsal environment.

Before touching the server:

- Confirm SSH access method and avoid committing secrets.
- Document firewall ports, reverse proxy choice, TLS setup, restart policy, and rollback.
- Decide whether to run Docker Compose directly or use systemd-managed services.
- Follow the staging rehearsal plan in [`deployment/tencent-staging.md`](deployment/tencent-staging.md).

Target:

- `api` and `worker` running on Linux.
- HTTPS through a reverse proxy.
- GitHub Actions deployment rehearsal.
- Clear destroy/rollback instructions.

Completed staging rehearsal:

- Docker Compose production example rebuilt and restarted successfully on the Tencent Ubuntu staging host on 2026-07-05.
- Local-on-server API health checks passed through `127.0.0.1:4000` without exposing PostgreSQL, Redis, or the API publicly.
- `pnpm demo:flow` passed inside the staging API container, including incident open, controlled recovery, incident resolution, webhook ingest, audit logs, usage metrics, and temporary key revocation.
- Added a manual `Deploy Tencent Staging` GitHub Actions workflow that can deploy an approved ref over SSH, rebuild compose, run health checks, and execute `pnpm demo:flow` after environment secrets are configured.
- Added a staging deploy secrets checklist in [`deployment/tencent-staging-deploy-secrets.md`](deployment/tencent-staging-deploy-secrets.md) for the GitHub environment, deploy key, pinned known host entry, and non-sensitive completion evidence.
- Created the `tencent-staging` GitHub environment, configured staging-only deployment secrets, and passed the manual deployment rehearsal on 2026-07-05. Evidence: [`Deploy Tencent Staging` run 28742059040](https://github.com/DodgeHo/pulseboard/actions/runs/28742059040) rebuilt the stack, verified local-on-server health checks, opened and resolved a demo incident, and completed `pnpm demo:flow` successfully.

Remaining staging hardening:

- HTTPS through a reverse proxy requires explicit approval before public exposure.
- Keep the staging deploy key scoped to this rehearsal and rotate or remove it when the host is retired.

## Phase 3: Low-Cost AWS Demo

Use AWS only after Phase 1 is stable and Phase 2 has proven the Linux deployment path.

Constraints:

- Prefer Lightsail or a small EC2 instance.
- Avoid EKS, RDS, NAT Gateway, and ALB unless there is a deliberate cost/benefit reason.
- Use `demo.anlan.store` and `api.demo.anlan.store` only after DNS and deployment are ready.
- Add AWS Budget alerts before provisioning.
- Provide Terraform plan, cost estimate, and destroy documentation before creating resources.
- Follow the low-cost AWS plan in [`deployment/aws-low-cost.md`](deployment/aws-low-cost.md).

Completed preparation:

- Added a plan-only Lightsail Terraform skeleton in [`../infra/aws-lightsail`](../infra/aws-lightsail) with SSH-only default exposure, optional HTTP/HTTPS/static IP gates, and destroy documentation.
- Added a reviewed AWS cost estimate and budget guardrail in [`deployment/aws-cost-estimate.md`](deployment/aws-cost-estimate.md).
- Added CI validation for Terraform formatting, provider initialization without a backend, and `terraform validate`.
- Added a protected manual `AWS Lightsail Plan` GitHub Actions workflow for `terraform plan` through the `aws-demo-plan` environment. The workflow has no apply job.
- Added the operator checklist in [`deployment/aws-plan-checklist.md`](deployment/aws-plan-checklist.md) for budget, OIDC role, Terraform variables, plan review, and public exposure gates.

Remaining approval gates:

- Configure the `aws-demo-plan` GitHub environment or a local AWS profile with least-privilege plan credentials.
- Run and review `terraform plan` in an approved environment with AWS credentials.
- Create or confirm an AWS Budget alert before any apply.
- Do not run `terraform apply`, create DNS records, or expose public HTTPS without explicit approval.

## Phase 4: Worker Incident Automation Hardening

Goal: make the background processing path credible enough to discuss in backend/platform interviews.

Completed locally:

- Worker opens incidents after configured consecutive failing checks and resolves them after configured recovery checks.
- Incident transitions enqueue mocked notifications and write workspace-scoped audit logs.
- Notification delivery records are marked `SENT` by the notification worker.
- Handler-level tests cover incident open, incident resolve, below-threshold failures, due-check queueing, and notification audit behavior.
- `pnpm demo:flow` shows a controlled incident lifecycle: healthy check, failing check, incident open, recovery check, incident resolve, webhook ingest, audit logs, usage metrics, and temporary key revocation.

Completed on staging:

- Compose E2E after the Phase 5 demo flow changes passed on the Tencent Ubuntu staging host on 2026-07-05.
