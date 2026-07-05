# Anlan Public Site Deployment

This document records the current public PulseBoard demo entry point on the existing Tencent Ubuntu host. It intentionally avoids secrets and does not describe any AWS, Terraform apply, DNS-provider, or paid-resource operation.

## Public Endpoints

- Homepage: `https://anlan.store/`
- API docs: `https://anlan.store/docs`
- OpenAPI JSON: `https://anlan.store/openapi.json`
- Readiness: `https://anlan.store/health/ready`
- Liveness: `https://anlan.store/health/live`

`https://www.anlan.store/` redirects to `https://anlan.store/` after a valid TLS handshake.

## Server Layout

- Static homepage source in this repository: [`../../deploy/anlan/index.html`](../../deploy/anlan/index.html)
- Nginx config source in this repository: [`../../deploy/anlan/nginx/anlan.conf`](../../deploy/anlan/nginx/anlan.conf)
- Server homepage target: `/var/www/html/index.html`
- Server Nginx target: `/etc/nginx/sites-available/anlan.conf`
- Existing study portal paths preserved: `/saa/`, `/sap/`, `/ispm/`
- PulseBoard API remains bound locally through Docker Compose: `127.0.0.1:4000`

## Deployment Commands

From the repository root on the operator machine:

```bash
scp deploy/anlan/index.html 175.178.175.56:/tmp/pulseboard-anlan-index.html
scp deploy/anlan/nginx/anlan.conf 175.178.175.56:/tmp/pulseboard-anlan.conf
```

On the server, install with backups before reload:

```bash
ts=$(date -u +%Y%m%dT%H%M%SZ)
sudo cp /var/www/html/index.html /var/www/html/index.html.backup-$ts
sudo cp /etc/nginx/sites-available/anlan.conf /etc/nginx/sites-available/anlan.conf.backup-$ts
sudo install -m 0644 /tmp/pulseboard-anlan-index.html /var/www/html/index.html
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

```bash
curl -I https://www.anlan.store
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
sudo install -m 0644 /etc/nginx/sites-available/anlan.conf.backup-<timestamp> /etc/nginx/sites-available/anlan.conf
sudo nginx -t
sudo systemctl reload nginx
```

This rollback only affects the public homepage and reverse proxy. It does not remove Docker containers or database state.
