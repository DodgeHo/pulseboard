# ADR 0003: Tenant Isolation And API Key Storage

- Status: Accepted
- Date: 2026-08-28

## Context

PulseBoard exposes user-authenticated API routes over workspace-owned data. A resource id is untrusted input: a valid API key must not authorize reads or writes merely because the caller can guess another tenant's workspace, project, service, uptime check, incident, notification, or API key id.

API keys are bearer credentials. Storing plaintext keys would turn a database read into immediate account access, while weak or silently defaulted hash configuration would make the storage claim misleading. The project needs a credible boundary without adding OAuth, a separate identity service, or PostgreSQL row-level security before the application model requires them.

## Decision

### 1. Authorize through workspace membership

An API key resolves to one `User`. Workspace access is granted only through `WorkspaceMember`. Queries for nested resources join back through their project and workspace membership, and API-key administration is limited by `ApiKey.userId`.

Detail and mutation routes return the same `404` for a nonexistent resource and a resource outside the authenticated user's membership. Nested collection routes authorize the parent before listing children. Audit-log and usage-metric collection queries keep membership in the database predicate; an explicit foreign `workspaceId` produces an empty collection rather than foreign data.

The PostgreSQL integration suite creates two complete tenants and exercises cross-tenant reads, creates, updates, deletes, notification replay, webhook ingestion, API-key revocation, and history filters. It then reads the foreign rows directly to prove denied operations had no side effects.

### 2. Generate high-entropy bearer keys and store only a digest

New API keys contain 24 random bytes encoded as base64url and prefixed with `pb_`. The create response returns plaintext once. The database stores only a display prefix and a SHA-256 digest over the secret global salt and key, plus ownership and lifecycle timestamps.

SHA-256 is not a password hashing function, but these keys are machine-generated with high entropy rather than chosen by humans. A deliberately slow password KDF would add request cost without addressing the primary risks as effectively as sufficient key entropy, secret configuration, transport security, log hygiene, and revocation.

### 3. Fail closed on production hash configuration

Local and test environments may use `local-development-only` for reproducibility. When `NODE_ENV=production`, PulseBoard rejects a missing salt, that local fallback, or a salt shorter than 32 characters. The API checks before binding its port, and the production migration/seed service uses the same shared hashing implementation and validation.

## Consequences

- A leaked database does not directly disclose bearer tokens, although an attacker with both the database and runtime salt can test candidate keys.
- Foreign and nonexistent ids have consistent resource responses, reducing ownership disclosure.
- Tenant isolation remains an application invariant. PostgreSQL row-level security is not enabled, so reviews and integration tests must cover each new query path.
- A global salt change invalidates all stored key hashes. It must be preserved across normal deploys and treated as a deliberate credential migration.
- Revocation is immediate on the next authentication query, but existing in-flight requests are not cancelled.

## Remaining Boundaries

PulseBoard does not currently implement API key expiry, per-key salts, rotation lineage, scoped permissions, a grace period, or two-salt migration. Keys authenticate users who may belong to multiple workspaces rather than being workspace-scoped credentials. Rate limiting is also user-scoped today, so two keys owned by one user share a write budget.

These limits are acceptable for the current portfolio scope, but they must remain explicit in architecture and interview discussions.

## Verification

`packages/core/test/api-key.test.ts` verifies local fallback behavior, production rejection of missing/default/short salts, accepted production configuration, and deterministic hashing. `apps/api/test/app.test.ts` verifies API key creation/revocation and the PostgreSQL-backed two-tenant authorization matrix. `docker-compose.production.example.yml` runs the API and migration/seed path in production mode so configuration validation is exercised in the deployment shape.
