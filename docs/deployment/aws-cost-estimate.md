# AWS Cost Estimate

This estimate is for the eventual public PulseBoard demo on AWS. It is intentionally small and should be reviewed again before provisioning because AWS prices and regional details can change.

Last reviewed: 2026-07-05

Primary pricing references:

- [Amazon Lightsail pricing](https://aws.amazon.com/lightsail/pricing/)
- [Lightsail instance bundles](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-bundles.html)
- [AWS Budgets cost management](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)

## Recommended Demo Shape

Use a single Linux Lightsail instance running Docker Compose:

- Hono API container
- Worker container
- PostgreSQL container with a local Docker volume
- Redis container
- Reverse proxy container or host-level Caddy/Nginx

Do not add RDS, ElastiCache, EKS, NAT Gateway, ALB, CloudFront, paid observability SaaS, or managed Kubernetes for this portfolio demo unless there is a written reason and a new estimate.

## Monthly Estimate

Lightsail Linux bundles are billed hourly up to a fixed monthly plan cost. As of the review date, the relevant Linux bundles with public IPv4 are:

| Option | Use case | Approximate monthly cost | Notes |
| --- | --- | ---: | --- |
| Nano 0.5 GB | Short-lived smoke demo only | USD 5 | Lowest cost, may be tight for API + worker + PostgreSQL + Redis. |
| Micro 1 GB | Preferred initial public demo | USD 7 | Better fit for a modest portfolio demo with low traffic. |
| Small 2 GB | Safer live interview/demo buffer | USD 12 | Use if Prisma, PostgreSQL, or build memory pressure appears on smaller bundles. |

Expected steady-state target: **USD 7 to USD 12/month** before taxes, unusual data transfer, snapshots, or optional extras.

The Terraform skeleton defaults to a small, conservative Lightsail bundle placeholder. Confirm the exact `bundle_id` and price in the target region before `terraform apply`.

## Budget Guardrail

Before provisioning any AWS resource:

1. Create a monthly AWS cost budget.
2. Set the budget limit to **USD 15/month** for the initial Lightsail-only demo.
3. Add notification thresholds at **50%**, **80%**, and **100%**.
4. Send alerts to an email address that is checked regularly.
5. Record the budget name and threshold policy in deployment notes, but do not commit account IDs or email addresses.

If the Small 2 GB bundle is selected or snapshots are added, raise the reviewed estimate first and set the budget to a deliberate value such as USD 20/month.

## Cost Risks To Avoid

- **Stopped instances still cost money** until deleted. Destroy unused Lightsail instances instead of merely stopping them.
- **Snapshots and disks can remain billable** after an instance is removed.
- **Static IPs should be checked after destroy** so no detached address remains allocated.
- **Data transfer allowances vary by region and bundle**, so keep the public demo low traffic and avoid large assets.
- **Managed services change the cost profile quickly**, especially NAT Gateway, ALB, RDS, and Kubernetes-related resources.

## Verification Before Apply

Run these before creating resources:

```bash
cd infra/aws-lightsail
terraform init
terraform fmt -check
terraform validate
terraform plan -var-file=terraform.tfvars
```

The plan should include only the small Lightsail resources described in [`../../infra/aws-lightsail/README.md`](../../infra/aws-lightsail/README.md). If the plan includes managed databases, load balancers, Kubernetes clusters, NAT gateways, DNS records, or certificates, stop and review before applying.

## Destroy Verification

After `terraform destroy`, verify in the AWS console or CLI that no unexpected cost sources remain:

- Lightsail instances
- Lightsail static IPs
- Lightsail disks
- Lightsail snapshots
- Route 53 hosted zones or records created for the demo
- AWS Budgets alerts still pointing at the retired demo

Keep the budget active until the next billing cycle confirms the demo has stopped generating charges.
