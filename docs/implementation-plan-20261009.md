# ANLAN.STORE Project Display Update Plan - 2026-10-09

## Initial Inspection

- Applicable root guidance is `F:\Jobs overseas\AGENTS.md`; no deeper `AGENTS.md` was found under `F:\Jobs overseas\pulseboard`.
- Impeccable context was loaded for `apps/portal/src/main.js`. The current surface is the ANLAN.STORE Signal Lattice / Composition C portal, with four portal locales: English, Traditional Chinese, Simplified Chinese, and Japanese.
- Current git status before implementation contains unrelated untracked/generated items only: `deploy/anlan/.workbuddy/` and `output/`. These must not be deleted, reset, or folded into this task unless they become an intentional generated artifact.
- The portal data pipeline currently combines `apps/portal/content/github-inventory.json`, explicit live project records in `apps/portal/content/project-overrides.mjs`, and homepage ordering in `apps/portal/scripts/build.mjs`. `apps/portal/src/main.js` owns locale UI copy, homepage rail keywords, and localized short descriptions.
- The current GitHub inventory snapshot has 70 repositories and does not contain `BiliDownTrans`. GitHub CLI confirms `DodgeHo/BiliDownTrans` is public, forked, Python-based, updated on 2026-10-09, and described publicly as a BiliBili download plus GPU subtitle transcription pipeline based on Bili23 Downloader and faster-whisper.
- PulseBoard ten-language evidence is in `apps/web/src/i18n.ts` and `apps/web/test/i18n.test.ts`; the actual locale order is `en`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ar`, `zh-CN`.
- CWC material exists outside the portal at `D:\CWC`, including the user-specified PDF `D:\CWC\Screenshots20260608\CellLoc Web Controller (CWC) 软件说明书.pdf`, five screenshots in the same folder, and current source files under `D:\CWC\frontend` and `D:\CWC\backend`. CWC remains closed source; only reviewed, redacted static public material may be copied into the portal.
- Resume candidates are numerous. The latest general English resume evidence appears to include `output\Lang_HE_Resume_20260916.pdf` and related 2026 resume outputs; project technology claims will be cross-checked against project code and local materials, with conservative wording if conflicts remain.
- Existing scripts are `corepack pnpm build:portal`, `corepack pnpm verify:portal`, `node scripts/preview-public-surface.mjs --verify` via `corepack pnpm verify:public:local`, `node scripts/verify-public-surface.mjs`, and syntax checks with `node --check`.

## Implementation Steps

1. Update the repository inventory for `BiliDownTrans` without duplicating an existing record. If the authenticated sync can run safely, use the existing sync script; otherwise add a conservative public inventory record based on GitHub CLI evidence and keep counts internally consistent.
2. Add `BiliDownTrans` to homepage ordering immediately after `IELTS writing GPT`, with four-language name, summary, rail keywords, source action, archive row, and detail page support through the existing catalog model.
3. Add small project media support to the homepage and archive:
   - Prefer local static assets copied from public repositories or existing project assets.
   - Use small title-adjacent icons only; keep Composition C density and hierarchy.
   - Record image source metadata in a non-public or source comment/data structure.
   - Provide useful alt text for meaningful images and decorative handling for purely identifying marks.
   - Skip projects with no reliable public image rather than inventing screenshots or logos.
4. Revise PulseBoard copy toward an engineering template for ten-language foreign-trade SaaS scenarios:
   - Clearly distinguish implemented evidence from template direction and planned capability.
   - Cite the real locale order from `apps/web/src/i18n.ts`.
   - Retain verifiable Hono, PostgreSQL, Redis, BullMQ, API-key, OpenAPI, health probe, worker, and deployment verification boundaries only where the code supports them.
5. Revise PuzzleWear and DevEnglish four-language copy into two clear blocks:
   - Product/user experience purpose.
   - Actual technology and engineering direction, verified against latest resume evidence and local/project materials.
   - Keep closed-source boundaries and avoid metrics, customer claims, or unverified stack claims.
6. Revise TapPhysics four-language copy using project evidence:
   - Agent-assisted export flow control.
   - Rich-text handling.
   - Windows and macOS development.
   - Actual framework claims only after locating source or reliable local material.
7. Revise Career Radar four-language copy using `careerforge-autoapply` evidence:
   - Multi-agent or multi-worker flow only where code/services support it.
   - Scheduled timers/digests based on systemd timer/service files and project source.
   - Avoid production scale, success-rate, or user-count claims.
8. Build a simple CWC static case page in the existing case-study system:
   - Review PDF pages and screenshots visually/textually.
   - Copy only sanitized screenshots into `apps/portal/src/assets/`.
   - Redact real accounts, passwords, tokens, cookies, secrets, internal addresses, customers/company names, and real data. Device numbers may remain unless paired with other sensitive context.
   - Keep original CWC files untouched.
   - Add four-language CWC content with consistent meaning across `/projects/cwc/`, `/zh-hans/projects/cwc/`, `/zh-hant/projects/cwc/`, and `/ja/projects/cwc/`.
9. Update verification scripts for the new inventory count, homepage order, BiliDownTrans checks, project image checks, CWC page checks, and private/sensitive information scanning.
10. Run Impeccable-informed layout, type, adapt, harden, and polish passes while preserving the existing Signal Lattice world. Changes should be small, dense, and rectilinear, not a redesign.

## Visual and Accessibility Acceptance

- Homepage and archive image marks must be smaller than or comparable to nearby titles, with stable dimensions, no broken images, no layout shift, and no fake product visuals.
- Four-language long text must wrap naturally at 1440px, 768px, and 360px without horizontal overflow, button clipping, title/image collision, or card-like redesign.
- Keyboard focus must remain visible. Locale controls, filters, source links, and case-study actions must retain accessible names and touch-sized targets.
- Reduced-motion mode must still show static canvases and not rely on animation for content.
- Simplified Chinese pages keep `粤ICP备2026035259号-1`; English, Traditional Chinese, and Japanese pages do not show it.

## Verification Plan

- Syntax checks: `node --check` on modified JavaScript/MJS files.
- Build: `corepack pnpm build:portal`.
- Static verification: `corepack pnpm verify:portal`.
- Local public verification: `corepack pnpm verify:public:local`.
- Whitespace: `git diff --check`.
- Impeccable detector once after UI edits: `C:\Users\asdsa\.agents\skills\impeccable\scripts\impeccable.cmd detect --json <changed targets>`.
- Private/sensitive scan over generated public artifacts, including HTML, JSON, source maps, static image filenames/metadata where practical, alt text, and CWC copied assets.
- Browser QA across 1440px, 768px, and 360px for `/`, `/projects/`, `/zh-hans/`, `/zh-hans/projects/`, `/zh-hant/`, `/ja/`, four CWC detail pages, and key project rows including BiliDownTrans, PulseBoard, PuzzleWear, DevEnglish, TapPhysics, and Career Radar.

## Deployment Gate

- Deploy only after local build, verification, browser QA, and sensitive scan pass.
- Use only existing repository deployment workflow and existing credentials. Do not create cloud resources, DNS records, databases, secrets, or third-party accounts.
- If deployment needs new authorization or a missing secret, stop the external step, keep local implementation and verification evidence, and report the exact gap without printing credentials.
- After deployment, verify `https://anlan.store/`, `/projects/`, four-language home routes, four-language CWC pages, and release SHA/health endpoint so the live site is not an old cache or wrong directory.

