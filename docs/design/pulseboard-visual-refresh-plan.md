> Public routing note (2026-08-07): the visual refresh remains the PulseBoard design source, but its public output now lives under `/demo/`; the root path is the ANLAN.STORE project portal.

# PulseBoard Visual Refresh Plan

## Skill Synthesis

This plan combines three design lenses:

- `frontend-design`: shape the site around real user intent, workflow clarity, responsive behavior, and production-grade UI controls rather than decorative marketing panels.
- `design-taste-frontend`: remove common AI-site tells such as purple-blue gradients, glass cards, oversized round surfaces, generic SaaS hero copy, and fake screenshots.
- `impeccable`: make the redesign opinionated, concrete, and memorable by defining a specific product read, visual system, and implementation path before touching source code.

The result should feel like a credible cloud/backend engineering portfolio that happens to be public, not a landing-page template with backend words pasted into it.

## Design Read

PulseBoard is a backend/platform/cloud portfolio project for technical recruiters, hiring managers, and engineering interviewers. The strongest story is not visual spectacle. It is proof: a real API, live health probes, deployment constraints, Redis/Postgres/BullMQ infrastructure, operational documentation, and a staged path toward production-like rehearsal.

The site should read as a restrained reliability command center: calm, technical, inspectable, and evidence-rich.

Design dials:

- `DESIGN_VARIANCE: 6` - distinctive enough to be remembered, still conservative enough for backend/platform credibility.
- `MOTION_INTENSITY: 4` - small stateful transitions, no theatrical animation that fights the operational tone.
- `VISUAL_DENSITY: 6` - dense enough to show real system detail, with disciplined spacing and clear scan paths.

## Current State Audit

Source of truth files:

- `apps/web/src/main.ts`
- `apps/web/src/styles.css`
- `apps/web/src/frontend.html`
- `apps/web/scripts/verify-artifact.mjs`
- `deploy/anlan/demo/index.html`
- `deploy/anlan/demo/frontend/index.html`
- `docs/deployment/anlan-public-site.md`

What works today:

- The homepage already has meaningful backend proof through `/health/live`, `/health/ready`, and `/openapi.json` probes.
- The generated artifact flow is explicit: source lives under `apps/web/src`, build output lives under `deploy/anlan`.
- The `/frontend/` route has a broader customer-facing story and multilingual behavior.
- The verification script protects important strings, routes, and artifact expectations.

What should be retired:

- Dark cyan/purple glow as the dominant brand signal.
- Glassy panels and generic rounded SaaS cards.
- Gradient text as a primary emphasis device.
- Numbered section markers such as `01`, `02`, `03` as decorative structure.
- Fake dashboard blocks that do not communicate real backend behavior.
- Overreliance on Inter as the whole personality of the interface.

Preservation constraints:

- Keep the public root route at `/`.
- Keep `/frontend/` available.
- Keep live backend probes visible and useful.
- Preserve language behavior on `/frontend/`.
- Edit source files first, then regenerate `deploy/anlan/*` with `pnpm build:web`.
- Update `apps/web/scripts/verify-artifact.mjs` only when assertions intentionally change.
- Do not write real secrets, IPs, keys, cloud credentials, or deployment-only values into the site.

## Visual Direction: Reliability Desk

Core feeling: an engineering lead's deployment desk after a successful staging rehearsal. The page should feel current, quiet, and controlled. Visitors should immediately understand that this is a real backend system with inspectable operational surfaces.

Palette direction:

- Base: graphite, ink, green-gray, and warm off-white.
- Success: operational green for live/ready states.
- Caution: amber for planned, gated, or rehearsal-only items.
- System accent: restrained blue for links, API references, and interactive affordances.
- Failure: muted red used only for actual error states.
- Avoid: purple dominance, blue-purple gradients, beige-only warmth, decorative bokeh, and neon glow.

Token sketch:

```css
:root {
  --pb-bg: #f4f1ea;
  --pb-surface: #fffdf8;
  --pb-ink: #19201d;
  --pb-muted: #64706a;
  --pb-rule: #d8d2c5;
  --pb-panel: #ece7dc;
  --pb-green: #26734d;
  --pb-green-soft: #dceadd;
  --pb-amber: #9a6a18;
  --pb-amber-soft: #f2e4c2;
  --pb-blue: #255f85;
  --pb-red: #9b3f36;
  --pb-radius-sm: 4px;
  --pb-radius-md: 8px;
  --pb-shadow-line: 0 1px 0 rgba(25, 32, 29, 0.08);
}
```

Typography direction:

- Use a humanist sans for interface copy and headings, such as `Aptos`, `Segoe UI`, or a similar system-native stack.
- Use a technical mono only for timestamps, endpoint paths, command snippets, request IDs, and health probe output.
- Avoid giant marketing headlines inside operational panels.
- Keep letter spacing at `0`.

Shape and layout:

- Use ruled sections, evidence rails, compact tables, status strips, and terminal-like readouts.
- Keep radii between `4px` and `8px` unless a component has a real reason to differ.
- Avoid nested cards. Sections should be full-width bands or unframed content blocks.
- Prefer strong alignment, fixed dimensions for status tiles, and predictable responsive grids.

Motion:

- One modest page-load sequence is enough.
- Health states may transition subtly when probes resolve.
- Architecture diagrams can reveal connections on scroll, but should remain readable without motion.
- Respect `prefers-reduced-motion`.

