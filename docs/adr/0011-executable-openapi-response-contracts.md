# ADR 0011: Representative Executable OpenAPI Response Contracts

- Status: Accepted
- Date: 2026-08-28

## Context

PulseBoard served `/demo/openapi.json` and Scalar documentation, but most operations described responses only in prose. Route tests could pass while the public document silently drifted from the JSON returned by the real Hono application. Maintaining a second handwritten validator would create another contract that could drift independently.

The project needs a small, credible gate that proves important public and authenticated responses without turning this portfolio-scale modular monolith into a schema-generation project or claiming complete OpenAPI conformance.

## Decision

- Keep `apps/api/src/openapi.ts` as the single exported OpenAPI document used by `/demo/openapi.json` and Scalar.
- Define reusable JSON response schemas for representative health, authentication, workspace, uptime-check, incident, notification-attempt, and error payloads.
- Use `additionalProperties: false` on represented API resources so undocumented fields fail the contract test as clearly as missing required fields.
- Register the full exported document with Ajv and compile validators through local OpenAPI response references. The test does not duplicate resource shapes in a second validation layer.
- Call the real Hono application and validate liveness, readiness, the shared `401` response, workspace lists, uptime-check create/list/detail responses, and incident list/detail responses.
- Run public cases in the normal test suite and authenticated database-backed cases in the PostgreSQL/Redis integration suite. Make both gates explicit in CI step names.
- Keep `/metrics` outside the public OpenAPI document because it is a loopback/internal operator endpoint rather than part of the `/demo` API contract.

## Consequences

- A represented response that adds, removes, renames, or changes a field now fails before deployment when the implementation and OpenAPI document disagree.
- Nullable database fields and nested notification-attempt payloads are exercised through real handlers instead of static schema snapshots.
- The public route contract remains unchanged; this decision strengthens documentation and tests rather than adding a new runtime dependency.
- Ajv and `ajv-formats` are test-only dependencies. Runtime request validation remains in the existing Zod schemas and Hono handlers.
- Coverage is representative, not complete. Request bodies and many endpoint responses remain description-only and are not enforced by this gate.

## Rejected Alternatives

- **Maintain separate handwritten response schemas in tests:** duplicates the OpenAPI shapes and can pass while the published document is wrong.
- **Generate the full OpenAPI document from runtime validators in this slice:** potentially useful, but a broad refactor with more migration risk than the current contract gap justifies.
- **Claim complete conformance after covering a few endpoints:** misleading because request bodies, parameters, content types, and many response statuses are still not executable.
- **Publish `/metrics` as part of the public document:** conflicts with its intentionally internal, low-cost operator role.

## Verification

[`../../apps/api/test/openapi-contract.test.ts`](../../apps/api/test/openapi-contract.test.ts) resolves and compiles schemas from [`../../apps/api/src/openapi.ts`](../../apps/api/src/openapi.ts), calls the Hono application, and contains a negative proof that an incomplete liveness payload is rejected. The normal suite covers dependency-free public and authentication cases; the integration suite covers real PostgreSQL/Redis-backed workspace, uptime-check, and incident responses.

This does not prove that every OpenAPI operation is complete, that request bodies match the document, or that the currently deployed public host is running this change.
