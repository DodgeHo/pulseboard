# ANLAN.STORE Full Engineering Archive Implementation Plan - 2026-09-24

## Current Code Structure Check

- Repository root: `F:\Jobs overseas\pulseboard`. No deeper `AGENTS.md` exists under this project, so the workspace-level `F:\Jobs overseas\AGENTS.md` applies.
- Impeccable context was loaded for `apps/portal/src/index.html`; the current visual system is the established colorful Signal Lattice / Composition C portal, with `/hire/` as a separate editorial exception.
- Current modified files before this round of edits: `apps/portal/content/project-overrides.mjs`, `apps/portal/scripts/build.mjs`, and `apps/portal/scripts/lib/catalog.mjs`. These already contain partial work for TapPhysics, PuzzleWear, CWC, DevEnglish, VMD family data, private repository flags, and homepage ordering. I will preserve and extend these changes rather than overwrite them.
- The project inventory is sourced from `apps/portal/content/github-inventory.json`, not a root-level `content/github-inventory.json`. It currently records 70 repositories, 57 public, 13 private, 21 forks, and 49 originals.
- The generated portal is built from `apps/portal/scripts/build.mjs`, `apps/portal/src/index.html`, `apps/portal/src/main.js`, `apps/portal/src/styles.css`, `apps/portal/src/archive.js`, and `apps/portal/src/archive.css`. Archive/case copy lives in `apps/portal/content/site-copy.mjs` and project/case metadata lives in `apps/portal/content/project-overrides.mjs`.

## Data Model Modifications

- Keep `privateRepository` separate from `closedSource` in catalog records.
- Preserve GitHub-private repository behavior: private inventory entries must not receive GitHub URL, clone URL, API URL, default branch, README, file, commit, or internal implementation details in generated artifacts.
- Preserve closed-source live/project records as approved public portfolio records. PuzzleWear and DevEnglish may have live external URLs; CWC and ISPM must not gain fake GitHub links.
- Add/verify localized labels for closed-source status, private repository status, open project, case study, homepage, repository, and VMD family outcomes.
- Keep all 70 GitHub repositories in `/projects/` exactly once. Add only closed-source live/project records as non-GitHub archive records, without duplicating matching repository records.

## Homepage Modifications

- Render homepage projects in the required order: HeatStack, TapPhysics, Career Radar, PuzzleWear, CWC, PulseBoard, SAA Practice, SAP Practice, ISPM Practice, PAL4 translation, IELTS writing GPT, Dynamic RRT Connect, VMD, CEEMDAN, DevEnglish.
- Replace the old fixed “Ten project signals” copy with copy that matches the 15-item curated homepage.
- Render only one VMD homepage row. That row must say it is a VMD project family / one decomposition project with three implementation outcomes, and list `VMD_cpp`, `VMD_2D_python`, and `VMD_2D_cpp` with their own GitHub links.
- Ensure homepage actions place “Open project” before “View case study”. PAL4 must place “Open homepage” before “Open repository”. VMD must not collapse to one generic repository button.
- Ensure closed-source status is visible on CWC, PuzzleWear, DevEnglish, and ISPM.

## Complete Project Archive Modifications

- Keep `/projects/` searchable, filterable, sortable, and scaled to the 70-repository inventory.
- Verify the three VMD core repositories each appear once with their own public GitHub links.
- Keep `VMD_2D_CPP_OpenCV` as a separate archive-only record, not a homepage VMD family outcome.
- Ensure private GitHub rows show locked/private status without URLs.
- Ensure closed-source live rows show closed-source status without private-GitHub lock copy unless they are actual private GitHub repositories.

## Four-Language Modifications

- Update English, Traditional Chinese, Simplified Chinese, and Japanese homepage copy and archive labels.
- Preserve language routes `/`, `/zh-hant/`, `/zh-hans/`, `/ja/` and hash aliases `/#en`, `/#zh`, `/#zh-hans`, `/#zh-hant`, `/#ja`.
- Show `粤ICP备2026035259号-1` only on Simplified Chinese pages, not English, Traditional Chinese, or Japanese pages.

## Closed-Source And Private-Project Safety Boundary

- CWC gets only a static, security-reviewed public explanation of project purpose, engineering boundary, role category, constraints, and why no source is public.
- CWC must not expose customers, employers, accounts, internal domains, data structures, private APIs, proprietary algorithms, credentials, private repository links, or unconfirmed usage/business/performance claims.
- PuzzleWear and DevEnglish may link to their public project sites only.
- ISPM remains closed-source/unlinked from the homepage public route.

## Responsive And Accessibility Checks

- Preserve the existing colorful Composition C direction; do not add gradient blobs, bokeh, decorative orbs, fake screenshots, or a marketing hero rewrite.
- Check 1440px, 768px, and 360px viewports for homepage first screen, project list, VMD family row, PAL4 dual actions, closed-source labels, top LinkedIn/GitHub controls, footer/ICP behavior, horizontal overflow, button truncation, focus visibility, reduced motion, and readable contrast.
- Keep controls keyboard-operable with visible focus and semantic labels.

## Build, Test, Scan, Browser Verification, And Deployment Steps

- Run `corepack pnpm build:portal`.
- Run `corepack pnpm verify:portal`.
- Run `corepack pnpm verify:public:local` after checking how the local verifier is expected to serve or target artifacts.
- Run `node --check apps/portal/src/main.js`.
- Run `git diff --check`.
- Run `node C:\Users\asdsa\.agents\skills\impeccable\scripts\detect.mjs --json apps/portal/src/index.html apps/portal/src/main.js apps/portal/src/styles.css apps/portal/src/archive.css apps/portal/src/archive.js`.
- Start a local static preview for browser verification and inspect the required routes and locales using Playwright or an equivalent browser automation path.
- Consider deployment only after all local checks pass and only if an existing configured deployment command is available without new credentials, resources, DNS, database, or irreversible external changes.

## Risks, Unconfirmed Facts, And Rollback

- TapPhysics, PuzzleWear, CWC, DevEnglish, and ISPM public descriptions must remain conservative because no new external fact verification or private historical CWC material is authorized in this task.
- `verify:public:local` may depend on the existing preview process and may fail if a local service is not running; if so, use the project’s preview command and document the exact result.
- Existing partial modifications may already encode user intent. I will build on them, not revert them.
- Rollback path is non-destructive: inspect `git diff`, then revert only my own added hunks with a targeted patch if needed. Do not use `git reset --hard` or `git checkout --`.
