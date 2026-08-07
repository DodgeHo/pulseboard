# Anlan Public Site Deployment

This runbook covers the existing `anlan.store` host only. It does not create or modify DNS records, TLS certificates, Tencent Cloud resources, AWS resources, or Terraform state.

## Public Route Contract

- Project portal: `https://anlan.store/`
- PulseBoard operations surface: `https://anlan.store/demo/`
- PulseBoard customer surface: `https://anlan.store/demo/frontend/`
- PulseBoard API docs: `https://anlan.store/demo/docs`
- PulseBoard OpenAPI JSON: `https://anlan.store/demo/openapi.json`
- PulseBoard readiness: `https://anlan.store/demo/health/ready`
- PulseBoard liveness: `https://anlan.store/demo/health/live`
- PulseBoard authenticated API: `https://anlan.store/demo/api/v1/*`
- Existing study tools: `https://anlan.store/saa/`, `https://anlan.store/sap/`, and `https://anlan.store/ispm/`

Legacy PulseBoard paths such as `/frontend/`, `/docs`, `/openapi.json`, `/health/*`, and `/v1/*` return permanent redirects into `/demo/`. `https://www.anlan.store/` continues to redirect to the bare domain after TLS negotiation.

## Repository and Server Layout

| Surface | Repository artifact | Server target |
| --- | --- | --- |
| Project portal | `deploy/anlan/index.html` | `/var/www/html/index.html` |
| PulseBoard operations | `deploy/anlan/demo/index.html` | `/var/www/html/demo/index.html` |
| PulseBoard customer UI | `deploy/anlan/demo/frontend/index.html` | `/var/www/html/demo/frontend/index.html` |
| Nginx route contract | `deploy/anlan/nginx/anlan.conf` | `/etc/nginx/sites-available/anlan.conf` |

The portal source is under `apps/portal`. PulseBoard web source remains under `apps/web`. The API remains bound to `127.0.0.1:4000` on the host and Nginx rewrites the public `/demo/` routes to the existing internal Hono routes.

## Build Gate

Run this from the repository root before uploading anything:

```bash
pnpm install --frozen-lockfile
pnpm build:public
pnpm verify:artifacts
git diff --exit-code -- deploy/anlan/index.html deploy/anlan/demo/index.html deploy/anlan/demo/frontend/index.html
```

`build:public` first creates the root portal, then builds PulseBoard into `deploy/anlan/demo/`. Both static surfaces remain self-contained HTML artifacts.

## Upload

Use the approved staging SSH alias or replace `<staging-host>` with the approved host. Do not put private keys, passwords, or tokens in this repository.

```bash
scp deploy/anlan/index.html <staging-host>:/tmp/anlan-portal-index.html
scp deploy/anlan/demo/index.html <staging-host>:/tmp/pulseboard-demo-index.html
scp deploy/anlan/demo/frontend/index.html <staging-host>:/tmp/pulseboard-demo-frontend-index.html
scp deploy/anlan/nginx/anlan.conf <staging-host>:/tmp/pulseboard-anlan.conf
```

## Install

On the host, create timestamped backups before replacing any artifact:

```bash
ts=$(date -u +%Y%m%dT%H%M%SZ)

if [ -f /var/www/html/index.html ]; then
  sudo cp /var/www/html/index.html /var/www/html/index.html.backup-$ts
fi
if [ -f /var/www/html/demo/index.html ]; then
  sudo cp /var/www/html/demo/index.html /var/www/html/demo/index.html.backup-$ts
fi
if [ -f /var/www/html/demo/frontend/index.html ]; then
  sudo cp /var/www/html/demo/frontend/index.html /var/www/html/demo/frontend/index.html.backup-$ts
fi
if [ -f /etc/nginx/sites-available/anlan.conf ]; then
  sudo cp /etc/nginx/sites-available/anlan.conf /etc/nginx/sites-available/anlan.conf.backup-$ts
fi

sudo install -d -m 0755 /var/www/html/demo/frontend
sudo install -m 0644 /tmp/anlan-portal-index.html /var/www/html/index.html
sudo install -m 0644 /tmp/pulseboard-demo-index.html /var/www/html/demo/index.html
sudo install -m 0644 /tmp/pulseboard-demo-frontend-index.html /var/www/html/demo/frontend/index.html
sudo install -m 0644 /tmp/pulseboard-anlan.conf /etc/nginx/sites-available/anlan.conf
sudo nginx -t
sudo systemctl reload nginx
```

Never reload Nginx when `sudo nginx -t` fails.

## Verification

Run the combined public gate after the approved install:

```bash
pnpm verify:public
```

For another rehearsal host:

```bash
PUBLIC_BASE_URL=https://staging.example.com pnpm verify:public
```

The verifier checks the portal, all four project entries, PulseBoard operations and customer pages, public health routes, Scalar docs, the public OpenAPI contract, unauthenticated API protection, legacy redirects, and the `www` redirect.

Useful manual checks:

```bash
curl -I https://anlan.store/
curl -I https://anlan.store/demo/
curl -I https://anlan.store/demo/frontend/
curl -fsS https://anlan.store/demo/health/live
curl -fsS https://anlan.store/demo/health/ready
curl -I https://anlan.store/demo/docs
curl -fsS https://anlan.store/demo/openapi.json
curl -i https://anlan.store/demo/api/v1/workspaces
curl -I https://anlan.store/saa/
curl -I https://anlan.store/sap/
curl -I https://anlan.store/ispm/
sudo nginx -t
systemctl is-active nginx
sudo docker compose -f docker-compose.production.example.yml ps
```

Expected results:

- `/` renders the `ANLAN.STORE` project directory and links all four deployed projects.
- `/demo/` renders the PulseBoard operations console.
- `/demo/frontend/` renders the multilingual customer surface.
- `/demo/health/live` returns `status: ok` and `/demo/health/ready` returns `status: ready`.
- `/demo/openapi.json` describes `/demo/health/*` and `/demo/api/v1/*` as public paths.
- `/demo/api/v1/workspaces` returns `401` without an API key.
- `/saa/`, `/sap/`, and `/ispm/` remain available.
- Old PulseBoard public paths redirect to `/demo/` equivalents.

## Rollback

Restore all artifacts from the same timestamp, validate Nginx, then reload:

```bash
sudo install -m 0644 /var/www/html/index.html.backup-<timestamp> /var/www/html/index.html
sudo install -m 0644 /var/www/html/demo/index.html.backup-<timestamp> /var/www/html/demo/index.html
sudo install -m 0644 /var/www/html/demo/frontend/index.html.backup-<timestamp> /var/www/html/demo/frontend/index.html
sudo install -m 0644 /etc/nginx/sites-available/anlan.conf.backup-<timestamp> /etc/nginx/sites-available/anlan.conf
sudo nginx -t
sudo systemctl reload nginx
```

This rollback changes static files and reverse-proxy routing only. It does not delete containers, queues, databases, DNS records, certificates, or cloud resources.
