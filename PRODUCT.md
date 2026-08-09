# Anlan Project Portal

## Product Summary

`anlan.store` is Dodge Ho / 道安澜's public open-source project space. It is a concise personal engineering index, not a generic personal landing page and not part of PulseBoard. The root route helps a recruiter, hiring manager, or engineering peer understand who built the work, what is live, what each project demonstrates, and where to inspect it.

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
| `/heatstack/` | HeatStack bilingual AI engineering learning hub |
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

## Portal Language Contract

The project portal supports four complete interface locales:

- English (`en`) — the deterministic default for every first-time visitor.
- Traditional Chinese (`zh-Hant`).
- Simplified Chinese (`zh-Hans`).
- Japanese (`ja`).

Locale selection is visible, keyboard-operable, persisted only after an explicit visitor choice, and updates the document language. The portal must not infer a first-visit locale from browser preferences, IP location, or route.

Shareable language hashes provide deterministic deep links: `/#en`, `/#zh-hant`, `/#zh-hans`, and `/#ja`. The shorter `/#zh` alias resolves to Simplified Chinese. A recognized language hash overrides a stored preference for that visit without persisting a new preference; unrelated hashes such as `#project-heatstack` keep their existing anchor behavior.

## Project Inventory

### HeatStack

A bilingual AI engineering learning hub deployed at `/heatstack/`. It connects daily AI Skill trends, safer local installation, Windows CLI workflows, structured practice, portfolio projects, and interview preparation. It is the first project in the portal directory and Project Scope.

### PulseBoard

A production-shaped reliability SaaS portfolio project with a Hono API, PostgreSQL, Redis, BullMQ workers, API-key boundaries, OpenAPI documentation, health probes, operational documentation, and a staged deployment workflow.

### Career Radar

An invite-only, multi-user job discovery and inbox service deployed at `/jobs/`. Its Nginx reverse-proxy route is an existing cross-project dependency and must be preserved by every portal or PulseBoard deployment.

### Featured GitHub Projects

The portal also links to public source repositories that are not deployed under `anlan.store`. These entries must be marked as external GitHub projects rather than as online application routes:

- [`VMD_cpp`](https://github.com/DodgeHo/VMD_cpp): a C++/Eigen implementation of Variational Mode Decomposition.
- [`PAL4_EnglishMod`](https://github.com/DodgeHo/PAL4_EnglishMod): an English-localization project for *Sword and Fairy 4*.
- [`IELTS_writing_GPT`](https://github.com/DodgeHo/IELTS_writing_GPT): a GPT-assisted IELTS writing evaluation and improvement tool.
- [`dynamic_rrt_connect`](https://github.com/DodgeHo/dynamic_rrt_connect): a Python implementation of bidirectional dynamic obstacle avoidance.

### Personal Profile Entry

The portal header includes one clearly labeled outbound entry to the supplied [LinkedIn profile](https://www.linkedin.com/in/lang-he-a94655120/). Its English visible label is **My LinkedIn profile**; localized variants retain the same first-person meaning. It uses the recognizable LinkedIn mark as an icon, but never relies on the glyph alone or presents itself as a generic social link. It opens as an external destination with safe link attributes.

### Certification Practice Banks

Three deployed Flutter web entry points share a focused question-bank experience while loading a different active bank:

- SAA Practice
- SAP Practice
- ISPM Practice

The portal must describe these honestly as study tools. It must not invent usage metrics, completion rates, customers, or certifications.

The existing `/ispm/` route remains deployed and covered by public-route verification, but the root portal does **not** expose a clickable ISPM route or action. It may appear only as an unlinked archived study record so the public index does not advertise an entry the owner no longer wants to promote.

## Product Principles

- Evidence before adjectives.
- Live routes before marketing copy.
- Specific project roles before generic skill lists.
- Compact, scannable information before long biography text.
- Honest deployment state before fake availability claims.
- A project can be polished without pretending to be a commercial company.

## Success Criteria

- The root route is visibly `ANLAN.STORE`, not PulseBoard.
- The root page introduces Dodge Ho / 道安澜 and frames the work as a public open-source project space in every locale.
- HeatStack, PulseBoard, Career Radar, SAA, SAP, and the four featured GitHub projects are findable from the root page; the deployed ISPM route remains unlinked by owner choice.
- The header offers a clearly named, keyboard-accessible **My LinkedIn profile** link using the supplied public URL.
- First-time visitors see English; each of the four locale choices translates all portal UI, project descriptions, filters, controls, and availability messages.
- PulseBoard is fully reachable under `/demo/` with no accidental dependency on root paths.
- Existing `/heatstack/`, `/jobs/`, `/saa/`, `/sap/`, and `/ispm/` routes continue to work.
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
- Do not use browser-locale detection as a substitute for the English-first language contract.