## Risks, Assumptions, and Rollback

- GitHub network may be partially unavailable; GitHub CLI evidence is acceptable for public repo metadata if raw clone fails, but README/source facts should be fetched through `gh api` or another reliable public path before writing detailed claims.
- CWC screenshots/PDF may contain sensitive content. If redaction cannot be confidently verified, skip the asset and keep text-only conservative CWC content.
- Resume/project-material conflicts will be resolved by latest resume plus direct code evidence; unsupported technology claims will be omitted.
- Rollback is a normal git revert of this task's commits plus redeploy through the existing workflow. No user/unrelated untracked files should be removed as part of rollback.

## Continuation Plan - 2026-10-09 14:xx Asia/Taipei

- Reuse this existing same-purpose plan rather than replacing it; treat prior notes as hypotheses until verified against source, generated artifacts, public repositories, and local project evidence.
- Confirm the current source state before editing: `project-overrides.mjs`, `build.mjs`, `main.js`, archive/detail rendering, verification scripts, and generated `deploy/anlan` output already contain parts of earlier ANLAN.STORE work but do not yet satisfy the requested BiliDownTrans order, project title images, detailed CWC screenshot/PDF treatment, or updated verification gates.
- Implement data-model changes in the source content layer first:
  - Add a `BiliDownTrans` repository record if the inventory sync cannot safely add it.
  - Add four-language summaries, skills, evidence, and homepage placement immediately after IELTS writing GPT.
  - Add project media metadata that can be consumed by both homepage and archive/detail renderers without inventing visual assets.
- Implement a compact image pattern rather than a layout redesign:
  - Use stable, small, title-adjacent marks.
  - Copy only public or reviewed local assets into `apps/portal/src/assets/project-media/`.
  - Skip any project whose image source is not verifiable or safe.
- Rework copy in the authoritative content files:
  - PulseBoard as a ten-locale foreign-trade SaaS engineering template boundary, using `apps/web/src/i18n.ts` as the language evidence.
  - PuzzleWear and DevEnglish with two-block product/engineering language where evidence supports it.
  - TapPhysics and Career Radar with conservative Agent/scheduled-work boundaries verified from local code/materials.
  - CWC case page as a simple closed-source overview with safe screenshots only if visual inspection/redaction is reliable.
- Update tests/verifiers after implementation so failures identify missing BiliDownTrans, missing/suspicious project media, CWC route regressions, and private-info leakage.
- Run build, syntax checks, repository verifiers, Impeccable detector, sensitive scan, and browser checks at 1440px, 768px, and 360px before any deployment attempt.
