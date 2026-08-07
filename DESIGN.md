---
name: "ANLAN.STORE"
description: "A multilingual signal directory for deployed systems and public engineering work."
colors:
  midnight: "#060817"
  midnight-raised: "#090d20"
  signal-ink: "#f4f8ff"
  signal-muted: "#9cb3cf"
  signal-faint: "#456182"
  signal-rule: "#173b63"
  signal-rule-strong: "#2874b0"
  cyan: "#17d6ff"
  cobalt: "#3380ff"
  violet: "#8a55ff"
  electric-orange: "#ff8f1f"
  hot-amber: "#ffbd4a"
typography:
  display:
    fontFamily: "Anlan Inter, Segoe UI, sans-serif"
    fontSize: "clamp(58px, 7vw, 116px)"
    fontWeight: 600
    lineHeight: 0.86
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Anlan Inter, Segoe UI, sans-serif"
    fontSize: "clamp(20px, 2.25vw, 34px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Anlan Inter, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Cascadia Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.045em"
spacing:
  compact: "10px"
  control: "16px"
  panel: "26px"
  desktop-gutter: "72px"
components:
  signal-action:
    backgroundColor: "transparent"
    textColor: "{colors.cyan}"
    height: "49px"
    padding: "11px 16px"
    typography: "{typography.label}"
  signal-action-primary:
    backgroundColor: "transparent"
    textColor: "{colors.hot-amber}"
    height: "49px"
    padding: "11px 16px"
    typography: "{typography.label}"
  locale-selected:
    backgroundColor: "{colors.electric-orange}"
    textColor: "#120a01"
    height: "40px"
    typography: "{typography.label}"
---

# Design System: ANLAN.STORE

## Overview

**Creative North Star: "Signal Lattice / Project Scope."**

ANLAN.STORE is a colorful technical directory, not a conventional portfolio or product dashboard. The approved Signal Lattice **composition C** puts a numbered project directory rail at left, a large central statement, and a live signal scope at right. The resulting scan order makes deployment proof, public repositories, and a clearly named personal profile immediately actionable.

Midnight is the use scene. Cobalt, violet, cyan, and electric orange act as signal-family identifiers across rails, routes, status, and actions; they are not generic neon decoration. The page is a ruled instrument: thin dividers, labeled measurements, waveforms, and repository paths provide the visual structure. Canvas adds atmosphere and movement, while HTML holds all facts, controls, headings, links, and route state.

**Key Characteristics:**

- A square-cornered, dense directory with a left rail and horizontal project evidence rows.
- Colorful live-signal geometry over a near-black technical field.
- English is the deterministic first-visit language; Traditional Chinese, Simplified Chinese, and Japanese are explicit, complete alternatives.
- External personal and GitHub destinations are named as such instead of being represented as unlabeled social icons.

## Colors

The palette uses a deep midnight base and four high-energy signal families, restrained by cool text and structural blue rules.

### Primary

- **Signal Cyan:** Primary interactive and online-state signal. Use it for the default signal action, active availability confirmation, and primary technical labels.
- **Cobalt Carrier:** The structural blue used for signal-family markers and stronger rules.

### Secondary

- **Ultraviolet Channel:** Selected filters and the VMD project family use violet to differentiate a coherent secondary stream.
- **Electric Orange:** Use for priority actions, live markers, and the selected locale; it must retain its semantics as an attention signal.
- **Hot Amber:** A bright orange-adjacent foreground for the primary live-work action and warning-adjacent state text.

### Neutral

- **Midnight / Raised Midnight:** The base and raised surfaces establish the operating context.
- **Signal Ink / Muted / Faint:** High-contrast reading text, secondary explanations, and technical metadata form a deliberate reading hierarchy.
- **Signal Rule / Strong Rule:** Blue linework divides the instrument without introducing card shadows.

### Named Rules

**The Signal-Family Rule.** Assign one accent family to a project, control state, or measured signal; do not scatter all accent colors within a single component merely for visual noise.

**The Midnight Rule.** The base remains dark and calm so cyan, cobalt, violet, and orange communicate information rather than becoming a full-screen glow effect.

## Typography

**Display Font:** Self-hosted `Anlan Inter` (regular and semibold WOFF assets), with `Segoe UI` and sans-serif fallbacks.

**Body Font:** Self-hosted `Anlan Inter` with the same fallback stack.

**Label/Mono Font:** `Cascadia Mono`, `SFMono-Regular`, `Consolas`, monospace.

**Character:** Inter makes multilingual interface copy and compressed project titles clear. The mono stack gives routes, tags, states, and controls an instrument-readout character without turning prose into terminal text.

### Hierarchy

- **Display:** The central two-line opening claim is an exceptionally large, tightly tracked, compact-line-height Inter statement. Reserve this scale for the portal's identity.
- **Title:** Project names use a responsive Inter title scale and compact line height, so rows retain a dense directory rhythm.
- **Body:** Explanations are readable Inter copy with a generous line height; hero copy is bounded while project descriptions have a broad but finite reading measure.
- **Label:** Small, bold, slightly tracked mono labels identify controls, routes, project categories, statuses, and the footer. They may be uppercase when the translated label is Latin-script, but must remain legible in all four languages.

### Named Rules

**The Evidence-First Type Rule.** Large type states the portal's purpose once; the rest of the page gives project facts, routes, technologies, and actions enough room to be scanned.

## Layout

