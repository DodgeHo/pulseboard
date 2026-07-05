# Tencent Staging Deploy Secrets Checklist

Use this checklist before running the manual `Deploy Tencent Staging` GitHub Actions workflow. The workflow is intentionally manual and staging-only. It may install the already-reviewed public homepage/Nginx files on an approved host, but it must not create DNS records, TLS certificates, Tencent Cloud resources, or AWS resources.

## Scope

This checklist covers only the GitHub environment and SSH material needed for the staging deployment rehearsal.

It does not cover:

- DNS changes
- TLS certificate setup
- Tencent Cloud resource creation
- AWS resource creation
- production API keys or customer data
- creating or approving the public host itself

## Required GitHub Environment

Create a GitHub environment named:

```text
tencent-staging
```

Recommended settings:

- Require manual approval before deployment.
- Restrict who can approve and run deployments.
- Keep the environment separate from any future AWS or production target.

## Required Secrets

Add these secrets to the `tencent-staging` environment, not as broad repository secrets unless there is a specific reason.

| Secret | Example shape | Notes |
| --- | --- | --- |
| `TENCENT_STAGING_HOST` | `<staging-host-or-ip>` | Hostname or IP only. Do not include `ubuntu@`. |
| `TENCENT_STAGING_USER` | `ubuntu` | Least-privileged deploy user that can run the required Docker commands. |
| `TENCENT_STAGING_SSH_KEY` | OpenSSH private key | Use a staging-only deploy key. Do not reuse a personal key if avoidable. |
| `TENCENT_STAGING_KNOWN_HOSTS` | `host key entry` | Pin the host key; do not disable host key checking. |

## Deploy Key Policy

- Prefer a staging-only SSH key pair dedicated to this repository and host.
- Do not commit the private key or paste it into documentation.
- Store the public key only in the staging user's `~/.ssh/authorized_keys`.
- Remove the public key from the server when the rehearsal is retired.
- Rotate the key if it is ever copied into the wrong place.

Generate a dedicated key locally only when approved for the rehearsal:

```bash
ssh-keygen -t ed25519 -C "pulseboard-tencent-staging" -f ~/.ssh/pulseboard_tencent_staging
```

## Known Hosts Policy

Capture and review the host key before saving it as a GitHub secret:

```bash
ssh-keyscan -H <staging-host-or-ip>
```

Verify the fingerprint through the cloud console or an existing trusted SSH session when possible:

```bash
ssh-keygen -lf <known-hosts-file>
```

Do not use `StrictHostKeyChecking no` in the workflow.

## Server-Side Requirements

Before the workflow can succeed, the staging server should already have:

- The repository at `~/pulseboard`.
- A server-side `.env` file in `~/pulseboard` with staging values.
- Docker Engine and Docker Compose installed.
- Nginx installed if the public homepage install step will be used.
- A clean Git worktree, except ignored files such as `.env`.
- Permission for the deploy user to run the required `sudo docker compose` commands.

The workflow must not print `.env` contents. Health checks and `pnpm demo:flow` should use environment variables inside the remote shell and container.

## Pre-Run Checks

Run these checks from a trusted machine before the first manual workflow run:

```bash
ssh <staging-user>@<staging-host-or-ip> "git -C ~/pulseboard status --short"
ssh <staging-user>@<staging-host-or-ip> "docker --version"
ssh <staging-user>@<staging-host-or-ip> "docker compose version"
ssh <staging-user>@<staging-host-or-ip> "test -f ~/pulseboard/.env"
```

Do not print the `.env` file.

## Manual Workflow Run

Use the GitHub Actions `Deploy Tencent Staging` workflow with an explicit ref:

```text
master
```

or a reviewed commit SHA:

```text
<validated-commit-sha>
```

The workflow validates the ref shape, builds and verifies the public homepage artifact, refuses to deploy over a dirty server worktree, fetches the requested ref, rebuilds the production compose stack, checks local-on-server health endpoints, runs `pnpm demo:flow` inside the API container, installs the public homepage/Nginx config with timestamped backups, reloads Nginx after `nginx -t`, and runs `pnpm verify:public`.

## Post-Run Evidence

Record only non-sensitive evidence:

- Workflow run URL
- Deployed ref
- Health check result
- Demo flow result
- Public surface verification result
- Public homepage/Nginx backup timestamp, if files were installed
- Rollback ref, if a rollback rehearsal was run

Do not record API keys, private keys, server passwords, DNS tokens, or provider credentials.
