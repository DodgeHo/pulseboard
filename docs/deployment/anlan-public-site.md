# Anlan Public Site Deployment

This document records the current public PulseBoard demo entry point on the existing Tencent Ubuntu host. It intentionally avoids secrets and does not describe any AWS, Terraform apply, DNS-provider, or paid-resource operation.

## Public Endpoints

- Homepage: `https://anlan.store/`
- Customer-facing frontend homepage: `https://anlan.store/frontend/`
- API docs: `https://anlan.store/docs`
- OpenAPI JSON: `https://anlan.store/openapi.json`
- Readiness: `https://anlan.store/health/ready`
- Liveness: `https://anlan.store/health/live`

`https://www.anlan.store/` redirects to `https://anlan.store/` after a valid TLS handshake.

## Server Layout

- Frontend app source in this repository: [`../../apps/web`](../../apps/web)
- Generated static cockpit homepage in this repository: [`../../deploy/anlan/index.html`](../../deploy/anlan/index.html)
- Generated customer-facing frontend homepage in this repository: [`../../deploy/anlan/frontend/index.html`](../../deploy/anlan/frontend/index.html)
- Nginx config source in this repository: [`../../deploy/anlan/nginx/anlan.conf`](../../deploy/anlan/nginx/anlan.conf)
- Server cockpit homepage target: `/var/www/html/index.html`
- Server customer-facing frontend target: `/var/www/html/frontend/index.html`
- Server Nginx target: `/etc/nginx/sites-available/anlan.conf`
- Existing study portal paths preserved: `/saa/`, `/sap/`, `/ispm/`
- PulseBoard API remains bound locally through Docker Compose: `127.0.0.1:4000`

## Deployment Commands

From the repository root on the operator machine, build the frontend first. The build generates the cockpit homepage at `deploy/anlan/index.html` and the customer-facing SaaS homepage at `deploy/anlan/frontend/index.html`.

```bash
pnpm build:web
pnpm verify:web
scp deploy/anlan/index.html 175.178.175.56:/tmp/pulseboard-anlan-index.html
scp deploy/anlan/frontend/index.html 175.178.175.56:/tmp/pulseboard-anlan-frontend-index.html
scp deploy/anlan/nginx/anlan.conf 175.178.175.56:/tmp/pulseboard-anlan.conf
```

On the server, install with backups before reload:

```bash
ts=$(date -u +%Y%m%dT%H%M%SZ)
sudo cp /var/www/html/index.html /var/www/html/index.html.backup-$ts
if [ -f /var/www/html/frontend/index.html ]; then sudo cp /var/www/html/frontend/index.html /var/www/html/frontend/index.html.backup-$ts; fi
sudo cp /etc/nginx/sites-available/anlan.conf /etc/nginx/sites-available/anlan.conf.backup-$ts
sudo install -m 0644 /tmp/pulseboard-anlan-index.html /var/www/html/index.html
sudo install -d -m 0755 /var/www/html/frontend
sudo install -m 0644 /tmp/pulseboard-anlan-frontend-index.html /var/www/html/frontend/index.html
sudo install -m 0644 /tmp/pulseboard-anlan.conf /etc/nginx/sites-available/anlan.conf
sudo nginx -t
sudo systemctl reload nginx
```

## TLS

The existing Let's Encrypt certificate was expanded to cover both names:

- `anlan.store`
- `www.anlan.store`

Renewal is managed by certbot on the server. Verify without printing secrets:

```bash
sudo certbot certificates
```

## Verification

Before uploading, run the local artifact gate. CI also runs this gate and checks that `deploy/anlan/index.html` and `deploy/anlan/frontend/index.html` are up to date with `apps/web` source changes:

```bash
pnpm verify:web
```

After the approved server install and Nginx reload, verify the public surface with the combined homepage/backend gate:

```bash
pnpm verify:public
```

The same checks can target another rehearsal domain by setting `PUBLIC_BASE_URL`, for example:

```bash
PUBLIC_BASE_URL=https://staging.example.com pnpm verify:public
```

Manual spot checks remain useful when investigating a failure:

```bash
curl -I https://www.anlan.store
curl -I https://anlan.store/frontend/
curl -fsS https://anlan.store/health/live
curl -fsS https://anlan.store/health/ready
curl -I https://anlan.store/docs
curl -fsS https://anlan.store/openapi.json
curl -i https://anlan.store/v1/workspaces
sudo nginx -t
systemctl is-active nginx
sudo docker compose -f docker-compose.production.example.yml ps
```

Expected results:

- Homepage renders the frontend cockpit and backend probes together.
- `/frontend/` renders the customer-facing SaaS homepage with a scroll-driven 3D reliability tower, commercial product sections, pricing, FAQ, and backend-proof CTA.
- Language selector exposes 10 locales, with English first/default and Simplified Chinese last.
- `/?lang=zh-TW`, `/?lang=zh-CN`, and `/?lang=ar` can be used for deterministic locale checks; Arabic should set the page direction to RTL.
- Browser console should have no frontend page errors on the homepage.
- `www` redirects to the bare domain.
- Health endpoints return `ok` and `ready`.
- API docs and OpenAPI JSON return `200`.
- `/v1/workspaces` returns `401` without an API key.
- Existing study portal paths still return `200`.
- Nginx is active and Docker Compose services remain healthy/running.

## Rollback

Restore the latest timestamped backup and reload Nginx:

```bash
sudo install -m 0644 /var/www/html/index.html.backup-<timestamp> /var/www/html/index.html
sudo install -m 0644 /var/www/html/frontend/index.html.backup-<timestamp> /var/www/html/frontend/index.html
sudo install -m 0644 /etc/nginx/sites-available/anlan.conf.backup-<timestamp> /etc/nginx/sites-available/anlan.conf
sudo nginx -t
sudo systemctl reload nginx
```

This rollback only affects the public homepage and reverse proxy. It does not remove Docker containers or database state.
