# Operations Runbook

This runbook is intentionally small. PulseBoard is a portfolio-grade backend demo, not a production service, but the operational model should still be easy to explain.

## Local Health Checks

```bash
curl http://localhost:4000/health/live
curl http://localhost:4000/health/ready
```

- `/health/live` proves the API process is responding.
- `/health/ready` proves the API can reach PostgreSQL and Redis.

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

## Background Worker Signals

Worker logs include queue scheduling, uptime check execution, incident transitions, notification sends, and failed BullMQ jobs. The worker records check activity in PostgreSQL through `CheckRun`, `AuditLog`, and `UsageMetric`.

Incident automation follows a small state machine:

- Consecutive `DOWN` or `DEGRADED` check runs open an incident once the check threshold is reached.
- Consecutive `UP` check runs resolve an `OPEN` or `ACKNOWLEDGED` incident once the recovery threshold is reached.
- Mock email or Slack notifications are stored in PostgreSQL and then marked `SENT` by the notification worker.
- Audit logs are workspace-scoped for check runs, incident transitions, and incident-linked notifications.

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

## Staging Deployment Guardrails

Before using the Tencent Cloud Ubuntu server:

- Do not commit SSH keys, passwords, DNS tokens, or provider credentials.
- Keep the server as staging rehearsal, not the final overseas-facing demo.
- Prefer Docker Compose with restart policies or simple systemd units.
- Put HTTPS and reverse proxy config in documented files before exposing the API.
- Keep rollback simple: stop services, pull the previous image or commit, restart.
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
