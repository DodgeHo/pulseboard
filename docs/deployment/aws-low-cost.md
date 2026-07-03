# AWS Low-Cost Demo Plan

AWS should be the final public demo target only after the local and staging paths are stable. The goal is to demonstrate cloud judgment, not to maximize managed-service complexity.

## Recommended Shape

Use one of:

- AWS Lightsail instance running Docker Compose.
- One small EC2 instance running Docker Compose.

Avoid for this demo unless there is a written reason:

- EKS
- RDS
- NAT Gateway
- ALB
- multi-AZ managed databases

Those services are useful in real systems, but they add cost and operational surface that this portfolio project does not need yet.

## Target DNS

Potential final domains:

- `demo.anlan.store` for a small read-only project page or docs entry point.
- `api.demo.anlan.store` for the PulseBoard API.

Do not change DNS until:

- the deployment host is ready,
- HTTPS is configured,
- rollback is tested,
- budget alerts are active.

## Budget Guardrail

Before provisioning:

1. Create an AWS Budget alert with a low monthly threshold.
2. Record the expected monthly cost in the pull request or deployment notes.
3. Confirm the destroy path.

Approximate expected shape:

| Item | Choice | Cost posture |
| --- | --- | --- |
| Compute | Lightsail or small EC2 | low fixed monthly cost |
| Database | PostgreSQL container on same host | no managed DB cost |
| Redis | Redis container on same host | no managed cache cost |
| Load balancer | none | avoid ALB cost |
| NAT Gateway | none | avoid high fixed cost |
| Kubernetes | none | avoid cluster overhead |

## Terraform Requirements

Before creating resources, add Terraform that can:

- create the instance,
- open only SSH/HTTP/HTTPS,
- attach a static IP only if needed,
- create or document DNS records,
- output the public IP and deployment notes,
- destroy all provisioned resources.

Required commands before apply:

```bash
terraform fmt
terraform validate
terraform plan
```

Required after testing:

```bash
terraform destroy
```

## Deployment Flow

```bash
ssh ubuntu@<public-ip>
git clone <repo-url> pulseboard
cd pulseboard
cp .env.example .env
# edit .env on the server with real staging/demo values
docker compose up --build -d
curl http://127.0.0.1:4000/health/ready
```

For the final public demo, prefer:

```bash
docker compose -f docker-compose.production.example.yml up --build -d
curl http://127.0.0.1:4000/health/ready
```

Then configure HTTPS through Caddy or Nginx and point `api.demo.anlan.store` at the host.

## Demo Verification

```bash
curl https://api.demo.anlan.store/health/live
curl https://api.demo.anlan.store/health/ready
PULSEBOARD_API_URL=https://api.demo.anlan.store DEMO_API_KEY=<demo-key> pnpm demo:flow
```

## Destroy Checklist

Before marking the demo retired:

- Run `terraform destroy`.
- Confirm no Elastic IP remains allocated.
- Confirm no EBS volume or snapshot remains.
- Confirm DNS records are removed or repointed.
- Confirm AWS Budget does not show unexpected recurring services.
