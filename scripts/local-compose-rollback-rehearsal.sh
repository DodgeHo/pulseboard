#!/usr/bin/env bash
set -euo pipefail

export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-0}"
export COMPOSE_DOCKER_CLI_BUILD="${COMPOSE_DOCKER_CLI_BUILD:-0}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
compose_file="$repo_root/docker-compose.rollback-rehearsal.yml"
baseline_dockerfile="$repo_root/Dockerfile.rollback-baseline"
candidate_dockerfile="$repo_root/Dockerfile"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
run_token="${GITHUB_RUN_ID:-local}-$BASHPID"
safe_token="$(printf '%s' "$run_token" | tr '[:upper:]_' '[:lower:]-' | tr -cd 'a-z0-9-')"
project_name="pulseboard-rollback-$safe_token"
image_repository="pulseboard-rollback-$safe_token"
baseline_revision="baseline-$safe_token"
candidate_revision="candidate-$safe_token"
baseline_contract="baseline-v2"
candidate_contract="candidate-v3"
baseline_image="$image_repository:$baseline_revision"
candidate_image="$image_repository:$candidate_revision"
current_image="$baseline_image"
sentinel_slug="rollback-sentinel-$safe_token"
candidate_description="Candidate v3 operator context retained across rollback."
artifact_root="${PULSEBOARD_ROLLBACK_ARTIFACT_DIR:-$repo_root/.artifacts/application-rollback}"
artifact_dir="$artifact_root/$timestamp-$BASHPID"
baseline_migrations="$artifact_dir/baseline-migrations.txt"
candidate_migrations="$artifact_dir/candidate-migrations.txt"
rollback_migrations="$artifact_dir/rollback-migrations.txt"

compose() {
  PULSEBOARD_ROLLBACK_IMAGE="$current_image" \
    docker compose --project-name "$project_name" --file "$compose_file" "$@"
}

remove_project_resources() {
  compose down --volumes --remove-orphans >/dev/null 2>&1 || true
  docker image rm "$baseline_image" "$candidate_image" >/dev/null 2>&1 || true
}

cleanup() {
  remove_project_resources
}

trap cleanup EXIT

if ! command -v docker >/dev/null 2>&1; then
  printf 'docker is required for the application rollback rehearsal.\n' >&2
  exit 1
fi

mkdir -p "$artifact_dir"

assert_equal() {
  local expected="$1"
  local actual="$2"
  local label="$3"
  if [ "$expected" != "$actual" ]; then
    printf '%s changed: expected %s, got %s\n' "$label" "$expected" "$actual" >&2
    exit 1
  fi
}

build_image() {
  local image="$1"
  local revision="$2"
  local contract="$3"
  local dockerfile="$4"
  docker build \
    --file "$dockerfile" \
    --build-arg "NODE_IMAGE=${NODE_IMAGE:-node:22-bookworm-slim}" \
    --build-arg "NPM_REGISTRY=${NPM_REGISTRY:-https://registry.npmjs.org/}" \
    --build-arg "APT_DEBIAN_MIRROR=${APT_DEBIAN_MIRROR:-}" \
    --build-arg "APT_SECURITY_MIRROR=${APT_SECURITY_MIRROR:-}" \
    --build-arg "PULSEBOARD_BUILD_REVISION=$revision" \
    --build-arg "PULSEBOARD_BUILD_CONTRACT=$contract" \
    --tag "$image" \
    "$repo_root"
}

image_id() {
  docker image inspect --format '{{.Id}}' "$1"
}

record_image_provenance() {
  local image="$1"
  local expected_revision="$2"
  local expected_contract="$3"
  local label="$4"
  local actual_revision
  local actual_contract
  local content_id

  actual_revision="$(docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image")"
  actual_contract="$(docker image inspect --format '{{index .Config.Labels "io.pulseboard.build-contract"}}' "$image")"
  content_id="$(image_id "$image")"
  assert_equal "$expected_revision" "$actual_revision" "$label OCI revision label"
  assert_equal "$expected_contract" "$actual_contract" "$label contract label"

  docker image inspect "$image" > "$artifact_dir/$label-image-inspect.json"
  {
    printf 'reference=%s\n' "$image"
    printf 'expected_revision=%s\n' "$expected_revision"
    printf 'oci_revision=%s\n' "$actual_revision"
    printf 'expected_contract=%s\n' "$expected_contract"
    printf 'contract_label=%s\n' "$actual_contract"
    printf 'content_id=%s\n' "$content_id"
    printf 'repo_digests=%s\n' "$(docker image inspect --format '{{json .RepoDigests}}' "$image")"
  } > "$artifact_dir/$label-provenance.txt"
}

