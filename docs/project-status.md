# Project Status

This document summarizes the current PulseBoard delivery state for reviewers and for future deployment work. It intentionally avoids secrets, real server identifiers, and provider credentials.

## Overall Status

PulseBoard is complete as a local-first backend/platform portfolio project, has passed a private Linux staging rehearsal, and is published as a public portfolio homepage on the existing `anlan.store` host. The remaining work is intentionally gated on explicit approval because it involves additional public exposure, GitHub deployment secrets, DNS changes, AWS credentials, or billable cloud resources.

Approximate readiness:

- Local backend MVP: complete.
- Worker and incident automation: complete for the demo scope.
- Tencent staging rehearsal: complete for private local-on-server validation.
- Manual staging deploy workflow: complete for the private staging rehearsal.
- Public homepage and HTTPS reverse proxy on the existing Tencent host: complete for the current portfolio demo.
- AWS demo: plan-only infrastructure, workflow, checklist, and guardrails complete; no resources created.
- AWS public deployment: not enabled yet.

## Completed Engineering Surfaces

- TypeScript monorepo with API, worker, shared core logic, queue helpers, and Prisma database package.
- Hono API with health/readiness endpoints, API key auth, OpenAPI JSON, and Scalar docs.
- PostgreSQL schema, checked-in Prisma migration, and seed data.
- Redis/BullMQ queues for uptime checks and mocked notifications.
- Worker incident lifecycle automation for open and resolve transitions.
- Redis-backed write rate limiting for API write paths.
- Docker Compose for local development and production-like Linux staging.
- CI jobs for typecheck, unit tests, integration tests, and Terraform validation.
- Demo flow that exercises workspace/project/service provisioning, uptime checks, incident open/resolve, webhook ingest, audit logs, usage metrics, and temporary API key revocation.
- Deployment documentation for local development, Tencent staging, AWS low-cost planning, cost guardrails, and operational runbooks.
- Public `anlan.store` homepage and Nginx reverse proxy assets for the existing Tencent host.

## Verified Evidence

Recent verified checks include:

- `corepack pnpm typecheck` passed locally.
- GitHub Actions CI passed on `master` with `quality`, `integration`, and `infrastructure` jobs.
- Terraform formatting, backend-free provider initialization, and `terraform validate` passed in CI for `infra/aws-lightsail`.
- Manual `AWS Lightsail Plan` workflow exists for protected plan-only review through the `aws-demo-plan` environment. It has no apply job and requires separate AWS credential/environment setup.
- GitHub environment `aws-demo-plan` exists with non-sensitive default variables for region, availability zone, Lightsail blueprint, bundle, and resource name prefix. No AWS secrets have been configured there yet.
- Private Tencent staging health checks passed through `127.0.0.1:4000`.
- Tencent staging `pnpm demo:flow` previously passed inside the API container.
- Manual `Deploy Tencent Staging` workflow run [`28742059040`](https://github.com/DodgeHo/pulseboard/actions/runs/28742059040) passed on 2026-07-05 with staging-only GitHub environment secrets, remote rebuild, health checks, incident open/resolve, and `Demo flow completed successfully`.
- Staging API, PostgreSQL, Redis, and worker containers were healthy/running after the latest documentation and workflow updates.
- Recent GitHub Actions CI runs on `master` passed with quality, integration, and infrastructure jobs after the phase-readiness and workflow action updates.
- The Tencent staging checkout was fast-forwarded after the latest repository updates on 2026-07-05 and remained clean, with `/health/live` and `/health/ready` passing locally on the host.
- `https://anlan.store/` serves the PulseBoard public homepage over HTTPS.
- `https://anlan.store/docs`, `https://anlan.store/openapi.json`, `/health/live`, and `/health/ready` proxy successfully to the local API on the host.
- `https://www.anlan.store/` has a valid certificate and redirects to `https://anlan.store/`.

## Explicit Approval Gates

Do not cross these gates without human approval:

- Rotating staging deploy SSH credentials or moving them to a different host.
- Creating or changing DNS records, adding new public hostnames, changing TLS coverage, or exposing additional ports beyond the current `anlan.store` setup.
- Running `terraform plan` with real AWS credentials.
- Creating an AWS Budget alert in the AWS account.
- Running `terraform apply` or creating any AWS/Tencent resources.
- Writing any real IP, domain, key, token, password, or provider credential into the repository.

## Recommended Next Operator Steps

When maintaining staging automation:

1. Review [`deployment/tencent-staging-deploy-secrets.md`](deployment/tencent-staging-deploy-secrets.md).
2. Run the manual staging deploy workflow with a reviewed commit SHA after code changes that affect deployment.
3. Record only non-sensitive evidence: workflow URL, deployed ref, health result, and demo flow result.
4. Rotate or remove the staging-only deploy key when the host is retired.

When ready to continue AWS preparation:

1. Follow [`deployment/aws-plan-checklist.md`](deployment/aws-plan-checklist.md).
2. Review [`deployment/aws-cost-estimate.md`](deployment/aws-cost-estimate.md).
3. Create or confirm a low AWS Budget alert.
4. Run `terraform plan` for [`../infra/aws-lightsail`](../infra/aws-lightsail) locally or through the protected manual workflow in an approved AWS environment.
5. Review the plan and monthly cost before any apply.
6. Keep DNS and HTTPS changes separate from infrastructure provisioning unless explicitly approved together.

## Current Boundary

The project is suitable to share as a code repository, public demo homepage, and interview discussion artifact now. It should not be described as a production service or AWS-hosted service until AWS credentials, budget alerts, Terraform apply, final DNS/TLS choices, and ongoing operations are explicitly approved and completed.

From an interview-readiness perspective, the repository is complete for a backend/platform/cloud portfolio review. The remaining tasks are operational publication tasks, not core product implementation tasks, and they require account-level credentials or billable cloud-resource approval.
