#!/usr/bin/env bash
set -euo pipefail

export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-0}"
export COMPOSE_DOCKER_CLI_BUILD="${COMPOSE_DOCKER_CLI_BUILD:-0}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
compose_file="$repo_root/docker-compose.backup-rehearsal.yml"
sql_dir="$script_dir/postgres-backup-rehearsal"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
run_token="${GITHUB_RUN_ID:-local}-${BASHPID}"
project_name="pulseboard-backup-restore-$(printf '%s' "$run_token" | tr '[:upper:]_' '[:lower:]-' | tr -cd 'a-z0-9-')"
artifact_root="${PULSEBOARD_BACKUP_ARTIFACT_DIR:-$repo_root/.artifacts/postgres-backup-restore}"
artifact_dir="$artifact_root/$timestamp-$BASHPID"
dump_path="$artifact_dir/pulseboard-$timestamp.dump"
archive_list_path="$artifact_dir/archive-list.txt"
source_manifest_path="$artifact_dir/source-manifest.txt"
restore_manifest_path="$artifact_dir/restore-manifest.txt"

compose() {
  docker compose --project-name "$project_name" --file "$compose_file" "$@"
}

cleanup() {
  compose down --volumes --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

if ! command -v docker >/dev/null 2>&1; then
  printf 'docker is required for the PostgreSQL backup/restore rehearsal.\n' >&2
  exit 1
fi

mkdir -p "$artifact_dir"

printf 'Starting isolated PostgreSQL source and restore databases (%s).\n' "$project_name"
compose up --detach --wait postgres-source postgres-restore

printf 'Building the migration image and creating deterministic source data.\n'
compose build migrate-source
compose run --rm migrate-source
compose exec -T postgres-source \
  psql --username pulseboard --dbname pulseboard \
  < "$sql_dir/fixture.sql"

printf 'Verifying source invariants before backup.\n'
compose exec -T postgres-source \
  psql --username pulseboard --dbname pulseboard \
  < "$sql_dir/verify.sql"
compose exec -T postgres-source \
  psql --username pulseboard --dbname pulseboard \
  < "$sql_dir/manifest.sql" \
  > "$source_manifest_path"

printf 'Creating a PostgreSQL custom-format logical backup.\n'
compose exec -T postgres-source \
  pg_dump \
    --username pulseboard \
    --dbname pulseboard \
    --format custom \
    --no-owner \
    --no-privileges \
  > "$dump_path"

if [ ! -s "$dump_path" ]; then
  printf 'Backup archive is empty: %s\n' "$dump_path" >&2
  exit 1
fi

compose exec -T postgres-restore \
  pg_restore --list \
  < "$dump_path" \
  > "$archive_list_path"

printf 'Restoring into the independent target database.\n'
compose exec -T postgres-restore \
  pg_restore \
    --username pulseboard \
    --dbname pulseboard_restore \
    --exit-on-error \
    --no-owner \
    --no-privileges \
  < "$dump_path"

printf 'Verifying restored invariants and full-table fingerprints.\n'
compose exec -T postgres-restore \
  psql --username pulseboard --dbname pulseboard_restore \
  < "$sql_dir/verify.sql"
compose exec -T postgres-restore \
  psql --username pulseboard --dbname pulseboard_restore \
  < "$sql_dir/manifest.sql" \
  > "$restore_manifest_path"

if ! cmp --silent "$source_manifest_path" "$restore_manifest_path"; then
  printf 'Restored database manifest differs from the source manifest.\n' >&2
  diff --unified "$source_manifest_path" "$restore_manifest_path" >&2 || true
  exit 1
fi

printf 'PostgreSQL backup/restore rehearsal completed successfully.\n'
printf 'Backup archive: %s\n' "$dump_path"
printf 'Verified manifest: %s\n' "$restore_manifest_path"
