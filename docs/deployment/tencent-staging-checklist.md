# Tencent Cloud Staging Checklist

Use this checklist to rehearse a low-risk Linux staging deployment. It is intentionally written as an operator checklist, not as proof that the Tencent Cloud host is the final public demo environment.

## Safety Rules

- [ ] Do not commit SSH keys, server passwords, DNS tokens, provider credentials, or production `.env` files.
- [ ] Do not paste real server credentials into issue comments, pull requests, README examples, or chat transcripts intended for the repository.
- [ ] Keep PostgreSQL and Redis private to the Docker network.
- [ ] Treat staging as disposable rehearsal infrastructure.
- [ ] Prefer forward fixes for failed migrations unless a rollback path has been explicitly tested.
- [ ] Do not create DNS records or enable public HTTPS until local-on-server health checks pass.

## Local Preflight

- [ ] Confirm the local repository is clean or intentionally dirty:

  ```bash
  git status --short
  ```

- [ ] Run the local validation suite:

  ```bash
  corepack pnpm typecheck
  corepack pnpm test
  corepack pnpm lint
  corepack pnpm doctor
  ```

- [ ] Run the Docker Compose smoke path from WSL or Linux if possible:

  ```bash
  export NODE_IMAGE=public.ecr.aws/docker/library/node:22-bookworm-slim
  export POSTGRES_IMAGE=public.ecr.aws/docker/library/postgres:16-alpine
  export REDIS_IMAGE=public.ecr.aws/docker/library/redis:7-alpine
  export NPM_REGISTRY=https://registry.npmjs.org/
  export APT_DEBIAN_MIRROR=http://mirrors.cloud.tencent.com/debian
  export APT_SECURITY_MIRROR=http://mirrors.cloud.tencent.com/debian-security
  export DOCKER_BUILDKIT=0
  export COMPOSE_DOCKER_CLI_BUILD=0
  bash scripts/local-compose-e2e.sh
  bash scripts/local-compose-integration.sh
  docker compose down
  ```

  If npmjs.org access is unreliable from the staging network, temporarily use `NPM_REGISTRY=https://registry.npmmirror.com` for the rehearsal build and record that override in the completion notes. Keep the Tencent apt mirror overrides when Debian package downloads from `deb.debian.org` are slow.

- [ ] Record the commit that passed validation:

  ```bash
  git rev-parse --short HEAD
  ```

## Server Preflight

- [ ] Confirm the server is an Ubuntu staging host and not the final public demo target.
- [ ] Confirm Docker Engine and Docker Compose are installed:

  ```bash
  docker --version
  docker compose version
  ```

- [ ] Confirm only the intended ports are exposed by the firewall:

  ```bash
  sudo ufw status verbose
  ```

- [ ] Confirm there is no existing PulseBoard process or container that would be overwritten unexpectedly:

  ```bash
  docker ps
  docker compose ls
  ```

## Server-Side Environment File

After the repository exists on the server, create `.env` manually in the repository root. Do not copy real values back into the repository.

The production compose file requires `POSTGRES_PASSWORD`, `DEMO_API_KEY`, and `API_KEY_HASH_SALT`; it should fail fast if any of those values are missing.

- [ ] Generate a long random demo API key.
- [ ] Generate a long random API key hash salt.
- [ ] Generate a non-default PostgreSQL password.
- [ ] Create `.env` with production-like values:

  ```bash
  NODE_ENV=production
  API_PORT=4000
  LOG_LEVEL=info
  POSTGRES_PASSWORD=<long-random-postgres-password>
  DATABASE_URL=postgresql://pulseboard:<long-random-postgres-password>@postgres:5432/pulseboard?schema=public
  REDIS_URL=redis://redis:6379
  DEMO_API_KEY=<long-random-demo-api-key>
  API_KEY_HASH_SALT=<long-random-api-key-hash-salt>
  WRITE_RATE_LIMIT_WINDOW_MS=60000
  WRITE_RATE_LIMIT_MAX=120
  CHECK_SCHEDULER_INTERVAL_MS=60000
  HTTP_CHECK_TIMEOUT_MS=5000
  ```

