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
API_KEY_HASH_SALT=<independently-generated-secret-of-at-least-32-characters>
WRITE_RATE_LIMIT_WINDOW_MS=60000
WRITE_RATE_LIMIT_MAX=120
CHECK_SCHEDULER_INTERVAL_MS=60000
HTTP_CHECK_TIMEOUT_MS=5000
```

The API and migration/seed containers run with `NODE_ENV=production` and reject a missing salt, the local `local-development-only` value, or a value shorter than 32 characters. Changing this salt invalidates existing stored API key hashes, so preserve it across ordinary deployments and handle a deliberate change as a credential migration.

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
revision="$(git rev-parse HEAD)"
export PULSEBOARD_IMAGE="pulseboard:git-$revision"
export PULSEBOARD_BUILD_REVISION="$revision"
docker compose -f docker-compose.production.example.yml build migrate
docker compose -f docker-compose.production.example.yml up -d postgres redis
docker compose -f docker-compose.production.example.yml run --rm migrate
docker compose -f docker-compose.production.example.yml run --rm migrate pnpm db:seed
docker compose -f docker-compose.production.example.yml up -d --no-build --no-deps api worker
docker compose -f docker-compose.production.example.yml run --rm public-site
docker compose -f docker-compose.production.example.yml ps
```

The production example keeps PostgreSQL and Redis private to the Docker network and binds the API to `127.0.0.1:4000` for reverse proxy use. The first deployment builds one revision-tagged local image and reuses it for migration, API, worker, and static-site tasks. Registry digests are preferred once a registry is available.

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
export PULSEBOARD_IMAGE="registry.example.com/pulseboard@sha256:<candidate-digest>"
docker compose -f docker-compose.production.example.yml pull migrate api worker public-site
docker compose -f docker-compose.production.example.yml run --rm migrate
docker compose -f docker-compose.production.example.yml up -d --no-build --force-recreate api worker
docker compose -f docker-compose.production.example.yml run --rm public-site
docker compose -f docker-compose.production.example.yml ps
curl -fsS http://127.0.0.1:4000/health/live
curl -fsS http://127.0.0.1:4000/health/ready
```

Record the current and candidate image digests before the update. Review every migration for compatibility with the previous application image, and stop when a destructive change makes application-only rollback unsafe.

## Rollback

```bash
export PULSEBOARD_IMAGE="registry.example.com/pulseboard@sha256:<previous-known-good-digest>"
docker compose -f docker-compose.production.example.yml pull api worker public-site
docker compose -f docker-compose.production.example.yml up -d --no-build --force-recreate api worker
docker compose -f docker-compose.production.example.yml run --rm public-site
curl -fsS http://127.0.0.1:4000/health/live
curl -fsS http://127.0.0.1:4000/health/ready
```

Do not run reverse migrations as part of application rollback. If the previous image is incompatible with the current schema, deploy a forward-compatible fix or enter the separately reviewed data-recovery procedure. The complete release gates, evidence list, and local rehearsal are in [`../application-rollback.md`](../application-rollback.md).

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

The workflow builds and verifies the project portal and namespaced PulseBoard artifacts on the GitHub runner, refuses to deploy over a dirty server worktree by default, checks out the selected ref, rebuilds the production compose stack, verifies `127.0.0.1:4000` health endpoints, runs `pnpm demo:flow` inside the API container, backs up and installs the portal and `/demo/` artifacts, installs the reviewed Nginx contract to both `sites-available/anlan.conf` and the staging host's regular `sites-enabled/anlan.conf`, reloads Nginx after `nginx -t`, and finally runs `pnpm verify:public` against the configured public base URL. The Nginx contract preserves the independent Career Radar proxy at `/jobs/`. If a reviewed deployment must proceed over a dirty staging checkout, explicitly enable `preserve_dirty_worktree`; the workflow records the current HEAD and status, exports tracked patches, archives untracked files, and creates a Git stash under a timestamped `$HOME/pulseboard-deploy-backups/` record before checkout. It does not create DNS, TLS, Tencent Cloud, or AWS resources; those must be approved and prepared separately.

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
