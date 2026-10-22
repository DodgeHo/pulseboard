---
name: "ANLAN.STORE"
description: "A four-language, illustrated ink-landscape directory for Dodge Ho / 道安澜's public engineering work."
colors:
  mist-paper: "#e9e8f0"
  raised-paper: "#f7f5f8"
  ink: "#27283d"
  muted-ink: "#55566d"
  faint-ink: "#68657c"
  contour-rule: "rgba(60, 69, 106, .24)"
  mineral-teal: "#2b7883"
  mountain-cobalt: "#46618f"
  violet-ink: "#80568e"
  cinnabar: "#be5367"
  deep-cinnabar: "#9f3e58"
typography:
  display:
    fontFamily: "Noto Serif CJK SC, Songti SC, Yu Mincho, Georgia, serif"
    fontSize: "clamp(52px, 4.5vw, 70px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "0"
  title:
    fontFamily: "Noto Serif CJK SC, Songti SC, Yu Mincho, Georgia, serif"
    fontSize: "clamp(20px, 2.25vw, 34px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0"
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
    textColor: "{colors.mineral-teal}"
    minHeight: "49px"
    padding: "11px 16px"
    typography: "{typography.label}"
  signal-action-primary:
    backgroundColor: "transparent"
    textColor: "{colors.deep-cinnabar}"
    minHeight: "49px"
    padding: "11px 16px"
    typography: "{typography.label}"
  locale-control:
    borderColor: "{colors.contour-rule}"
    minHeight: "44px"
    typography: "{typography.label}"
---

# Design System: ANLAN.STORE

## Overview

**Creative North Star: "Ink Landscape / Project Scroll."**

ANLAN.STORE is Dodge Ho / 道安澜's public engineering portfolio. It is an illustrated ink-landscape scroll—not a generic portfolio, a social profile, or a uniform dashboard. Mountain washes and contour strokes establish cultural character; the opening still introduces Dodge and frames the work as inspectable systems, signal work, and practical tools.

The former Signal Lattice palette and composition are retired from the portal and archive. The shared page language uses mist-blue paper, plum ink, mineral teal, violet mountain layers, and a restrained cinnabar accent. Project records remain unequal in visual weight and ordered for recruiter scanning; the visual art supports rather than replaces project evidence.

A fixed, deterministic Canvas scene paints authored ridge paths, translucent pigment layers, contour marks, and a mist band. It is decorative only: all identity, locale, project, status, route, and repository information remains semantic HTML. Motion is limited to a low-amplitude opacity breath and becomes fully static under reduced-motion preferences.

## Colors

The palette uses a cool mist-paper ground with layered ink and pigment roles.

### Primary

- **Mineral Teal (`#2b7883`):** primary technical interaction and live-route state.
- **Mountain Cobalt (`#46618f`):** structural hierarchy and secondary project identity.

### Secondary

- **Violet Ink (`#80568e`):** selected filters, research identity, and distant pigment layers.
- **Cinnabar (`#be5367`):** restrained attention accent, live marker, and warm mountain wash.
- **Deep Cinnabar (`#9f3e58`):** visible keyboard focus and high-priority emphasis.

### Neutral

- **Mist / Raised Paper:** `#e9e8f0` and `#f7f5f8` establish the page ground and readable surfaces.
- **Ink / Muted / Faint:** `#27283d`, `#55566d`, and `#68657c` establish title, body, and metadata hierarchy.
- **Contour Rule:** a low-opacity blue-violet rule separates records without turning the archive into a card grid.

### Named Rules

**The Signal-Family Rule.** Give a project, route state, or control state one accent family. Do not distribute every accent through one component for visual noise.

**The Landscape Rule.** Keep pigment behind the evidence and preserve clear paper-toned reading surfaces wherever recruiters scan copy or controls.

## Typography

**Display font:** a CJK-capable Song-style serif stack, with system serif fallback. It lends the name and project titles an editorial, brush-adjacent character without simulating calligraphy.