- [ ] Restrict `.env` permissions:

  ```bash
  chmod 600 .env
  ```

## First Deployment Rehearsal

- [ ] Clone or update the repository:

  ```bash
  git clone <repo-url> pulseboard
  cd pulseboard
  git checkout <validated-commit>
  ```

- [ ] Confirm the server-side `.env` file exists in the repository root and contains only staging values. Do not print it in logs.

- [ ] Start the production-like compose stack:

  ```bash
  docker compose -f docker-compose.production.example.yml up --build -d
  docker compose -f docker-compose.production.example.yml ps
  ```

- [ ] Verify local-on-server health checks before exposing anything publicly:

  ```bash
  curl -fsS http://127.0.0.1:4000/health/live
  curl -fsS http://127.0.0.1:4000/health/ready
  curl -fsS -H "Authorization: Bearer $DEMO_API_KEY" http://127.0.0.1:4000/v1/workspaces
  ```

- [ ] Inspect logs for startup errors without printing secrets:

  ```bash
  docker compose -f docker-compose.production.example.yml logs --tail=100 api
  docker compose -f docker-compose.production.example.yml logs --tail=100 worker
  ```

## Reverse Proxy and HTTPS Rehearsal

Only continue after the local-on-server checks are healthy.

- [ ] Choose a staging hostname such as `<staging-api-hostname>`.
- [ ] Create DNS only after confirming the host should be reachable from the public internet.
- [ ] Configure Caddy or Nginx to proxy to `127.0.0.1:4000`.
- [ ] Verify HTTPS health checks:

  ```bash
  curl -fsS https://<staging-api-hostname>/health/live
  curl -fsS https://<staging-api-hostname>/health/ready
  ```

- [ ] Verify authenticated access without exposing the key in shell history where possible.

## Restart and Recovery Checks

- [ ] Restart the compose stack:

  ```bash
  docker compose -f docker-compose.production.example.yml restart
  curl -fsS http://127.0.0.1:4000/health/ready
  ```

- [ ] Reboot only during an approved rehearsal window, then confirm services recover:

  ```bash
  docker compose -f docker-compose.production.example.yml ps
  curl -fsS http://127.0.0.1:4000/health/ready
  ```

## Update Rehearsal

- [ ] Pull the next validated commit:

  ```bash
  git fetch --all --prune
  git checkout <next-validated-commit>
  docker compose -f docker-compose.production.example.yml up --build -d
  curl -fsS http://127.0.0.1:4000/health/ready
  ```

- [ ] Confirm the worker is still processing checks and the API still serves authenticated routes.

## Rollback Rehearsal

- [ ] Identify the previous known-good commit:

  ```bash
  git log --oneline -5
  ```

- [ ] Roll back the app code:

  ```bash
  git checkout <previous-known-good-commit>
  docker compose -f docker-compose.production.example.yml up --build -d
  curl -fsS http://127.0.0.1:4000/health/ready
  ```

- [ ] If a database migration was already applied, prefer a forward fix unless the rollback has been reviewed and tested.

## Cleanup

- [ ] Stop the stack when the rehearsal is complete:

  ```bash
  docker compose -f docker-compose.production.example.yml down
  ```

- [ ] Remove data only when intentionally destroying the staging rehearsal database:

  ```bash
  docker compose -f docker-compose.production.example.yml down -v
  ```

- [ ] Remove temporary reverse proxy config if it was only for the rehearsal.
- [ ] Remove temporary DNS records if any were created.
- [ ] Remove the server-side `.env` when the staging host is decommissioned.

## Completion Notes

Record only non-sensitive evidence:

- Validated commit: `<commit-sha>`
- Health check result: `pass` or `fail`
- Compose services healthy: `yes` or `no`
- Reverse proxy enabled: `yes` or `no`
- DNS/TLS enabled: `yes` or `no`
- Cleanup completed: `yes` or `no`
