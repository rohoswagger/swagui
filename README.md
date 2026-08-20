# swagui

A personal, shadcn-compatible component registry. 51 components plus a design-token
theme, served from `https://swagui.rohoswagger.com`.

swagui replaces shadcn/ui rather than layering on top of it — the components are
vendored and restyled, so upstream changes are not inherited.

## Requirements

- Tailwind CSS v4
- React 19

## Install

```bash
bunx shadcn@latest add https://swagui.rohoswagger.com/r/button.json
```

Every component declares the theme as a registry dependency, so the first install
writes the whole token layer straight into your `globals.css`. There is no file to
import and no manual step.

## Theme

There are no presets. Every value is a knob; a project sets the ones it cares about
and inherits the rest. The permutation *is* the theme.

```css
:root {
  /* Type — wire these to real faces (next/font, @font-face, …). */
  --font-display: var(--font-my-display);
  --font-body: var(--font-my-body);
  --font-mono-face: var(--font-my-mono);
  --display-tracking: -0.03em;

  /* Geometry. 1 gives stock Tailwind corners. */
  --squircle-factor: 1.4;

  /* The one hot colour. Deliberately withheld from buttons and component
     surfaces — it appears on links, focus rings, status dots and glows. */
  --brand: oklch(0.58 0.16 250);
  --brand-content: oklch(0.5 0.16 250);

  /* Base colour — untinted by default; pick a temperature with data-base. */
  --background: oklch(0.991 0 0);
  --foreground: oklch(0.18 0 0);
}
```

### Base colours

Six tinted neutrals, not colours. The hue sits at 0.007 chroma in the ground and
0.020–0.028 in the ink, so it reads as a temperature rather than a tint. Hues are
spread around the wheel on purpose — defaulting warm is how every design system
ends up looking like every other one.

Every pair is verified by `scripts/check-contrast.mjs`. Worst case is 5.83:1 in
light and 7.15:1 in dark, against a 4.5:1 requirement.

### Scopes

Three attribute scopes compose on any wrapper element.

| Attribute | Values | Effect |
| --- | --- | --- |
| `data-base` | `ash`, `slate`, `clay`, `sage`, `mauve`, `olive` | Tints the whole neutral ramp |
| `data-surface` | `elevation`, `bevel`, `glass` | Swaps the shadow tokens, so every component follows |
| `data-density` | `comfortable`, `compact` | Retunes `--spacing`, radius and line-height |

`data-density="compact"` is the app-interior register: it overrides `--spacing`,
which every Tailwind spacing utility derives from, so padding, margins, gaps,
control heights and icon sizes all tighten at once. Colour is untouched.

```tsx
<div data-density="compact">
  <DataTable />
</div>
```

Dark mode is class-driven — put `dark` on `<html>` or any wrapper.

## Development

```bash
bun install
bun run dev            # docs + live token preview at /
bun run registry:build # writes public/r/*.json
bun run build          # registry:build + static export to ./out
```

The preview at `/` renders every component against live token controls, with
Marketing, Blocks, Components, App, Agent, Chat and Logo views.

The next agent-facing components are tracked in the
[agent component roadmap](docs/agent-component-roadmap.md).

## Blocks

Composed marketing sections, installed the same way:

```bash
bunx shadcn@latest add https://swagui.rohoswagger.com/r/hero-centered.json
```

`section`, `reveal`, `hero-centered`, `feature-grid`, `logo-marquee`, `cta-band`.

Blocks may depend on `motion`; components never do, so app bundles stay lean.

## Adding a component

> **Do not run `bunx shadcn add <name>` from shadcn's own registry in this repo.**
> It writes into `registry/ui/` and will clobber swagui's edits. Pull upstream
> files into a scratch directory first, then move them in deliberately.


1. Add the file to `registry/ui/`.
2. Add an entry to `registry.json`. Cross-references must use full URLs —
   a bare `"button"` resolves against `ui.shadcn.com`, not swagui.

```json
{
  "name": "my-component",
  "type": "registry:ui",
  "title": "My Component",
  "description": "…",
  "registryDependencies": ["https://swagui.rohoswagger.com/r/theme.json"],
  "files": [{ "path": "registry/ui/my-component.tsx", "type": "registry:ui" }]
}
```

3. `bun run registry:build`

## Deployment

Static export to Cloudflare Workers static assets. `bun run build` produces `./out`.