**Body font:** self-hosted `Anlan Inter` regular and semibold WOFF assets, with CJK sans-serif and system fallbacks for localized text.

**Technical-label font:** `Cascadia Mono`, `SFMono-Regular`, `Consolas`, monospace.

Inter supports the four portal locales and compressed project names; the mono stack gives routes, technology tags, statuses, directory keywords, and controls an instrument-readout character without turning explanatory prose into terminal text.

Recognized language hashes (`#en`, `#zh-hant`, `#zh-hans`, and `#ja`) provide shareable locale entry points, with `#zh` as a Simplified Chinese alias. They override stored preference for the current visit without interfering with project anchors.

### Hierarchy

- **Display:** A large CJK-capable serif gives titles a literary landscape voice; compact display scale preserves the portal's purpose and project scanability in every locale.
- **Title:** Project names use the responsive Inter title scale; the emphasized records are visibly larger than study and compact source records.
- **Body:** The personal introduction and project descriptions remain readable at a bounded measure.
- **Label:** Small, bold, slightly tracked mono text labels controls, routes, project categories, live states, directory technologies, and footer metadata. Latin labels may be uppercase; CJK labels remain legible in their native script.

### Named Rule

**The Evidence-First Type Rule.** The large type explains whose work this is; the remaining hierarchy gives real technologies, routes, repositories, and project evidence enough room to be scanned.

## Layout

The bordered, centered portal shell has a maximum width of `1540px`. On desktop, a `262px` project rail occupies the left side of a two-column scope layout. The adjacent first-viewport main area splits into an identity/copy field and live-scope field. The project index begins under the first viewport in the main column; it is not a disconnected card deck.

The directory is a numbered list of ten records. Each record exposes a concise technical-keyword rail, such as `Astro · AI Skills · Windows CLI` for HeatStack, `Hono · PostgreSQL · Redis` for PulseBoard, `invite-only · inbox · digests` for Career Radar, `AWS · questions · progress` for SAA, `C++ · Eigen · VMD` for VMD_cpp, `Python · localization · MIT` for PAL4, and `Python · robotics · RRT` for Dynamic RRT Connect.

The Project Scope is deliberately non-uniform on desktop: HeatStack leads as a full-width cinnabar feature record; PulseBoard follows as the full-width evidence anchor with the largest evidence switcher; Career Radar spans seven of twelve columns; SAA spans five; SAP and ISPM each occupy compact three-column records; VMD is a six-column research record; PAL4 is five columns; IELTS is three; and Dynamic RRT Connect is four. This weighting favors the strongest evidence over smaller archive and secondary source records.

At `1120px`, the rail reduces to `216px`, the identity copy precedes the live scope, and ordinary records resolve to two six-column tracks. At `820px` and below, the page’s semantic and visual order is: top bar, identity/live-scope main field, compact project-directory rail, then the project index. The rail becomes three columns and keeps all ten records visible at this width. At `510px` and below, the explicit profile link and locale selector each take a row, the rail becomes two columns and continues to show all ten records, hero actions stack full width, and project records resolve to a single readable column. The responsive contract is no page-level horizontal overflow at 360px, 768px, 1280px, or 1440px.

## Elevation & Depth

This is a flat, layered system. Contour rules, translucent paper surfaces, and pigment layers establish depth; project records do not use floating card shadows. Small live-status marks communicate state without glow. The fixed ink landscape remains behind readable semantic content.

### Named Rule

**The Ruled-Field Rule.** Use technical linework and tonal layers to divide information. Do not replace the directory structure with soft, equal-size cards or oversized shadows.

## Shapes

The form language pairs precise rectilinear controls with organic painted terrain. Controls, locale segments, tags, image frames, rail entries, and project records use square corners and one-pixel contour rules. Ink ridges and sparse linework supply the landscape silhouette. Keyboard focus is a visible, offset deep-cinnabar outline; primary actions and locale controls have a minimum height of at least 44px.

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