## Proposed Homepage Structure

Top navigation:

- Left: `PulseBoard` wordmark with a small status dot.
- Center or right: `System`, `Evidence`, `Architecture`, `Deployment`, `Customer view`.
- Primary action: `Open API Spec` or `View /frontend/`, depending on the final page hierarchy.

Hero: Live Backend Portfolio:

- H1 should be literal and direct, for example `PulseBoard Backend Portfolio` or `Cloud-native SaaS Backend Demo`.
- Support copy should explain the value proposition: production-shaped SaaS backend, queues, Redis/Postgres, health checks, staging rehearsal, and operational docs.
- Include a live probe console with `/health/live`, `/health/ready`, and `/openapi.json` rows.
- The hero should show the actual system signal in the first viewport. No fake product screenshot is needed.

Evidence Rail:

- Show compact proof points: `PostgreSQL`, `Redis + BullMQ`, `API Edge`, `Worker`, `OpenAPI`, `Docker Compose`, `Tencent staging rehearsal`.
- Each proof point should have one line of real context, not vague claims.
- Include timestamps or last-check states when available.

Architecture Section:

- Replace decorative 3D theatrics with a precise service map: browser, API, Postgres, Redis, worker, job queue, deployment boundary.
- Use labels that match the codebase and docs.
- Keep the diagram readable on mobile by switching to stacked rows.

Incident Lifecycle Section:

- Show the intended backend/platform story: event intake, queueing, worker processing, incident open, incident resolve, audit trail.
- Use a compact timeline or state machine, not a marketing carousel.

Deployment Boundary Section:

- Make the safety posture visible: no secrets in repo, no cloud resource creation without explicit authorization, staging checklist before real host work.
- Link to deployment docs where appropriate.
- Distinguish completed, local-only, staging-ready, and future work states.

Footer:

- Keep it quiet and useful: repository context, deployment route, docs links, and last generated artifact note.

## Proposed `/frontend/` Direction

The `/frontend/` page can remain more customer-facing than the root backend portfolio, but it should still look credible and specific.

Keep:

- Multilingual behavior.
- `Backend proof` link back to `/`.
- The software factory metaphor if it remains useful for non-technical visitors.
- Commercial sections that explain value clearly.

Change:

- Reduce glow, gradients, and numbered decorative markers.
- Replace generic "production lines" styling with sharper operational visuals: intake queue, build line, review gate, release ledger.
- Use smaller, denser content blocks with visible hierarchy.
- Make language controls feel like product UI, not decorative pills.
- Keep Arabic and Chinese layouts visually tested after changes.

## Visual Assets

Use real or generated evidence assets only when they reveal something about the system:

- Screenshot or rendered excerpt of the OpenAPI surface.
- Architecture image generated from the actual service map.
- Live probe capture from the deployed route.
- Sanitized demo-flow transcript showing a request moving through the backend.
- Small command/log readouts with fake-free, non-sensitive values.

Avoid:

- Stock cloud photos.
- Fake dashboard rectangles.
- Fake customer logos.
- Purple-blue atmospheric backgrounds.
- Blurred screenshots that hide the thing being claimed.

## Implementation Plan

Phase A: root homepage visual system

- Redesign `apps/web/src/main.ts` and `apps/web/src/styles.css` around the Reliability Desk direction.
- Preserve existing live probe behavior.
- Replace dark glow style with the new restrained operational palette.
- Regenerate `deploy/anlan/demo/index.html` with `pnpm build:web`.
- Run `pnpm verify:web` and update assertions only for intentional content changes.

Phase B: `/frontend/` polish

- Update `apps/web/src/frontend.html` to match the same design discipline while keeping a more customer-facing tone.
- Preserve multilingual strings and route behavior.
- Remove gradient text, decorative section numbering, and dark-glow dominance.
- Regenerate `deploy/anlan/demo/frontend/index.html`.

Phase C: public deployment refresh

- Run `pnpm build:web`.
- Run `pnpm verify:web`.
- Review `git diff --check`.
- Deploy only after source and generated artifacts are both reviewed.
- Verify [anlan.store](https://anlan.store/) and `/frontend/` in desktop and mobile widths.

## Pre-Flight Design Checklist

- The first viewport clearly says PulseBoard and shows real backend proof.
- No dominant purple-blue gradient or dark-glow visual identity remains.
- No nested cards or oversized decorative cards dominate the layout.
- Text fits on mobile and desktop without overlap.
- Live probe states are legible in success, loading, and failure conditions.
- Architecture labels match the actual backend components.
- `/frontend/` language controls still work.
- Generated files in `deploy/anlan/*` match source changes.
- `pnpm build:web` passes.
- `pnpm verify:web` passes.
- `git diff --check` passes.

## Recommended Next Build Prompt

```text
Please implement Phase A from docs/design/pulseboard-visual-refresh-plan.md. Redesign the `/demo/` PulseBoard homepage as a Reliability Desk command-center portfolio surface. Edit source files under apps/web/src first, regenerate deploy/anlan/demo/index.html with pnpm build:web, and update verify-artifact.mjs only when assertions intentionally need to change. Preserve all public routes, live backend probes, language behavior, and deployment gates. Run pnpm build:web and pnpm verify:web before reporting back.
```