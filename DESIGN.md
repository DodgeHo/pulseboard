# Anlan Project Portal Design System

## Direction

The portal is a live deployment atlas: part project directory, part evidence surface. It should feel like a well-composed engineering index rather than a portfolio template or SaaS marketing page.

Design dials:

- `DESIGN_VARIANCE: 7`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 7`

## Brand Read

- Name: `ANLAN.STORE`
- Voice: precise, candid, kinetic
- Register: technical portfolio
- First impression: several real projects share this domain, and each can be opened immediately

Avoid aspirational slogans, fake company language, fabricated metrics, purple-blue gradients, glass panels, floating decorative shapes, and oversized rounded containers.

## Visual Concept

The page uses a publishing-grid rhythm with operational details:

- A compact masthead identifies the domain and current deployment date.
- A strong directory title frames the page, but the project index starts in the first viewport.
- PulseBoard receives the largest visual treatment because it has the deepest inspectable system surface.
- Career Radar appears as a compact secondary systems entry with an honest invite-only access label.
- The three practice banks appear as separate launchable entries in a dense study-tools band.
- Route paths, stack labels, and live availability are treated as useful interface data, not decoration.

## Palette

```css
:root {
  --portal-paper: #f4f3ee;
  --portal-surface: #fffefa;
  --portal-ink: #151918;
  --portal-muted: #626a66;
  --portal-rule: #cfd2ca;
  --portal-green: #247451;
  --portal-green-soft: #dcebdd;
  --portal-blue: #1e5f8a;
  --portal-blue-soft: #dce9f1;
  --portal-amber: #9b6719;
  --portal-amber-soft: #f1e2bd;
  --portal-red: #a44335;
  --portal-red-soft: #efd8d2;
  --portal-yellow: #e5c94e;
}
```

No gradient is part of the brand. Color communicates project type, route state, and emphasis.

## Typography

- Interface and display: `Aptos`, `Segoe UI`, `Helvetica Neue`, sans-serif.
- Technical data: `Cascadia Mono`, `SFMono-Regular`, `Consolas`, monospace.
- Letter spacing remains `0`.
- Large type belongs only to the page identity, never inside compact project rows.
- Route strings must wrap or scale without forcing horizontal page overflow.

## Layout

### Desktop

- Maximum content width: `1240px`.
- Header: brand, deployment descriptor, and section navigation.
- Directory intro: compact statement plus project count and route health summary.
- Featured project: one repeated-item card with a real screenshot, concise project explanation, proof links, and launch action.
- Secondary systems: a compact Career Radar entry with its route, invite-only state, and launch action.
- Study tools: three equal project rows or cards with distinct color markers.

### Mobile

- One-column flow.
- The PulseBoard screenshot remains visible and uses a stable aspect ratio.
- Filter controls scroll horizontally only inside their own control rail.
- Project actions remain at least 44px high.
- Long route labels wrap within their own rows.

## Components

### Masthead

Shows `ANLAN.STORE`, a short descriptor, and anchor navigation. It is restrained and does not become a second hero.

### Directory Header

Contains the literal offer: `Live project directory`. Supporting copy explains that every entry is deployed under the same domain.

### Filter Segments

Functional segmented buttons filter `All`, `Systems`, and `Study`. Active state must be visible without relying only on color.

### Project Entry

Each repeated entry contains:

- Project name and category.
- One honest sentence about what it demonstrates.
- Route path.
- Stack or implementation tags.
- Availability state derived from a same-origin request.
- One clear open action.

PulseBoard additionally includes links to its customer view, API docs, OpenAPI contract, and readiness probe.

Career Radar is visually secondary to PulseBoard and describes its access boundary without implying public registration.

### Visual Evidence

Use the actual PulseBoard operations and customer-surface captures. Images are inlined into the generated root artifact so deployment remains a single static file.

### Footer

Quietly states that the directory is a public deployment index and links back to the top. It does not repeat all project content.

## Motion

- Initial content reveal may use a short opacity and vertical transition.
- Project hover states may shift by at most 2px and strengthen the border.
- Availability indicators may pulse only while checking.
- `prefers-reduced-motion` disables nonessential animation.

## Accessibility

- Semantic landmarks and headings.
- Keyboard-operable segmented filters.
- Visible focus rings.
- Minimum WCAG AA text contrast.
- Status text accompanies colored indicators.
- Screenshot `alt` text describes the actual visible PulseBoard surface.
- No content depends on hover.

## Verification Checklist

- `ANLAN.STORE` and `Live project directory` appear in the first viewport.
- At least part of the next project content is visible without scrolling on common desktop and mobile sizes.
- The real PulseBoard screenshot loads and is not blank.
- All project filters work.
- All project launch links resolve to the intended subpaths.
- Dynamic availability checks do not block navigation when a route is offline.
- No text overlaps at 360px, 768px, 1280px, and 1440px viewport widths.
- No horizontal page overflow at the tested widths.
- Reduced-motion mode remains usable.
