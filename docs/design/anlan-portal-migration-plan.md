# Anlan Portal and PulseBoard Subpath Migration Plan

## Objective

Replace the PulseBoard root homepage at `https://anlan.store/` with a project portal and publish the full PulseBoard public surface under `https://anlan.store/demo/` without breaking the existing SAA, SAP, or ISPM study routes.

## Phase 1: Baseline and Contracts

- Record product intent in `PRODUCT.md`.
- Record visual and interaction rules in `DESIGN.md`.
- Preserve the current PulseBoard visual-refresh work already present in the dirty worktree.
- Establish the public route contract before changing code.
- Treat the API process routes as internal implementation details and Nginx routes as the public contract.

Exit criteria:

- The project inventory and route map are explicit.
- Existing uncommitted work has been inspected rather than reverted.

## Phase 2: Separate Build Units

- Add `apps/portal` as a dependency-free static application.
- Build the portal to `deploy/anlan/index.html`.
- Change the PulseBoard web build to generate:
  - `deploy/anlan/demo/index.html`
  - `deploy/anlan/demo/frontend/index.html`
- Keep application-local build output in `apps/*/dist` for previews.
- Add root scripts that can build and verify the complete public surface.

Exit criteria:

- Portal and PulseBoard builds no longer overwrite one another.
- Generated artifacts are deterministic and committed.

## Phase 3: Portal Experience

- Implement the `ANLAN.STORE` project directory.
- Include PulseBoard, SAA, SAP, and ISPM as launchable entries.
- Use real PulseBoard screenshots as visual evidence.
- Add working `All`, `Systems`, and `Study` filters.
- Add same-origin availability checks with readable loading, online, and unavailable states.
- Keep the first screen focused on project selection rather than marketing copy.

Exit criteria:

- Every project can be opened from the root page.
- The page works with and without successful availability probes.
- Desktop and mobile screenshots pass visual review.

## Phase 4: PulseBoard Base-Path Support

- Make the Live Ops Console resolve all links and probes through `/demo`.
- Update the customer-facing view to link to `/demo/`, `/demo/docs`, and `/demo/openapi.json`.
- Update displayed route labels so the UI describes the public deployment accurately.
- Configure Scalar to fetch `/demo/openapi.json`.
- Publish an OpenAPI document whose server and paths describe `/demo/health/*` and `/demo/api/v1/*` correctly while leaving internal Hono routes unchanged.

Exit criteria:

- No PulseBoard page depends on `/docs`, `/openapi.json`, `/health/*`, `/frontend/`, or `/v1/*` at the domain root.
- API unit and integration behavior remains unchanged internally.

## Phase 5: Nginx Routing

- Serve the portal at `/`.
- Redirect `/demo` to `/demo/`.
- Serve PulseBoard static artifacts from `/demo/` and `/demo/frontend/`.
- Proxy and rewrite:
  - `/demo/docs` to `/docs`
  - `/demo/openapi.json` to `/openapi.json`
  - `/demo/health/*` to `/health/*`
  - `/demo/api/v1/*` to `/v1/*`
- Preserve the existing aliases for `/saa/`, `/sap/`, and `/ispm/`.
- Preserve retired root PulseBoard paths as explicit `301` compatibility redirects into `/demo/`, while keeping the application itself mounted only under the new route contract.

Exit criteria:

- `nginx -t` passes on the target host before reload.
- Static and proxied route precedence is unambiguous.

## Phase 6: Automation and Documentation

- Update artifact verification for the new output locations.
- Add portal artifact verification.
- Update public-surface verification for the root portal and `/demo/*` routes.
- Update CI to build and diff all generated artifacts.
- Update the Tencent deployment workflow to back up and install the portal and `/demo/` artifacts atomically.
- Update the deployment runbook with upload, backup, install, Nginx test, reload, verification, and rollback steps.
- Update README route references that describe the public deployment.

Exit criteria:

- Local build, verification, typecheck, and tests pass.
- Deployment instructions do not require guesswork.
- Rollback restores both root portal and PulseBoard subpath files.

## Phase 7: Visual and Route QA

- Start a local static preview that mirrors the public route structure.
- Verify 360px, 768px, 1280px, and 1440px layouts.
- Confirm screenshot pixels are nonblank and primary content is framed correctly.
- Verify filters, launch links, language controls, and PulseBoard probe behavior.
- Run live verification only after deployment.

Exit criteria:

- No overlap, clipping, blank assets, console errors, or broken internal links.
- Portal and PulseBoard are both usable by keyboard.

## Phase 8: Deployment and Completion Audit

- Build the complete public artifact set.
- Back up current root, PulseBoard files, and Nginx configuration.
- Install the new artifacts.
- Run `nginx -t` before reloading Nginx.
- Run automated public verification.
- Manually inspect the live root, `/demo/`, `/demo/frontend/`, and all study routes.
- Record any work that remains outside the repository.

The task is complete only when the live domain reflects the route contract and the rendered result has been verified. A locally complete implementation is not the same as a completed live migration.