- **Hero actions:** Rectangular icon-plus-label actions lead to the Project Scope and the VMD source anchor. Cinnabar prioritizes live work; mineral teal marks source browsing.
- **Row actions:** Linked projects have one concise route or external-repository action. External actions include an arrow mark and use safe external-link attributes.
- **Filter segments:** `All`, `Live`, `Source`, and `Study` are mono controls with `aria-pressed`; violet ink marks the active filter.

### Ink Landscape

- **Background scene:** A fixed decorative canvas uses authored ridge paths, translucent pigment layers, contour marks, and a mist band behind translucent paper reading surfaces.
- **Project evidence:** The live waveform remains a compact evidence display; its line and reference marks use mineral teal and cinnabar rather than the retired neon palette.
- **Motion:** The landscape is deterministic and repaints only on resize. A restrained opacity breath is disabled under reduced-motion preferences.

## Do's and Don'ts

### Do

- Use a continuous ink-landscape field across the home, archive, and project-detail pages; retain the recruiter-oriented project hierarchy and varied evidence records.
- Keep mist paper, plum ink, mineral teal, violet, and cinnabar roles purposeful and legible.
- Introduce Dodge Ho / 道安澜 as the person behind this public open-source work in all four locales; use `道安瀾（ドッジ・ホー）` in Japanese identity copy.
- Keep **My LinkedIn profile** explicit, first-person, and visually accompanied by a LinkedIn mark rather than presenting it as a generic social destination.
- Retain technical-keyword rails and non-uniform project weight: HeatStack first, PulseBoard as the evidence anchor, Career Radar/SAA/SAP/VMD prominent, ISPM subdued and unlinked.
- Keep semantic route and repository information, `aria-pressed` controls, visible focus, live route status, and reduced-motion behavior.

### Don't

- Restore the former dark Signal Lattice visual world on the portal or archive.
- Let landscape artwork obscure project names, statuses, controls, or reading contrast.
- Use a bare LinkedIn glyph, a non-first-person profile label, or an unlabeled external icon for the personal profile.
- Add a root-page link or action for ISPM, even though `/ispm/` remains deployed.
- Make canvas the sole source of identity, project, status, route, or language state.
- Infer a visitor’s language from the browser or probe external GitHub repositories as deployed routes.

## Route-Specific System: `/hire/`

The hiring profile is an intentional exception to the root portal's ink-landscape visual system. It is a serious reading surface for recruiters and hiring managers, not another project directory, application dashboard, marketing landing page, or online resume. This exception applies only to `/hire/` and its four locale variants; the homepage, project archive, and project details use the ink-landscape system above.

### Visual Direction

- Use a warm-white paper field, charcoal text, neutral one-pixel rules, and one muted navy interaction color.
- Use the existing self-hosted Inter family for editorial typography. Reserve monospace for elapsed-time markers and direct source identifiers.
- Keep the reading width near 1120px, with a narrower prose measure and generous but disciplined margins.
- Lead with the localized name, target capability directions, and a concise first-person engineering thesis.
- Structure evidence as ruled editorial records, a semantic table, numbered review steps, and footnote-like boundary notes.
- Use square geometry throughout. Do not add cards, shadows, gradients, illustrations, decorative animation, dashboards, signal graphics, or colored project families.

### Content Boundaries

- Role names describe directions being pursued, never employment history or acquired titles.
- Do not add a timeline, education history, skill ratings, portrait, resume download, email address, application form, private data, or unsupported commercial outcomes.
- PulseBoard must remain described as a production-shaped portfolio project. Mock-compatible notifications, absent AWS resources, and local or CI recovery rehearsals remain explicit.
- The public review route must retain the PulseBoard operations surface, customer surface, API documentation, OpenAPI JSON, project record, GitHub profile, and LinkedIn profile.

### Interaction and Access

- The header contains only a quiet return link and the four-language selector.
- Links use text labels rather than decorative icon controls. Keyboard focus uses a high-contrast navy outline.
- Preserve semantic heading order, the table structure, the skip link, localized link names, responsive stacked table records, and reduced-motion behavior.
