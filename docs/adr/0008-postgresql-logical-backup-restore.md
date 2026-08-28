# ADR 0008: PostgreSQL Logical Backup And Isolated Restore

- Status: Accepted
- Date: 2026-08-28

## Context

PostgreSQL is PulseBoard's authoritative store. The production-like Compose configuration persists it in a named volume, but a volume alone is not a backup: accidental deletion, migration mistakes, host loss, or storage corruption can remove or invalidate it. Before this decision, the repository documented application and static-site rollback but had no executable evidence that database state could be exported, restored independently, and checked for integrity.

The project needs a recovery procedure that is inexpensive, inspectable in an interview, safe to run locally and in CI, and proportional to a single-host modular monolith. It must not pretend that a small deterministic rehearsal proves production RPO, RTO, or point-in-time recovery.

## Decision

PulseBoard uses PostgreSQL custom-format logical backups for the current deployment scope:

- `pg_dump -Fc --no-owner --no-privileges` creates a portable application-database archive.
- `pg_restore --list` checks that the archive is readable before recovery proceeds.
- `pg_restore --exit-on-error --no-owner --no-privileges` restores into an independent empty database.
- The rehearsal applies the real Prisma migrations and seed, loads deterministic reliability data, verifies business invariants, and compares source and restored fingerprints for every current application table and `_prisma_migrations`.
- A unique Compose project and separate source/restore volumes prevent the rehearsal from touching the normal development or production-like database volume.
- Rehearsal artifacts remain under ignored `.artifacts/` for local inspection and are excluded from Docker build context.
- CI has a separate bounded job so recovery evidence is not hidden inside unit tests.

The operational runbook requires a real backup to record its application commit and PostgreSQL major version, use restricted encrypted storage, and pass an isolated restore before destructive cutover. PostgreSQL is backed up; Redis is not, because Redis remains disposable queue and metric infrastructure rather than the source of truth.

## Consequences

- The repository can prove that the current schema and representative durable business state survive a logical dump and independent restore.
- The archive is less coupled to a Docker volume layout than a filesystem copy and supports inspection with PostgreSQL tooling.
- A logical restore may become too slow for a much larger database.
- The backup excludes cluster roles, tablespaces, host configuration, secrets, Redis state, and reverse-proxy files.
- Queue deliveries and operational metrics can be lost with Redis. Durable execution and notification dispatchers must republish work from PostgreSQL after recovery.
- The procedure provides no continuous backup or PITR. RPO is the age of the last successful retained dump, and production-sized RTO remains unmeasured.
- A custom-format archive is sensitive data. The local rehearsal artifact is intentionally unencrypted and must not be uploaded or confused with a production retention system.
- Backup and restore tools should match the PostgreSQL server major version. Version upgrades require a separate rehearsal.

## Rejected Alternatives

- **Treat the Docker named volume as the backup:** it does not protect against host loss, volume deletion, logical corruption, or migration mistakes and does not prove restore behavior.
- **Copy `/var/lib/postgresql/data` from a running container:** an uncoordinated filesystem copy can be inconsistent and is tied to server and version details.
- **Add physical base backups and WAL point-in-time recovery now:** this improves recovery precision but adds storage, retention, monitoring, and restore complexity without a stated data-loss objective or production dataset.
- **Back up Redis together with PostgreSQL:** Redis queue and metric state are intentionally non-authoritative; coupling recovery to an inconsistent Redis snapshot would weaken the simpler PostgreSQL recovery model.
- **Restore over the active database during tests:** destructive and unnecessary. Isolated restore is the required confidence gate.

## Verification

[`../../scripts/postgres-backup-restore-rehearsal.sh`](../../scripts/postgres-backup-restore-rehearsal.sh) and [`../../docker-compose.backup-rehearsal.yml`](../../docker-compose.backup-rehearsal.yml) implement the decision. The deterministic fixture and SQL checks live under [`../../scripts/postgres-backup-rehearsal`](../../scripts/postgres-backup-rehearsal).

The local rehearsal completed successfully on 2026-08-28: both invariant checks passed, the custom archive was readable, and source and restored manifests matched byte-for-byte. See [`../postgresql-backup-restore.md`](../postgresql-backup-restore.md) for production handling and the recovery checklist.