record_image_migrations() {
  local image="$1"
  local output_path="$2"
  docker run --rm "$image" sh -lc \
    'find packages/db/prisma/migrations -mindepth 1 -maxdepth 1 -type d -printf "%f\n" | sort' \
    > "$output_path"
}

record_migrations() {
  local output_path="$1"
  compose exec -T postgres \
    psql --username pulseboard --dbname pulseboard --tuples-only --no-align \
      --command 'SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name;' \
    > "$output_path"
}

postgres_container_id() {
  compose ps --quiet postgres
}

postgres_volume_name() {
  local container_id="$1"
  docker inspect \
    --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql/data"}}{{.Name}}{{end}}{{end}}' \
    "$container_id"
}

deploy_application() {
  compose run --rm --no-deps public-site
  compose up --detach --wait --no-deps --force-recreate api
  compose up --detach --no-deps --force-recreate worker
  compose up --detach --wait --no-deps --force-recreate edge
}

record_running_image_identity() {
  local phase="$1"
  local expected_reference="$2"
  local expected_content_id="$3"
  local output_path="$artifact_dir/$phase-running-images.txt"
  : > "$output_path"

  for service in api worker; do
    local container_id
    local selected_reference
    local running_content_id
    container_id="$(compose ps --quiet "$service")"
    selected_reference="$(docker inspect --format '{{.Config.Image}}' "$container_id")"
    running_content_id="$(docker inspect --format '{{.Image}}' "$container_id")"
    assert_equal "$expected_reference" "$selected_reference" "$phase $service selected image"
    assert_equal "$expected_content_id" "$running_content_id" "$phase $service running image content ID"
    {
      printf 'service=%s\n' "$service"
      printf 'container_id=%s\n' "$container_id"
      printf 'selected_reference=%s\n' "$selected_reference"
      printf 'running_content_id=%s\n\n' "$running_content_id"
    } >> "$output_path"
  done
}

verify_release() {
  local revision="$1"
  local contract="$2"
  local phase="$3"
  local evidence_path="$4"
  compose run --rm --no-deps \
    --env "EXPECTED_RELEASE=$revision" \
    --env "EXPECTED_CONTRACT=$contract" \
    --env "REHEARSAL_PHASE=$phase" \
    --env "SENTINEL_SLUG=$sentinel_slug" \
    --env "CANDIDATE_DESCRIPTION=$candidate_description" \
    verifier \
    > "$evidence_path"
}

record_expanded_field() {
  local output_path="$1"
  compose exec -T postgres \
    psql --username pulseboard --dbname pulseboard --tuples-only --no-align \
      --command "SELECT \"description\" || E'\\t' || \"expectedStatus\" FROM \"UptimeCheck\" WHERE \"name\" = 'Rollback compatibility check';" \
    > "$output_path"
}

assert_expanded_field() {
  local expected_status="$1"
  local actual
  actual="$(compose exec -T postgres \
    psql --username pulseboard --dbname pulseboard --tuples-only --no-align \
      --command "SELECT \"description\" || E'\\t' || \"expectedStatus\" FROM \"UptimeCheck\" WHERE \"name\" = 'Rollback compatibility check';")"
  assert_equal "${candidate_description}"$'\t'"${expected_status}" "$actual" 'expanded uptime-check field'
}

printf 'Recording the exact baseline and candidate compatibility sources.\n'
sha256sum \
  "$baseline_dockerfile" \
  "$repo_root/scripts/rollback-rehearsal/baseline/schema.prisma" \
  "$repo_root/scripts/rollback-rehearsal/baseline/schemas.ts.fixture" \
  > "$artifact_dir/baseline-source.sha256"
sha256sum \
  "$candidate_dockerfile" \
  "$repo_root/packages/db/prisma/schema.prisma" \
  "$repo_root/packages/core/src/schemas.ts" \
  "$repo_root/packages/db/prisma/migrations/0003_expand_uptime_check_description/migration.sql" \
  > "$artifact_dir/candidate-source.sha256"
if cmp --silent \
  "$repo_root/scripts/rollback-rehearsal/baseline/schema.prisma" \
  "$repo_root/packages/db/prisma/schema.prisma"; then
  printf 'Baseline and candidate Prisma schemas unexpectedly match.\n' >&2
  exit 1
fi

printf 'Building source-distinct immutable baseline and candidate images.\n'
build_image "$baseline_image" "$baseline_revision" "$baseline_contract" "$baseline_dockerfile"
build_image "$candidate_image" "$candidate_revision" "$candidate_contract" "$candidate_dockerfile"
baseline_content_id="$(image_id "$baseline_image")"
candidate_content_id="$(image_id "$candidate_image")"
if [ "$baseline_content_id" = "$candidate_content_id" ]; then
  printf 'Baseline and candidate images unexpectedly have the same content ID.\n' >&2
  exit 1
