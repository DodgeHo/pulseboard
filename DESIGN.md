---
name: "ANLAN.STORE"
description: "A four-language, colorful technical directory for Dodge Ho / 道安澜's public open-source work."
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
    minHeight: "49px"
    padding: "11px 16px"
    typography: "{typography.label}"
  signal-action-primary:
    backgroundColor: "transparent"
    textColor: "{colors.hot-amber}"
    minHeight: "49px"
    padding: "11px 16px"
    typography: "{typography.label}"
  locale-control:
    borderColor: "{colors.signal-rule}"
    minHeight: "44px"
    typography: "{typography.label}"
---

# Design System: ANLAN.STORE

## Overview

**Creative North Star: "Signal Lattice / Project Scope."**

ANLAN.STORE is Dodge Ho / 道安澜's public open-source project space. It is a colorful engineering directory—not a generic portfolio, a social profile, or a uniform dashboard. The opening introduces Dodge and frames the work as inspectable systems, signal work, and practical tools; the English opening is **“DODGE HO. BUILDS IN PUBLIC.”**

The approved Signal Lattice **composition C** has three functional readings on desktop: a numbered project directory rail on the left; Dodge's identity, introduction, facts, and actions in the central copy field; and a live signal scope at right. A project scope below uses intentionally unequal evidence records. Midnight is the use scene; cobalt, violet, cyan, and electric orange are signal-family identifiers, not generic neon decoration.

A fixed, decorative canvas adds colored waveform, sample, and barcode geometry. Canvas never contains essential information: all identity, locale, project, status, route, and repository information is semantic HTML.

## Colors

The palette uses a deep midnight base and four high-energy signal families, restrained by cool text and structural blue rules.

### Primary

- **Signal Cyan (`#17d6ff`):** primary technical interaction, online route state, and PulseBoard signal family.
- **Cobalt Carrier (`#3380ff`):** structural signal family, prominent rules, SAA, and IELTS.

### Secondary

- **Ultraviolet Channel (`#8a55ff`):** selected project-filter state, SAP, and VMD.
- **Electric Orange (`#ff8f1f`):** attention state, live marker, selected locale, Career Radar, PAL4, and the archived ISPM record.
- **Hot Amber (`#ffbd4a`):** the prioritized live-work action and highly visible focus outline.

### Neutral

- **Midnight / Raised Midnight:** `#060817` and `#090d20` provide the operating context and translucent layered surfaces.
- **Signal Ink / Muted / Faint:** `#f4f8ff`, `#9cb3cf`, and `#456182` establish readable title, body, and technical-metadata hierarchy.
- **Signal Rule / Strong Rule:** `#173b63` and `#2874b0` are one-pixel structural dividers rather than shadow-based elevation.

### Named Rules

**The Signal-Family Rule.** Give a project, route state, or control state one accent family. Do not distribute every accent through one component for visual noise.

**The Midnight Rule.** Keep the ground dark and calm so color conveys families, state, and direction instead of becoming a full-screen glow effect.

## Typography

**Display and body font:** self-hosted `Anlan Inter` regular and semibold WOFF assets, with `Segoe UI` and sans-serif fallbacks.

**Technical-label font:** `Cascadia Mono`, `SFMono-Regular`, `Consolas`, monospace.

Inter supports the four portal locales and compressed project names; the mono stack gives routes, technology tags, statuses, directory keywords, and controls an instrument-readout character without turning explanatory prose into terminal text.

### Hierarchy

- **Display:** A tightly tracked, compact-line-height identity statement carries the portal's purpose once. Every locale substitutes a localized personal introduction, not a machine-selected locale.
- **Title:** Project names use the responsive Inter title scale; the emphasized records are visibly larger than study and compact source records.
- **Body:** The personal introduction and project descriptions remain readable at a bounded measure.
- **Label:** Small, bold, slightly tracked mono text labels controls, routes, project categories, live states, directory technologies, and footer metadata. Latin labels may be uppercase; CJK labels remain legible in their native script.

