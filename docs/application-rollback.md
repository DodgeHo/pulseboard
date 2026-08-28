# Application Deployment And Rollback Runbook

PulseBoard rolls application containers by immutable image identity while keeping PostgreSQL on forward-only migrations. API, worker, migration, and static-site tasks use the same reviewed image. A rollback replaces application containers with the previous image; it does not restore a database backup or run down-migrations.

This runbook is evidence for a small Docker Compose deployment. It is not a claim of zero-downtime releases, arbitrary historical binary compatibility, or a production recovery objective.

The release model is recorded in [`adr/0009-immutable-image-application-rollback.md`](adr/0009-immutable-image-application-rollback.md). The controlled old-client compatibility fixture is recorded separately in [`adr/0010-expand-contract-compatibility-fixture.md`](adr/0010-expand-contract-compatibility-fixture.md).

## Automated Rehearsal

Run from WSL or another Linux environment with Docker Compose and Bash:

```bash
corepack pnpm compose:rollback
```

The script builds two source-distinct compatibility fixtures. The baseline image replaces the current Prisma schema and uptime-check validation schema with checked-in pre-`0003` snapshots, removes migration `0003`, and generates an older Prisma Client. The candidate image uses the current schema, validation contract, and additive migration. Both images carry an OCI revision label plus an explicit PulseBoard contract label.

The isolated rehearsal:

1. Records SHA-256 fingerprints for the baseline and candidate compatibility sources.
2. Builds baseline and candidate images with different revision and contract labels, then proves their content-addressed image IDs differ.
3. Verifies that the baseline image contains migrations `0001` and `0002`, while the candidate image also contains `0003_expand_uptime_check_description`.
4. Starts project-scoped PostgreSQL and Redis services without publishing host ports.
5. Applies the baseline migration set, runs the real demo seed once, and starts API, worker, static PulseBoard assets, and Nginx from the baseline image.
6. Verifies `/demo/`, `/demo/docs`, `/demo/openapi.json`, both health endpoints, and an authenticated tenant flow that creates a workspace, project, service, uptime check, and audit event. The baseline response must not expose `description`.
7. Applies additive migration `0003`, deploys the candidate image, writes `UptimeCheck.description` through the real API, and verifies that the field is visible.
8. Recreates API, worker, and static assets from the baseline image without reversing `0003`. The old Prisma Client must still read and update the uptime check while omitting the unknown field.
9. Queries PostgreSQL directly to prove the candidate-written description remains stored after rollback and the baseline update changed only the old `expectedStatus` field.
10. Verifies the selected references and running content IDs for API and worker in every phase, plus unchanged PostgreSQL container and volume identity.
11. Removes only containers, volumes, networks, and images named for the unique rehearsal run.

Evidence is written under the ignored directory:

```text
.artifacts/application-rollback/<utc-timestamp>-<process-id>/
  baseline.json
  candidate.json
  rollback.json
  baseline-provenance.txt
  candidate-provenance.txt
  baseline-image-inspect.json
  candidate-image-inspect.json
  baseline-running-images.txt
  candidate-running-images.txt
  rollback-running-images.txt
  baseline-source.sha256
  candidate-source.sha256
  baseline-image-migrations.txt
  candidate-image-migrations.txt
  baseline-migrations.txt
  candidate-migrations.txt
  rollback-migrations.txt
  expanded-column.txt
  expanded-field-after-candidate.txt
  expanded-field-after-rollback.txt
  postgres-container-id.txt
  postgres-volume-name.txt
```

When Docker Hub or npm is unavailable, use explicit mirrors without editing tracked files:

```bash
NODE_IMAGE=public.ecr.aws/docker/library/node:22-bookworm-slim \
POSTGRES_IMAGE=public.ecr.aws/docker/library/postgres:16-alpine \
REDIS_IMAGE=public.ecr.aws/docker/library/redis:7-alpine \
NGINX_IMAGE=public.ecr.aws/docker/library/nginx:alpine \
NPM_REGISTRY=https://registry.npmmirror.com \
corepack pnpm compose:rollback
```

Do not describe the rehearsal as passed until the command has completed and cleanup checks have succeeded on the machine being discussed. A configured CI job is not evidence of a successful remote run.

The latest recorded local run completed on 2026-08-28. Its ignored evidence directory is `.artifacts/application-rollback/20260828T085805Z-437/`. The baseline image reported revision `baseline-local-437`, contract `baseline-v2`, and content ID `sha256:3ef65c150ae977046244a2db803249c37e164d8a2372a5ca59ec88e55b4310bc`. The candidate reported revision `candidate-local-437`, contract `candidate-v3`, and content ID `sha256:5db9ac0a40eacaf429b1db8e3c91181d9adfef174b3edeff673ff998a85a7fee`. Local images had no registry `RepoDigests`, so content IDs are the available immutable identity evidence.

