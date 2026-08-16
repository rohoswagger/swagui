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
npx shadcn@latest add https://swagui.rohoswagger.com/r/button.json
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

  /* Canvas */
  --background: oklch(0.995 0.004 85);
  --foreground: oklch(0.2 0.012 260);
}
```

### Scopes

Three attribute scopes compose on any wrapper element.

| Attribute | Values | Effect |
| --- | --- | --- |
| `data-canvas` | `white`, `warm`, `grey` | Swaps the ground and ink |
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
pnpm install
pnpm dev            # docs + live token preview at /
pnpm registry:build # writes public/r/*.json
pnpm build          # registry:build + static export to ./out
```

The preview at `/` renders every component against live token controls, with
Marketing, Components and App views.

## Blocks

Composed marketing sections, installed the same way:

```bash
npx shadcn@latest add https://swagui.rohoswagger.com/r/hero-centered.json
```

`section`, `reveal`, `hero-centered`, `feature-grid`, `logo-marquee`, `cta-band`.

Blocks may depend on `motion`; components never do, so app bundles stay lean.

## Adding a component

> **Do not run `npx shadcn add <name>` from shadcn's own registry in this repo.**
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

3. `pnpm registry:build`

## Deployment

Static export to Cloudflare Workers static assets. `pnpm build` produces `./out`.