### Named Rule

**The Evidence-First Type Rule.** The large type explains whose work this is; the remaining hierarchy gives real technologies, routes, repositories, and project evidence enough room to be scanned.

## Layout

The bordered, centered portal shell has a maximum width of `1540px`. On desktop, a `262px` project rail occupies the left side of a two-column scope layout. The adjacent first-viewport main area splits into an identity/copy field and live-scope field. The project index begins under the first viewport in the main column; it is not a disconnected card deck.

The directory is a numbered list of ten records. Each record exposes a concise technical-keyword rail, such as `Astro · AI Skills · Windows CLI` for HeatStack, `Hono · PostgreSQL · Redis` for PulseBoard, `invite-only · inbox · digests` for Career Radar, `AWS · questions · progress` for SAA, `C++ · Eigen · VMD` for VMD_cpp, `Python · localization · MIT` for PAL4, and `Python · robotics · RRT` for Dynamic RRT Connect.

The Project Scope is deliberately non-uniform on desktop: HeatStack leads as a full-width orange feature record; PulseBoard follows as the full-width evidence anchor with the largest evidence switcher; Career Radar spans seven of twelve columns; SAA spans five; SAP and ISPM each occupy compact three-column records; VMD is a six-column research record; PAL4 is five columns; IELTS is three; and Dynamic RRT Connect is four. This weighting favors PulseBoard, Career Radar, SAA, SAP, and VMD over the smaller archive and secondary source records.

At `1120px`, the rail reduces to `216px`, the identity copy precedes the live scope, and ordinary records resolve to two six-column tracks. At `820px` and below, the page’s semantic and visual order is: top bar, identity/live-scope main field, compact project-directory rail, then the project index. The rail becomes three columns and keeps all ten records visible at this width. At `510px` and below, the explicit profile link and locale selector each take a row, the rail becomes two columns and continues to show all ten records, hero actions stack full width, and project records resolve to a single readable column. The responsive contract is no page-level horizontal overflow at 360px, 768px, 1280px, or 1440px.

## Elevation & Depth

This is a flat, layered system. One-pixel borders, translucent midnight surfaces, and density establish depth; project records do not use floating card shadows. Small live-status and scope-dot signals may glow subtly to communicate activity, not elevation. The fixed background lattice remains behind an opaque, readable portal shell.

### Named Rule

**The Ruled-Field Rule.** Use technical linework and tonal layers to divide information. Do not replace the directory structure with soft, equal-size cards or oversized shadows.

## Shapes

The form language is rectilinear and precise. Controls, locale segments, tags, image frames, rail entries, and project records use square corners and one-pixel borders. Accent bars, technical rules, square status marks, and waveform geometry supply the recurring silhouette. Keyboard focus is a visible, offset hot-amber outline; primary actions and locale controls have a minimum height of at least 44px.

## Components

### Navigation and Identity

- **Top bar:** ANLAN.STORE brand, project-frequency descriptor, personal-profile link, and four-language switcher share one ruled header.
- **Personal profile entry:** The supplied LinkedIn URL is exactly `https://www.linkedin.com/in/lang-he-a94655120/`. Its English visible label is **“My LinkedIn profile”**; localizations preserve that first-person meaning. The authored LinkedIn icon and external mark support, but never replace, the explicit profile label. It opens as an external link using `target="_blank"` and `rel="noreferrer"`.
- **Locale selector:** Four explicit choices—English (`en`), Traditional Chinese (`zh-Hant`), Simplified Chinese (`zh-Hans`), and Japanese (`ja`)—are buttons with `aria-pressed`. English is the deterministic first-visit default. A locale is written to `anlan.portal.locale` only after an explicit choice, and `document.documentElement.lang` follows it; no browser-locale inference is used.
- **Japanese identity:** In Japanese, the identity fact explicitly renders Dodge as **`道安瀾（ドッジ・ホー）`**. The Japanese hero copy identifies this as Dodge's open-source project space.

