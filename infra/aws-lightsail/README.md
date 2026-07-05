# AWS Lightsail Terraform Rehearsal

This directory contains a low-cost Terraform skeleton for the eventual public PulseBoard demo host. It is intentionally conservative: by default it prepares a small Ubuntu Lightsail instance for Docker Compose and opens only SSH from explicitly allowed CIDR ranges.

Do not run `terraform apply` until the AWS budget alert, cost review, rollback plan, and DNS/TLS plan have been approved.

## What This Creates

- One Lightsail Ubuntu instance.
- One Lightsail SSH key pair from public key material.
- A public port policy limited to SSH by default.
- Optional HTTP, HTTPS, and static IP resources when explicitly enabled.
- Cloud-init bootstrap for Docker, Docker Compose plugin, Git, and UFW.

It does not create RDS, ElastiCache, EKS, NAT Gateway, ALB, Route 53 records, ACM certificates, or application secrets.

## Preflight

1. Create an AWS Budget alert in the AWS console.
2. Confirm the target region, availability zone, Lightsail blueprint, and bundle IDs:

   ```bash
   aws lightsail get-blueprints --region us-east-1
   aws lightsail get-bundles --region us-east-1
   ```

3. Copy the example variables file and fill it with non-secret operator values:

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

4. Replace `ssh_public_key` with public key material only.
5. Replace `ssh_allowed_cidrs` with your current public IP in `/32` form.
6. Keep `enable_http`, `enable_https`, and `attach_static_ip` set to `false` until reverse proxy, TLS, and rollback are ready.

## Plan Only

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -var-file=terraform.tfvars
```

Review the plan before applying. The expected plan should be small and should not include managed databases, load balancers, NAT gateways, Kubernetes clusters, DNS records, or certificates.

## Apply Gate

Only after explicit approval:

```bash
terraform apply -var-file=terraform.tfvars
```

After the instance is ready, SSH to the output address and deploy PulseBoard with `docker-compose.production.example.yml`. Keep application `.env` values on the server only.

## Public Exposure Gate

Open HTTP/HTTPS only after local-on-server checks pass and the reverse proxy config is ready:

```hcl
enable_http      = true
enable_https     = true
attach_static_ip = true
```

Then rerun `terraform plan` and review the additional exposure before applying.

## Destroy

When the demo is retired:

```bash
terraform destroy -var-file=terraform.tfvars
```

After destroy, confirm in AWS that no static IP, snapshot, disk, or unexpected billed service remains.