fi
record_image_provenance "$baseline_image" "$baseline_revision" "$baseline_contract" baseline
record_image_provenance "$candidate_image" "$candidate_revision" "$candidate_contract" candidate
record_image_migrations "$baseline_image" "$artifact_dir/baseline-image-migrations.txt"
record_image_migrations "$candidate_image" "$artifact_dir/candidate-image-migrations.txt"
printf '0001_init\n0002_reliability_core_hardening\n' > "$artifact_dir/expected-baseline-migrations.txt"
printf '0001_init\n0002_reliability_core_hardening\n0003_expand_uptime_check_description\n' \
  > "$artifact_dir/expected-candidate-migrations.txt"
cmp --silent "$artifact_dir/expected-baseline-migrations.txt" "$artifact_dir/baseline-image-migrations.txt"
cmp --silent "$artifact_dir/expected-candidate-migrations.txt" "$artifact_dir/candidate-image-migrations.txt"

printf 'Starting isolated PostgreSQL and Redis services (%s).\n' "$project_name"
compose up --detach --wait postgres redis

printf 'Applying the baseline migration set and creating the demo identity.\n'
compose run --rm migrate
compose run --rm seed
record_migrations "$baseline_migrations"
cmp --silent "$artifact_dir/expected-baseline-migrations.txt" "$baseline_migrations"
column_count="$(compose exec -T postgres \
  psql --username pulseboard --dbname pulseboard --tuples-only --no-align \
    --command "SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'UptimeCheck' AND column_name = 'description';")"
assert_equal '0' "$column_count" 'baseline description column count'

printf 'Deploying the baseline contract and creating durable tenant/check state.\n'
deploy_application
record_running_image_identity baseline "$baseline_image" "$baseline_content_id"
verify_release "$baseline_revision" "$baseline_contract" baseline "$artifact_dir/baseline.json"

original_postgres_container="$(postgres_container_id)"
original_postgres_volume="$(postgres_volume_name "$original_postgres_container")"

printf 'Applying migration 0003 and deploying the candidate contract.\n'
current_image="$candidate_image"
compose run --rm migrate
record_migrations "$candidate_migrations"
cmp --silent "$artifact_dir/expected-candidate-migrations.txt" "$candidate_migrations"
compose exec -T postgres \
  psql --username pulseboard --dbname pulseboard --tuples-only --no-align \
    --command "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'UptimeCheck' AND column_name = 'description';" \
  > "$artifact_dir/expanded-column.txt"
deploy_application
record_running_image_identity candidate "$candidate_image" "$candidate_content_id"
verify_release "$candidate_revision" "$candidate_contract" candidate "$artifact_dir/candidate.json"
record_expanded_field "$artifact_dir/expanded-field-after-candidate.txt"
assert_expanded_field 200
assert_equal "$original_postgres_container" "$(postgres_container_id)" 'PostgreSQL container identity'
assert_equal "$original_postgres_volume" "$(postgres_volume_name "$(postgres_container_id)")" 'PostgreSQL volume identity'

printf 'Rolling application containers back without reversing migration 0003.\n'
current_image="$baseline_image"
deploy_application
record_running_image_identity rollback "$baseline_image" "$baseline_content_id"
verify_release "$baseline_revision" "$baseline_contract" rollback "$artifact_dir/rollback.json"
record_migrations "$rollback_migrations"
record_expanded_field "$artifact_dir/expanded-field-after-rollback.txt"
assert_expanded_field 204
cmp --silent "$candidate_migrations" "$rollback_migrations"
assert_equal "$original_postgres_container" "$(postgres_container_id)" 'PostgreSQL container identity'
assert_equal "$original_postgres_volume" "$(postgres_volume_name "$(postgres_container_id)")" 'PostgreSQL volume identity'

printf '%s\n' "$original_postgres_container" > "$artifact_dir/postgres-container-id.txt"
printf '%s\n' "$original_postgres_volume" > "$artifact_dir/postgres-volume-name.txt"

printf 'Removing only project-scoped rehearsal containers, volumes, and images.\n'
remove_project_resources
trap - EXIT

if [ -n "$(docker ps --all --quiet --filter "label=com.docker.compose.project=$project_name")" ]; then
  printf 'Rehearsal containers remain after cleanup.\n' >&2
  exit 1
fi

if [ -n "$(docker volume ls --quiet --filter "label=com.docker.compose.project=$project_name")" ]; then
  printf 'Rehearsal volumes remain after cleanup.\n' >&2
  exit 1
fi

printf 'Expand-contract application rollback rehearsal completed successfully.\n'
printf 'Evidence directory: %s\n' "$artifact_dir"
