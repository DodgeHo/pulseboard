# PostgreSQL Backup And Restore Runbook

PulseBoard treats PostgreSQL as the authoritative store for tenants, API-key metadata, check executions, incidents, notification state, audit logs, and usage records. Redis is disposable queue and operational-metric infrastructure. This runbook covers a logical backup, an isolated restore, and the evidence required before recovery is trusted.

This is recovery rehearsal evidence, not a claim of continuous backup, point-in-time recovery, or a measured production recovery objective.

## Automated Rehearsal

Run from WSL or another Linux environment with Docker Compose and Bash:

```bash
corepack pnpm compose:backup-restore
```

The rehearsal uses [`../docker-compose.backup-rehearsal.yml`](../docker-compose.backup-rehearsal.yml) under a unique Compose project name. It publishes no host ports and does not read, stop, replace, or remove the normal PulseBoard Compose project or its `postgres_data` volume.

It performs this sequence:

1. Starts independent source and restore PostgreSQL 16 containers with separate project-scoped volumes.
2. Builds the real application image, applies checked-in Prisma migrations, and runs the real seed.
3. Loads deterministic reliability data, including a completed check execution, open incident, dead-lettered notification, attempt history, webhook, audit events, and usage metrics.
4. Verifies source invariants and creates a full-table manifest.
5. Creates a custom-format archive with `pg_dump -Fc --no-owner --no-privileges`.
6. Parses the archive with `pg_restore --list`, restores into an independent empty database, and re-runs the invariants.
7. Compares source and restored table fingerprints byte-for-byte, then removes only the rehearsal containers and volumes.

Evidence is written below the ignored directory:

```text
.artifacts/postgres-backup-restore/<utc-timestamp>-<process-id>/
  pulseboard-<utc-timestamp>.dump
  archive-list.txt
  source-manifest.txt
  restore-manifest.txt
```

The local archive is intentionally unencrypted and must not be uploaded or treated as a production retention mechanism. When Docker Hub is unavailable, image and registry sources can be overridden without editing tracked files:

```bash
POSTGRES_IMAGE=public.ecr.aws/docker/library/postgres:16-alpine \
NODE_IMAGE=public.ecr.aws/docker/library/node:22-bookworm-slim \
NPM_REGISTRY=https://registry.npmmirror.com \
corepack pnpm compose:backup-restore
```

The local rehearsal passed on 2026-08-28. CI is configured to run the same script in a separate `backup-restore` job, but configuration is not evidence of a successful remote run.

## Production Backup Procedure

Use a restricted operator account. Pause migrations and deployments while capturing and verifying a backup so the archive, manifest, and application commit describe one reviewable recovery point.

```bash
set -euo pipefail
umask 077

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_dir="/var/backups/pulseboard/$timestamp"
mkdir -p "$backup_dir"

docker compose -f docker-compose.production.example.yml exec -T postgres \
  psql -U pulseboard -d pulseboard \
  < scripts/postgres-backup-rehearsal/manifest.sql \
  > "$backup_dir/source-manifest.txt"

docker compose -f docker-compose.production.example.yml exec -T postgres \
  pg_dump -U pulseboard -d pulseboard -Fc --no-owner --no-privileges \
  > "$backup_dir/pulseboard.dump"

test -s "$backup_dir/pulseboard.dump"

docker compose -f docker-compose.production.example.yml exec -T postgres \
  pg_restore --list < "$backup_dir/pulseboard.dump" \
  > "$backup_dir/archive-list.txt"

git rev-parse HEAD > "$backup_dir/application-commit.txt"
sha256sum "$backup_dir/pulseboard.dump" > "$backup_dir/SHA256SUMS"
```

Record the PostgreSQL server major version too. Use `pg_dump` from the same major version as the source and the same major-version restore tools for routine recovery. Rehearse version upgrades separately.

The archive contains one database's schema and data. It does not preserve cluster roles, tablespaces, host configuration, Redis data, reverse-proxy configuration, application secrets, or files outside PostgreSQL.

## Isolated Restore Procedure

Never test a restore by writing over the active database. Start an isolated restore target with a unique Compose project name and no published ports:

