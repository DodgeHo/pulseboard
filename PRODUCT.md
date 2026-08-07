# Anlan Project Portal

## Product Summary

`anlan.store` is a public index of deployed engineering work. It is not a generic personal landing page and it is not part of PulseBoard. The root route helps a recruiter, hiring manager, or engineering peer understand what is live, what each project demonstrates, and where to inspect it.

PulseBoard remains a complete project, but its public surface moves under `/demo/` so the domain root can represent the wider portfolio.

## Audience

- Overseas recruiters and hiring managers scanning for credible deployed work.
- Backend, platform, cloud, and full-stack interviewers who want inspectable evidence.
- Peers reviewing implementation quality, operational posture, and product judgment.

## Primary User Jobs

1. Identify the strongest project within a few seconds.
2. Open a live project without guessing its route.
3. Distinguish systems work from study tools.
4. Inspect PulseBoard's live UI, API contract, health probes, and customer-facing view.
5. Understand that the projects are real deployments rather than static mockups.

## Public Route Contract

| Route | Purpose |
| --- | --- |
| `/` | Anlan project portal |
| `/demo/` | PulseBoard Live Ops Console |
| `/demo/frontend/` | PulseBoard customer-facing product surface |
| `/demo/docs` | PulseBoard Scalar API reference |
| `/demo/openapi.json` | PulseBoard public OpenAPI document |
| `/demo/health/live` | PulseBoard liveness probe |
| `/demo/health/ready` | PulseBoard readiness probe |
| `/demo/api/v1/*` | PulseBoard authenticated API |
| `/jobs/` | Career Radar invite-only job discovery and inbox service |
| `/saa/` | SAA certification practice bank |
| `/sap/` | SAP certification practice bank |
| `/ispm/` | ISPM certification practice bank |

The API process may keep its internal `/v1/*`, `/docs`, and `/health/*` routes. Nginx owns the public namespace and rewrites requests to the internal service.

## Project Inventory

### PulseBoard

A production-shaped reliability SaaS portfolio project with a Hono API, PostgreSQL, Redis, BullMQ workers, API-key boundaries, OpenAPI documentation, health probes, operational documentation, and a staged deployment workflow.

### Career Radar

An invite-only, multi-user job discovery and inbox service deployed at `/jobs/`. Its Nginx reverse-proxy route is an existing cross-project dependency and must be preserved by every portal or PulseBoard deployment.

### Certification Practice Banks

Three deployed Flutter web entry points share a focused question-bank experience while loading a different active bank:

- SAA Practice
- SAP Practice
- ISPM Practice

The portal must describe these honestly as study tools. It must not invent usage metrics, completion rates, customers, or certifications.

## Product Principles

- Evidence before adjectives.
- Live routes before marketing copy.
- Specific project roles before generic skill lists.
- Compact, scannable information before long biography text.
- Honest deployment state before fake availability claims.
- A project can be polished without pretending to be a commercial company.

## Success Criteria

- The root route is visibly `ANLAN.STORE`, not PulseBoard.
- All five project entries are available in the first usable project index.
- PulseBoard is fully reachable under `/demo/` with no accidental dependency on root paths.
- Existing `/jobs/`, `/saa/`, `/sap/`, and `/ispm/` routes continue to work.
- The portal uses real PulseBoard captures as visual evidence.
- Desktop and mobile layouts do not overlap, clip long route labels, or hide primary actions.
- Build artifacts and Nginx configuration are reproducible from source.
- Automated verification covers the portal, PulseBoard subpaths, protected API behavior, and legacy root-path retirement.

## Non-Goals

- Creating cloud resources, DNS records, certificates, or credentials.
- Publishing personal contact details that are not already approved for the public site.
- Rebuilding the Flutter study applications.
- Turning the project portal into a blog, CMS, or social profile.
- Claiming that the live deployment is updated before it has been deployed and verified.

## Constraints

- Preserve unrelated work already present in the repository.
- Keep generated deployment artifacts committed and verifiable.
- Do not embed secrets, private IPs, tokens, or cloud credentials in public files.
- Keep the public portal usable without a JavaScript framework or external CDN dependency.
- Keep cards at or below an 8px radius and avoid nested card layouts, decorative gradients, and one-color visual systems.
