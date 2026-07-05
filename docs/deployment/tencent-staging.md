# Tencent Cloud Staging Rehearsal

This document is a rehearsal plan, not a command log. The Tencent Cloud Ubuntu server should be used to practice real Linux deployment operations before the project is exposed as an overseas-facing AWS demo.

## Scope

Use staging to prove:

- Docker Compose can run the API, worker, PostgreSQL, and Redis on Linux.
- HTTPS can be terminated by a reverse proxy.
- Services restart after reboot.
- Deployment can be repeated from a clean checkout.
- The public homepage can be installed with backups and verified together with the backend surface.
- Rollback and cleanup are documented.

Do not use staging as the final public demo if latency or network accessibility is poor for overseas reviewers.

Use the operator checklist in [`tencent-staging-checklist.md`](tencent-staging-checklist.md) before touching any real staging host. Use [`tencent-staging-deploy-secrets.md`](tencent-staging-deploy-secrets.md) before configuring the manual GitHub Actions deployment rehearsal.

## Secrets Policy

Never commit:

- SSH private keys
- server passwords
- DNS tokens
- production `.env` files
- provider credentials

Use a server-side `.env` file created manually:

The production compose file requires the staging secret values and should fail fast if `POSTGRES_PASSWORD`, `DEMO_API_KEY`, or `API_KEY_HASH_SALT` is missing.

```bash
NODE_ENV=production
API_PORT=4000
LOG_LEVEL=info
POSTGRES_PASSWORD=<long-random-postgres-password>
DATABASE_URL=postgresql://pulseboard:<long-random-postgres-password>@postgres:5432/pulseboard?schema=public
REDIS_URL=redis://redis:6379
DEMO_API_KEY=replace-with-a-long-random-demo-key
API_KEY_HASH_SALT=replace-with-a-long-random-salt
WRITE_RATE_LIMIT_WINDOW_MS=60000
WRITE_RATE_LIMIT_MAX=120
CHECK_SCHEDULER_INTERVAL_MS=60000
HTTP_CHECK_TIMEOUT_MS=5000
```

## Server Preparation

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git ufw

# Install Docker from the official Docker repository before running Compose.
docker --version
docker compose version
```

Suggested firewall policy:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Do not expose PostgreSQL or Redis ports publicly.

## First Deployment

```bash
git clone <repo-url> pulseboard
cd pulseboard
# create .env manually from the checklist; do not copy local defaults
docker compose -f docker-compose.production.example.yml up --build -d
docker compose -f docker-compose.production.example.yml ps
```

The production example keeps PostgreSQL and Redis private to the Docker network and binds the API to `127.0.0.1:4000` for reverse proxy use.

Verify:

```bash
curl http://127.0.0.1:4000/health/live
curl http://127.0.0.1:4000/health/ready
curl -H "Authorization: Bearer $DEMO_API_KEY" http://127.0.0.1:4000/v1/workspaces
```

## Reverse Proxy

Use Caddy or Nginx. Caddy is simpler for a rehearsal because it can manage certificates automatically.

Example Caddy route:

```caddyfile
api.staging.example.com {
  reverse_proxy 127.0.0.1:4000
}
```

Only create DNS records after confirming the staging host should be reachable from the public internet.

## Restart Policy

For staging, Docker Compose can use service restart policies in a deployment override file. The production example compose file already includes `restart: unless-stopped`.

```yaml
services:
  api:
    restart: unless-stopped
  worker:
    restart: unless-stopped
  postgres:
    restart: unless-stopped
  redis:
    restart: unless-stopped
```

Keep production-like operational behavior without introducing Kubernetes.

## Update

```bash
git pull --ff-only
docker compose -f docker-compose.production.example.yml up --build -d
docker compose -f docker-compose.production.example.yml ps
curl http://127.0.0.1:4000/health/ready
```

## Rollback

```bash
git log --oneline -5
git checkout <previous-known-good-commit>
docker compose -f docker-compose.production.example.yml up --build -d
curl http://127.0.0.1:4000/health/ready
```

For schema migrations, rollback should be treated carefully. Prefer forward fixes unless the failed migration is known to be reversible and no important data has been written.

## Manual GitHub Actions Deployment Rehearsal

The manual workflow in [`.github/workflows/deploy-tencent-staging.yml`](../../.github/workflows/deploy-tencent-staging.yml) can rehearse a staging deploy after the repository and server are stable. It is intentionally `workflow_dispatch` only and should not be run until the staging environment is approved for automated access.

Before adding GitHub secrets or running the workflow, follow [`tencent-staging-deploy-secrets.md`](tencent-staging-deploy-secrets.md).

Required GitHub environment:

- Environment name: `tencent-staging`
- Optional protection rule: manual reviewer approval before deployment

Required GitHub secrets:

- `TENCENT_STAGING_HOST`: staging host name or IP
- `TENCENT_STAGING_USER`: SSH user, usually `ubuntu`
- `TENCENT_STAGING_SSH_KEY`: private deploy key for this staging host only
- `TENCENT_STAGING_KNOWN_HOSTS`: pinned SSH host key entry

The workflow builds and verifies the public homepage artifact on the GitHub runner, refuses to deploy over a dirty server worktree, checks out the selected ref, rebuilds the production compose stack, verifies `127.0.0.1:4000` health endpoints, runs `pnpm demo:flow` inside the API container, backs up and installs the public homepage/Nginx config, reloads Nginx after `nginx -t`, and finally runs `pnpm verify:public` against the configured public base URL. It does not create DNS, TLS, Tencent Cloud, or AWS resources; those must be approved and prepared separately.

Optional GitHub environment variable:

- `TENCENT_STAGING_PUBLIC_BASE_URL`: public URL used by `pnpm verify:public`; defaults to `https://anlan.store`.

## Cleanup

```bash
docker compose -f docker-compose.production.example.yml down
docker compose -f docker-compose.production.example.yml down -v # destructive: removes local PostgreSQL data
```

Also remove:

- reverse proxy site config
- staging DNS records
- temporary server-side `.env`