```bash
set -euo pipefail

restore_project="pulseboard-restore-$(date -u +%Y%m%d%H%M%S)"
backup_dir="/var/backups/pulseboard/<selected-backup>"

docker compose \
  --project-name "$restore_project" \
  --file docker-compose.backup-rehearsal.yml \
  up --detach --wait postgres-restore

docker compose \
  --project-name "$restore_project" \
  --file docker-compose.backup-rehearsal.yml \
  exec -T postgres-restore \
  pg_restore -U pulseboard -d pulseboard_restore \
    --exit-on-error --no-owner --no-privileges \
  < "$backup_dir/pulseboard.dump"

docker compose \
  --project-name "$restore_project" \
  --file docker-compose.backup-rehearsal.yml \
  exec -T postgres-restore \
  psql -U pulseboard -d pulseboard_restore \
  < scripts/postgres-backup-rehearsal/manifest.sql \
  > "$backup_dir/restore-manifest.txt"

cmp "$backup_dir/source-manifest.txt" "$backup_dir/restore-manifest.txt"
```

The deterministic [`../scripts/postgres-backup-rehearsal/verify.sql`](../scripts/postgres-backup-rehearsal/verify.sql) is for the automated fixture only. For a real backup, use the generic manifest comparison, inspect `_prisma_migrations`, and run application-level read checks against the isolated target with credentials and networking that cannot reach the live database.

Remove the isolated target only after evidence has been reviewed:

```bash
docker compose \
  --project-name "$restore_project" \
  --file docker-compose.backup-rehearsal.yml \
  down --volumes --remove-orphans
```

## Recovery Cutover Checklist

A destructive recovery remains a manual, maintenance-gated operation:

- Identify the incident scope and the last known-good application commit, migration set, and backup timestamp.
- Stop API and worker writes before replacing the authoritative database.
- Capture one final restricted backup of the damaged database for later analysis when storage permits.
- Verify the selected archive checksum and `pg_restore --list` output.
- Restore and inspect the archive in an isolated target first.
- Compare source-time and restore manifests and inspect completed Prisma migrations.
- Start the application version recorded with the backup; do not automatically run newer migrations during the first recovery boot.
- Run `/health/ready`, authenticated read checks, and a controlled demo flow before resuming normal traffic.
- Re-enable API and worker processes deliberately and watch logs, queue depth, failed checks, and notification failures.
- Record the backup timestamp, application commit, operator, restore result, validation result, and accepted data-loss window without storing secrets.
- Keep the pre-recovery volume until recovery is accepted and the retention policy permits deletion.

## Secrets, Storage, And Retention

- Treat an archive as sensitive even though API key plaintext is not stored. It contains user identities, hashed credentials, monitored URLs, incident details, webhook payloads, and operational history.
- Store real archives outside the repository with restrictive permissions, encryption at rest, controlled access, and a documented retention policy.
- Encrypt before transferring an archive off-host and keep encryption keys in a separate controlled system.
- Do not print database passwords or application secrets into logs. The commands above use the existing server-side environment rather than embedding credentials in arguments.
- Test deletion and expiration of old archives so retention does not silently exhaust host storage.

## Redis Recovery Boundary

Redis is not included in the backup. Redis loss can discard queued BullMQ deliveries and current operational-metric counters. PostgreSQL remains authoritative: uptime and notification dispatchers scan due or expired durable rows and can republish work after Redis returns. Metrics begin from a new Redis state and are not reconstructed.

PostgreSQL restore plus Redis restart can therefore recover durable business state, but queue state and recent metric history are not point-in-time consistent with the database. Recovery validation must allow dispatchers to rebuild pending work and watch for idempotent reprocessing.

## Honest Recovery Objectives

PulseBoard does not currently implement WAL archiving, continuous backups, cross-region replication, or point-in-time recovery.

- **RPO:** bounded only by the age of the latest successful, retained, and verified logical dump. No smaller data-loss promise is justified.
- **RTO:** not measured for production-sized data. The local deterministic rehearsal proves the procedure and integrity checks, not a production recovery duration.

Physical base backups plus WAL/PITR would be appropriate when a real data-loss requirement, database size, and operating budget justify the extra storage, monitoring, and restore complexity. They are intentionally not introduced for the current portfolio scope.
