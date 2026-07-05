# AWS Plan Checklist

Use this checklist before running the manual AWS Lightsail Terraform plan. It is intentionally plan-only: completing this checklist must not create a Lightsail instance, DNS record, certificate, database, load balancer, or any other billable application resource.

## Safety Rules

- [ ] Do not commit AWS credentials, SSH private keys, account IDs, email addresses, or real `.env` values.
- [ ] Do not run `terraform apply` from local machines or GitHub Actions until the apply step is explicitly approved.
- [ ] Keep `enable_http`, `enable_https`, and `attach_static_ip` set to `false` for the first plan.
- [ ] Treat the first accepted plan as an architecture and cost review artifact, not a deployment.
- [ ] Record only non-sensitive evidence: workflow URL, reviewed commit SHA, plan result, selected bundle, and budget status.

## Budget Preflight

- [ ] Create or confirm an AWS Budget before provisioning anything.
- [ ] Use a low initial monthly threshold for the Lightsail-only demo, such as USD 15.
- [ ] Add notification thresholds at 50%, 80%, and 100%.
- [ ] Confirm the alert email is monitored.
- [ ] Do not commit the budget email address or AWS account ID.

## GitHub Environment

Create a GitHub environment named `aws-demo-plan` before running [`.github/workflows/aws-lightsail-plan.yml`](../../.github/workflows/aws-lightsail-plan.yml).

Recommended environment protection:

- [ ] Require manual approval before running the job.
- [ ] Limit access to the repository owner/operator.
- [ ] Keep this environment separate from any future deploy/apply environment.

Required environment secret:

```text
AWS_DEMO_PLAN_ROLE_ARN=<arn-of-github-oidc-plan-role>
```

Required environment secrets for Terraform variables:

```text
AWS_LIGHTSAIL_SSH_PUBLIC_KEY=<public-ssh-key-material-only>
AWS_LIGHTSAIL_SSH_ALLOWED_CIDRS=["<your-current-public-ip>/32"]
```

Optional environment variables:

```text
AWS_REGION=us-east-1
AWS_LIGHTSAIL_AVAILABILITY_ZONE=us-east-1a
AWS_LIGHTSAIL_NAME_PREFIX=pulseboard-demo
AWS_LIGHTSAIL_BLUEPRINT_ID=ubuntu_22_04
AWS_LIGHTSAIL_BUNDLE_ID=nano_3_0
```

The workflow uses GitHub OIDC and does not require long-lived AWS access keys. If OIDC is not available yet, stop and set it up deliberately rather than adding broad personal access keys to the repository.

## AWS Role Scope

The `aws-demo-plan` role should be limited to Terraform plan review. It should not be reused for apply or day-to-day account administration.

Suggested posture:

- [ ] Trust only GitHub Actions OIDC from `DodgeHo/pulseboard`.
- [ ] Restrict assumption to the `aws-demo-plan` environment when possible.
- [ ] Grant the minimum Lightsail read permissions needed for provider refresh and plan.
- [ ] Avoid permissions for unrelated services such as RDS, EKS, ELB, NAT Gateway, Route 53, ACM, IAM mutation, or billing administration.
- [ ] Store the role ARN only as the `AWS_DEMO_PLAN_ROLE_ARN` environment secret.

If Terraform plan cannot refresh with read-only permissions, add only the specific missing read/list actions shown by the failed plan. Do not broaden the role to administrator access.

## First Plan

Use the manual workflow with the default input values:

```text
enable_http=false
enable_https=false
attach_static_ip=false
```

Expected resources in the plan:

- One Lightsail SSH key pair.
- One Lightsail Ubuntu instance.
- One Lightsail instance public port policy with SSH only.

Unexpected resources that should stop the review:

- RDS, ElastiCache, EKS, ECS, NAT Gateway, ALB, CloudFront, Route 53, ACM, IAM users, or access keys.
- Public HTTP/HTTPS exposure before reverse proxy and TLS are approved.
- Static IP attachment before DNS and rollback are approved.

## Public Exposure Plan

Only after the private plan is reviewed and staging remains healthy, run a second plan with:

```text
enable_http=true
enable_https=true
attach_static_ip=true
```

Review the extra exposure before applying anything. DNS changes for `demo.anlan.store` or `api.demo.anlan.store` require separate explicit approval.

## Completion Notes

Record only non-sensitive notes:

```text
Date:
Commit SHA:
Workflow run URL:
AWS region:
Lightsail bundle:
Public exposure inputs:
Budget confirmed: yes/no
Plan result: passed/failed
Reviewer notes:
```

Do not record account IDs, principal ARNs, public source IPs, email addresses, or secret values in committed files.
