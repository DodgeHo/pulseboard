# Project Status

This document summarizes the current PulseBoard delivery state for reviewers and for future deployment work. It intentionally avoids secrets, real server identifiers, and provider credentials.

## Overall Status

PulseBoard is a working local-first backend/platform portfolio project, has passed a private Linux staging rehearsal, and is published as a public portfolio homepage on the existing `anlan.store` host. It is intentionally described as production-shaped rather than production-proven: reliability behavior, a low-cost operational metric surface, isolated PostgreSQL logical backup/restore, and immutable-image application rollback mechanics are locally tested. Work that changes public infrastructure or creates billable resources remains gated on explicit approval.

Approximate readiness:

- Local backend MVP: complete.
- Worker and incident automation: implemented with database leases, idempotent durable effects, bounded shutdown, and real crash/restart plus in-flight graceful-drain integration tests.
- Tencent staging rehearsal: complete for private local-on-server validation.
- Manual staging deploy workflow: complete for the private staging rehearsal.
- Public homepage and HTTPS reverse proxy on the existing Tencent host: complete for the current portfolio demo.
- AWS demo: plan-only infrastructure, workflow, checklist, and guardrails complete; no resources created.
- AWS public deployment: not enabled yet.

## Completed Engineering Surfaces

- TypeScript monorepo with API, worker, shared core logic, queue helpers, and Prisma database package.
- Hono API with health/readiness endpoints, API key auth, OpenAPI JSON, Scalar docs, and representative executable response contracts.
- PostgreSQL schema, checked-in Prisma migration, and seed data.
- Redis/BullMQ queues for uptime checks and mocked notifications.
- Redis-backed low-cardinality operational metrics and a local Prometheus-compatible scrape endpoint with BullMQ queue depth.
- Bounded API graceful shutdown with draining readiness, direct container signal delivery, dependency probe deadlines, and a repeatable Compose fault-injection runbook.
- Bounded worker graceful shutdown with concurrent consumer drain, ordered resource cleanup, deadline force-close, and direct PID 1 signal delivery.
- Worker incident lifecycle automation for open and resolve transitions.
- Redis-backed write rate limiting for API write paths.
- Docker Compose for local development and production-like Linux staging.
- An isolated PostgreSQL custom-format backup/restore rehearsal with invariant and full-table fingerprint checks.
- An isolated source-distinct expand-contract application rollback rehearsal that preserves PostgreSQL, tenant data, audit history, forward-only migrations, and the public route contract while exercising an old generated Prisma Client.
- CI jobs for typecheck, unit tests, integration tests, backup/restore rehearsal, application rollback rehearsal, and Terraform validation.
- CI integration coverage for API tenant/reliability scenarios, database-backed OpenAPI response contracts, and PostgreSQL/Redis/BullMQ worker crash-recovery plus in-flight `SIGTERM` scenarios.
- Demo flow that exercises workspace/project/service provisioning, uptime checks, incident open/resolve, webhook ingest, audit logs, usage metrics, and temporary API key revocation.
- Deployment documentation for local development, Tencent staging, AWS low-cost planning, cost guardrails, and operational runbooks.
- Public `anlan.store` homepage and Nginx reverse proxy assets for the existing Tencent host.

## Verified Evidence

Recent verified checks include:

- On 2026-08-28, `corepack pnpm lint` passed locally.
- On 2026-08-28, the normal test suite passed 66 tests: 32 core, 3 web, 2 observability, 15 worker, and 14 API tests. Seven API and two worker integration-only cases were skipped by design in this command.
- On 2026-08-28, Compose-backed API integration passed all 21 tests, including the authenticated PostgreSQL/Redis-backed OpenAPI contract case. The worker integration suite passed 2 real PostgreSQL/Redis/BullMQ scenarios: `SIGKILL` crash recovery and in-flight `SIGTERM` graceful drain.
- On 2026-08-28, the Compose end-to-end demo flow completed successfully.
- On 2026-08-28, the Compose fault-injection drill proved PostgreSQL readiness failure/recovery, Redis readiness and metrics failure/recovery, API and worker `SIGTERM` exit code `0` with completion logs, and successful API/worker restart.
- On 2026-08-28, the isolated PostgreSQL backup/restore rehearsal completed successfully: the archive was readable, source and restored invariant checks passed, and manifests matched byte-for-byte.
- On 2026-08-28, the local source-distinct application rollback rehearsal completed successfully. The baseline reported revision/contract `baseline-local-437`/`baseline-v2` and content ID `sha256:3ef65c150ae977046244a2db803249c37e164d8a2372a5ca59ec88e55b4310bc`; the candidate reported `candidate-local-437`/`candidate-v3` and `sha256:5db9ac0a40eacaf429b1db8e3c91181d9adfef174b3edeff673ff998a85a7fee`. Migration history advanced through `0003_expand_uptime_check_description` and remained forward-only after rollback. The old Prisma Client read uptime check `655d1bad-4b6b-4c34-aad2-7f981d570e4f`, changed `expectedStatus` from `200` to `204`, omitted the unknown description field, and left `Candidate v3 operator context retained across rollback.` stored in PostgreSQL. Container `5e1f9dfaab4c3a44b6c34628e733d7c861252620db52731276cb65d5c0cb027f`, volume `pulseboard-rollback-local-437_postgres_data`, and project-scoped cleanup checks remained stable. Evidence is under `.artifacts/application-rollback/20260828T085805Z-437/`; local images had no registry `RepoDigests`.
- GitHub Actions is configured with separate `backup-restore` and `rollback-rehearsal` jobs; successful remote runs have not yet been recorded for these new jobs.
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
- The Tencent staging checkout was fast-forwarded after the latest repository updates on 2026-07-05 and remained clean, with `/demo/health/live` and `/demo/health/ready` passing locally on the host.
- `https://anlan.store/` serves the PulseBoard public homepage over HTTPS.
- `https://anlan.store/demo/docs`, `https://anlan.store/demo/openapi.json`, `/demo/health/live`, and `/demo/health/ready` proxy successfully to the local API on the host.
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

The project is suitable to share as a code repository, public demo homepage, and interview discussion artifact now. It should not be described as a production service or AWS-hosted service. In particular, the repository does not prove production traffic, an SLA, continuous backups, point-in-time recovery, production-sized RPO/RTO, zero-downtime rollback, compatibility between arbitrary historical binaries and future schemas, a deployed Prometheus/alerting stack, durable metric retention, a successful remote rollback CI run, or deployment of the 2026-08-28 reliability changes to the public host.

From an interview-readiness perspective, the repository now supports a substantive discussion of tenant boundaries, SSRF defense, API key storage, at-least-once jobs, database idempotency, transaction rollback, worker crash recovery, graceful drain, notification retries, low-cardinality metric design, failure-safe instrumentation, dependency health, bounded API/worker shutdown, logical backup/isolated restore, tested source-distinct expand-contract rollback, and executable response-contract drift detection.

The OpenAPI gate is deliberately representative rather than complete. It validates liveness, readiness, the shared authentication error, workspace lists, uptime-check create/list/detail responses, and incident list/detail responses against schemas from the actual exported document. Request bodies and many remaining endpoint responses are still description-only, and `/metrics` remains intentionally outside the public contract. The next narrow contract slice should add request schemas and write-path response coverage only where those operations are stable enough to be enforced, rather than claiming blanket conformance.