### Project Directory and Scope

- **Directory rail:** The numbered, color-barred rail is a scan/navigation instrument with project-specific technology keywords. Linked records move to their matching Project Scope evidence entry rather than directly navigating away.
- **ISPM archive record:** ISPM Practice remains in the directory and Scope as a subdued, non-clickable root record with `ITSM · study · unlinked` keywords. It has no root-page route, status probe, or action. Its deployed `/ispm/` application remains part of the wider public route contract, but the owner does not promote or link to it from the root portal.
- **Project records:** The ten records are HeatStack / `AI 热栈`, PulseBoard, Career Radar, SAA Practice, SAP Practice, ISPM Practice, VMD_cpp, PAL4 translation / `PAL4_EnglishMod`, IELTS writing GPT / `IELTS_writing_GPT`, and Dynamic RRT Connect / `dynamic_rrt_connect`.
- **Live route records:** HeatStack uses `/heatstack/`; PulseBoard uses `/demo/` and additionally exposes `/demo/docs`; Career Radar uses `/jobs/`; SAA uses `/saa/`; SAP uses `/sap/`. These same-origin route records receive asynchronous availability labels.
- **Source records:** VMD_cpp, PAL4 translation, IELTS writing GPT, and Dynamic RRT Connect link directly to their respective `DodgeHo` GitHub repositories with an external action. They do not receive route-health probes.
- **PulseBoard evidence:** Only PulseBoard expands with semantic controls for its real Live Ops and customer-surface captures. The image preview supports the record; it never replaces the description, route, technical tags, or action.

### Actions and Filters

- **Hero actions:** Rectangular icon-plus-label actions lead to the Project Scope and the VMD source anchor. The live-work action uses hot amber; the source action is cyan-led.
- **Row actions:** Linked projects have one concise route or external-repository action. External actions include an arrow mark and use safe external-link attributes.
- **Filter segments:** `All`, `Live`, `Source`, and `Study` are mono controls with `aria-pressed`; violet marks the active filter.

### Signal Scopes

- **Foreground scope:** A grid-backed waveform canvas uses orange reference axes, a cyan live waveform, and a moving white sample point next to semantic readouts.
- **Background lattice:** The fixed `aria-hidden` canvas draws colored cyan/violet bands and cobalt/orange barcode marks behind the shell.
- **Motion:** Both canvases render a static frame under `prefers-reduced-motion: reduce`. Otherwise motion is a subtle, continuous signal change, not an entrance spectacle.

## Do's and Don'ts

### Do

- Use Project Scope composition C: left directory rail, Dodge’s central identity field, live signal scope, then varied project evidence.
- Keep the colorful midnight/cobalt/violet/cyan/electric-orange signal system and assign color purposefully.
- Introduce Dodge Ho / 道安澜 as the person behind this public open-source work in all four locales; use `道安瀾（ドッジ・ホー）` in Japanese identity copy.
- Keep **My LinkedIn profile** explicit, first-person, and visually accompanied by a LinkedIn mark rather than presenting it as a generic social destination.
- Retain technical-keyword rails and non-uniform project weight: HeatStack first, PulseBoard as the evidence anchor, Career Radar/SAA/SAP/VMD prominent, ISPM subdued and unlinked.
- Keep semantic route and repository information, `aria-pressed` controls, visible focus, live route status, and reduced-motion behavior.

### Don't

- Revert to the former light publishing grid, rounded portfolio cards, or an equal-size dashboard grid.
- Use a bare LinkedIn glyph, a non-first-person profile label, or an unlabeled external icon for the personal profile.
- Add a root-page link or action for ISPM, even though `/ispm/` remains deployed.
- Make canvas the sole source of identity, project, status, route, or language state.
- Infer a visitor’s language from the browser or probe external GitHub repositories as deployed routes.