The shell is a bordered, centered surface with a wide desktop ceiling of `1540px` and side borders. Desktop composition C is a two-column frame: a `262px` project rail beside the main area. Within the main area, the first viewport divides the title/copy field from a live signal scope; the project index continues beneath the scope, aligned to the main column rather than becoming a separate card grid.

Project rows are horizontal evidence records: ordinal, name, explanatory copy, technical data, and one action. PulseBoard alone expands into an image-evidence switcher because it has two real interface captures. The header keeps the explicit `Lang He · LinkedIn profile` entry beside the language control; its destination is exactly `https://www.linkedin.com/in/lang-he-a94655120/` and it opens as an external profile.

At `1120px`, the signal scope moves below the introductory copy while the directory rail narrows. At `820px`, the page becomes one column, the project rail becomes a compact grid, and records reflow to keep copy and actions readable. At `510px`, the profile label and locale selector each get their own row, primary hero actions become full width, the rail becomes two columns, and filter controls may scroll only within their own rail. The responsive contract is no page-level horizontal overflow at 360px, 768px, 1280px, and 1440px.

## Elevation & Depth

This is a flat, layered system: borders, translucent midnight surfaces, and density create depth. There are no container drop shadows. The only glow-like treatment is reserved for small live-status and scope-dot signals; it communicates activity, not elevation. The decorative background canvas stays behind a solidly readable portal shell.

### Named Rules

**The Ruled-Field Rule.** Use one-pixel technical rules and tonal layering to separate information; do not replace the directory structure with floating cards or large soft shadows.

## Shapes

The form language is rectilinear and precise. Controls, locale segments, tags, image frames, rail entries, and project rows use square corners and one-pixel borders. Accent bars, thin linework, small square status marks, and waveform geometry supply the recurring visual silhouette. Primary controls meet the intended touch target height, and visible focus uses an offset amber outline rather than a subtle color-only state.

## Components

### Navigation

- **Top bar:** Brand, project-frequency descriptor, explicit personal-profile link, and four-language switcher share a ruled header. The LinkedIn icon is accompanied by the translated `Lang He · LinkedIn profile` label and external mark, so it cannot be read as a generic social link.
- **Project rail:** Numbered links use a project-family color bar and stronger active inset rule. It is a scan/navigation instrument, not a nested card set.
- **Locale selector:** Four explicit buttons (`EN`, `繁中`, `简中`, `日本語`) use `aria-pressed`. English is selected on a first visit; only an explicit selection is saved to `anlan.portal.locale`, and the document `lang` changes with the selection.

### Buttons

- **Signal actions:** Rectangular icon-plus-label actions use mono labels, 49px minimum height, technical borders, and a short color/background transition. The live-work variant takes priority with the orange/amber signal family; the source action remains cyan-led.
- **Row actions:** Each project exposes one concise route or external-repository action. Source actions include an external arrow and use `target="_blank"` with `rel="noreferrer"`.
- **Filter segments:** Compact mono controls expose `All`, `Live`, `Source`, and `Study` through `aria-pressed`; violet identifies the active filter.

### Project Records

- **Structure:** Nine ordered records split into deployed/live, study, and source categories. A live record gets an asynchronous same-origin route status; source entries intentionally do not receive a route-health probe.
- **Live route inventory:** PulseBoard (`/demo/`, with `/demo/docs` evidence/docs link), Career Radar (`/jobs/`), SAA Practice (`/saa/`), SAP Practice (`/sap/`), and ISPM Practice (`/ispm/`).
- **Source inventory:** `VMD_cpp`, `PAL4 translation` / `PAL4_EnglishMod`, `IELTS writing GPT` / `IELTS_writing_GPT`, and `Dynamic RRT Connect` / `dynamic_rrt_connect`, each linking directly to its `DodgeHo` GitHub repository.
- **Evidence mode:** PulseBoard’s semantic image controls switch between Live Ops and customer-surface captures with `aria-pressed`; the image frame never substitutes for the underlying project information.

### Signal Scopes

- **Foreground scope:** A grid-backed waveform canvas shows orange reference axes, cyan live waveform, and a moving white sample point alongside semantic scope readouts.
- **Background lattice:** A fixed decorative canvas draws cyan and violet bands plus cobalt/orange barcode marks. It is `aria-hidden`; the semantic directory contains the actual content.
- **Motion:** Both canvases render a static frame when `prefers-reduced-motion: reduce` is active. In the normal mode their changes are subtle, continuous signal movement rather than entrance spectacle.

## Do's and Don'ts

### Do:

- **Do** use the approved Project Scope composition C: directory rail, central claim, and live signal scope before the project record index.
- **Do** keep the page colorful within the midnight/cobalt/violet/cyan/electric-orange signal system, and use color to identify a project family or state.
- **Do** keep all visible content semantic and translated in English, Traditional Chinese, Simplified Chinese, and Japanese; start in English without browser-locale inference.
- **Do** preserve explicit destinations and inventory: the named Lang He LinkedIn profile, five existing live routes, and the four named DodgeHo GitHub projects.
- **Do** honor keyboard focus, `aria-pressed` state, real route status text, and reduced-motion preferences.

### Don't:

- **Don't** revert to the former light publishing-grid palette, rounded portfolio cards, or generic SaaS dashboard treatment.
- **Don't** use a bare LinkedIn glyph or an unlabeled external icon where the profile relationship must be clear.
- **Don't** make canvas the only source of a route, project, status, or language state.
- **Don't** infer a visitor's language from the browser, or probe external GitHub repositories as though they were deployed routes.
