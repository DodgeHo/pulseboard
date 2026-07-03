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
- Unit tests and representative API integration tests.
- README, architecture notes, local development notes, and CI.

Remaining hardening:

- Run the full Docker Compose stack after the local Docker daemon is available.
- Run integration tests against the compose database.
- Add follow-up Prisma migrations as the schema evolves; the initial migration is checked in.
- Replace the in-process write limiter with Redis-backed distributed rate limiting before multi-instance deployment.
- Expand the demo script into a richer smoke test once the local Docker daemon is available.

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

## Phase 3: Low-Cost AWS Demo

Use AWS only after Phase 1 is stable and Phase 2 has proven the Linux deployment path.

Constraints:

- Prefer Lightsail or a small EC2 instance.
- Avoid EKS, RDS, NAT Gateway, and ALB unless there is a deliberate cost/benefit reason.
- Use `demo.anlan.store` and `api.demo.anlan.store` only after DNS and deployment are ready.
- Add AWS Budget alerts before provisioning.
- Provide Terraform plan, cost estimate, and destroy documentation before creating resources.
- Follow the low-cost AWS plan in [`deployment/aws-low-cost.md`](deployment/aws-low-cost.md).
