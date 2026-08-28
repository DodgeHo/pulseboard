# ADR 0010: Controlled Expand-Contract Compatibility Fixture

- Status: Accepted
- Date: 2026-08-28

## Context

ADR 0009 established forward-only migrations and immutable-image application rollback, but the first rehearsal built both image identities from the same application contract. That proved artifact selection and PostgreSQL preservation, not that an older generated Prisma Client could still operate after a candidate migration.

PulseBoard needs one reviewable compatibility case that is small enough to understand in an interview and strict enough to fail when the old and new contracts are accidentally collapsed. It must not pretend to be an archive of historical releases or a general guarantee that old binaries can run against arbitrary future schemas.

## Decision

- Add nullable `UptimeCheck.description` through migration `0003_expand_uptime_check_description`.
- Keep checked-in pre-`0003` Prisma and uptime-check validation fixtures under `scripts/rollback-rehearsal/baseline/`.
- Build the baseline image with those fixtures, remove migration `0003` from that image, and generate a Prisma Client that does not know the new field.
- Build the candidate image from the current schema, validation contract, and complete migration set.
- Label both images with `org.opencontainers.image.revision` and `io.pulseboard.build-contract`; expose both values through `GET /health/live`.
- Fingerprint the source inputs, inspect image labels and content-addressed image IDs, and verify the running API and worker use the selected image in each phase.
- Apply migrations only forward. Roll the application back to the baseline image without reversing `0003`.
- Require the rolled-back baseline API to read and update old fields while omitting the unknown `description` field. Verify directly in PostgreSQL that the candidate-written description remains stored.

## Consequences

- The repository proves one concrete expand-contract path across source-distinct application contracts and generated database clients.
- The compatibility fixture is intentionally narrow and auditable. A future schema change needs its own compatibility review rather than inheriting this result.
- Candidate data can remain durable while an older API temporarily omits a newly added nullable field.
- The baseline fixture is test infrastructure, not a supported release channel. It must change only when the rehearsal intentionally adopts a new compatibility baseline.
- Local images may have no registry `RepoDigests`. In that case, source fingerprints, OCI labels, content-addressed image IDs, and running image IDs are the available local provenance evidence.

## Rejected Alternatives

- **Use one source tree with different tags:** proves container replacement but not old-client/current-schema compatibility.
- **Check only migration SQL:** does not prove the old generated client and API can operate after the migration.
- **Automatically down-migrate during rollback:** risks destroying candidate-written data and conflicts with the forward-only release model.
- **Claim compatibility for all additive migrations:** nullable columns are usually compatible, but application queries, defaults, constraints, and generated clients still require review.
- **Add signing or registry attestation to the local fixture:** useful for a release pipeline, but not required to prove this application/schema behavior and not available without a registry publication step.

## Verification

[`../../Dockerfile.rollback-baseline`](../../Dockerfile.rollback-baseline), [`../../scripts/rollback-rehearsal/baseline`](../../scripts/rollback-rehearsal/baseline), [`../../scripts/local-compose-rollback-rehearsal.sh`](../../scripts/local-compose-rollback-rehearsal.sh), and [`../application-rollback.md`](../application-rollback.md) implement and document the decision.

The recorded 2026-08-28 local rehearsal verified distinct baseline/candidate content IDs, the expected migration contents, the old Prisma Client behavior after migration `0003`, retained candidate data, unchanged PostgreSQL identity, and project-scoped cleanup. It does not prove destructive migration compatibility, arbitrary historical release support, image signing, registry attestation, zero downtime, remote CI success, or deployment of this slice to the public host.