In that run, migration history advanced from `0001`/`0002` to `0001`/`0002`/`0003` and remained there after application rollback. Uptime check `655d1bad-4b6b-4c34-aad2-7f981d570e4f` retained `Candidate v3 operator context retained across rollback.` in PostgreSQL while the rolled-back API omitted the field and successfully changed `expectedStatus` from `200` to `204`. PostgreSQL container `5e1f9dfaab4c3a44b6c34628e733d7c861252620db52731276cb65d5c0cb027f` and volume `pulseboard-rollback-local-437_postgres_data` remained fixed, and the script's project-scoped cleanup checks passed. This is local evidence only.

## Image Identity

Build once per reviewed commit and give the artifact an immutable registry tag or digest:

```bash
revision="$(git rev-parse HEAD)"
image="registry.example.com/pulseboard:git-$revision"

docker build \
  --build-arg "PULSEBOARD_BUILD_REVISION=$revision" \
  --build-arg "PULSEBOARD_BUILD_CONTRACT=current" \
  --tag "$image" \
  .
docker push "$image"
```

Record the image digest after push. A mutable label such as `latest` is not an acceptable rollback reference. `GET /health/live` exposes the build revision and compatibility contract so operators can verify what is serving traffic without exposing secrets.

The production Compose example accepts:

- `PULSEBOARD_IMAGE`: the reviewed image tag or digest used by migrate, API, worker, and public-site tasks.
- `PULSEBOARD_BUILD_REVISION`: the commit or release identity embedded when Compose builds locally.
- `PULSEBOARD_BUILD_CONTRACT`: the reviewed application/schema compatibility contract embedded when Compose builds locally.

## Candidate Deployment

Before changing application containers:

- Record the current image digest and `/health/live` release.
- Confirm a recent PostgreSQL backup has passed an isolated restore rehearsal.
- Review migrations for backward compatibility with the previous application image.
- Prefer expand-contract changes: add compatible schema first, deploy compatible code, backfill, and remove old schema only in a later release.
- Pause when a candidate contains destructive or incompatible migrations. Application rollback alone is not a safe recovery plan for those changes.

On the host, pull the exact candidate and run forward migrations before replacing application containers:

```bash
export PULSEBOARD_IMAGE="registry.example.com/pulseboard@sha256:<candidate-digest>"

docker compose -f docker-compose.production.example.yml pull migrate api worker public-site
docker compose -f docker-compose.production.example.yml run --rm migrate
docker compose -f docker-compose.production.example.yml up -d --no-build --force-recreate api worker
docker compose -f docker-compose.production.example.yml run --rm public-site
```

Reload or restart Nginx only when its configuration changed. Then verify the release marker, readiness, public route contract, authenticated reads, logs, queue depth, failed checks, and notification failures.

The seed is intentionally not part of every migration. On a brand-new demo environment only, run it explicitly:

```bash
docker compose -f docker-compose.production.example.yml run --rm migrate pnpm db:seed
```

## Application Rollback

When application behavior regresses but PostgreSQL remains healthy and the previous image is compatible with the current schema:

```bash
export PULSEBOARD_IMAGE="registry.example.com/pulseboard@sha256:<previous-known-good-digest>"

docker compose -f docker-compose.production.example.yml pull api worker public-site
docker compose -f docker-compose.production.example.yml up -d --no-build --force-recreate api worker
docker compose -f docker-compose.production.example.yml run --rm public-site
```

Do not run reverse migrations as part of this procedure. If the previous application cannot operate against the current schema, stop the rollback and deploy a forward-compatible fix. Restore PostgreSQL only for a separate data-recovery incident after writes are stopped and the backup has passed the isolated restore checks in [postgresql-backup-restore.md](postgresql-backup-restore.md).

## Acceptance And Evidence

Record, without secrets:

- candidate and previous image digests, or content-addressed local image IDs when no registry digest exists;
- reported build revision and compatibility contract before deployment, after deployment, and after rollback;
- completed Prisma migration names;
- PostgreSQL container or managed-database identity;
- route and authenticated sentinel checks;
- operator, timestamps, reason, and observed failure;
- logs and metric snapshots used to accept or reject the release.

The local rehearsal proves one narrow expand-contract case: a checked-in pre-`0003` Prisma/validation contract can run before and after a nullable additive column, while candidate-written data remains durable through application rollback. It does not prove that every old binary can run against every future schema, that destructive migrations are rollback-compatible, that static-file replacement is atomic on a real host, that in-flight requests experience no interruption, that images are signed or registry-attested, or that remote CI and the public Tencent deployment have run this procedure.
