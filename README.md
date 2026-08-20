# swagui

A public, shadcn-compatible component registry for React 19 and Tailwind CSS v4.
It includes foundational controls, composed blocks, agent/chat primitives and a
design-token theme, served from [swagui.rohoswagger.com](https://swagui.rohoswagger.com).

swagui replaces shadcn/ui rather than layering on top of it — the components are
vendored and restyled, so upstream changes are not inherited.

## Requirements

- Tailwind CSS v4
- React 19
- A shadcn-compatible project with `components.json`

If shadcn is not configured yet, initialize it from the root of your app:

```bash
bunx shadcn@latest init
```

## Quick start

Choose the bundle that matches your project:

| Bundle | Includes | Install command |
| --- | --- | --- |
| Core | Foundational controls and utilities | `bunx shadcn@latest add https://swagui.rohoswagger.com/r/core.json` |
| Agent/chat | The complete agent and chat interface set | `bunx shadcn@latest add https://swagui.rohoswagger.com/r/agent.json` |
| All | Every component, block and agent primitive | `bunx shadcn@latest add https://swagui.rohoswagger.com/r/all.json` |

Copy-paste versions:

```bash
# Core UI
bunx shadcn@latest add https://swagui.rohoswagger.com/r/core.json

# Chat and agent UI
bunx shadcn@latest add https://swagui.rohoswagger.com/r/agent.json

# The entire registry
bunx shadcn@latest add https://swagui.rohoswagger.com/r/all.json
```

The CLI shows the files it will write and asks before replacing conflicting files.
swagui components are vendored into your project, so you own and can edit the
installed source.

## Add individual components

Every registry item is independently installable. Use the component's name in the
hosted URL:

```bash
bunx shadcn@latest add https://swagui.rohoswagger.com/r/button.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/dialog.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/form.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/table.json
```

Agent and chat primitives work the same way:

```bash
bunx shadcn@latest add https://swagui.rohoswagger.com/r/message.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/prompt-input.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/reasoning.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/tool-call.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/tasks.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/artifact.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/input-request.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/subagent.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/chat-header.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/conversation-sidebar.json
```

Composed site blocks are also registry items:

```bash
bunx shadcn@latest add https://swagui.rohoswagger.com/r/hero-centered.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/feature-grid.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/pricing-tiers.json
bunx shadcn@latest add https://swagui.rohoswagger.com/r/site-footer.json
```

### Configure the `@swagui` namespace

Register the namespace once to use shorter commands in that project:

```bash
bunx shadcn@latest registry add \
  @swagui=https://swagui.rohoswagger.com/r/{name}.json

bunx shadcn@latest add @swagui/button
bunx shadcn@latest add @swagui/input-request
bunx shadcn@latest add @swagui/agent
```

After registration, any item can be installed as `@swagui/{name}`:

```bash
bunx shadcn@latest add @swagui/core
bunx shadcn@latest add @swagui/agent
bunx shadcn@latest add @swagui/all
bunx shadcn@latest add @swagui/artifact
bunx shadcn@latest add @swagui/site-footer
```

Every component declares the theme as a registry dependency, so the first install
writes the whole token layer straight into your `globals.css`. There is no file to
import and no manual step.

### Public endpoints

| Resource | URL |
| --- | --- |
| Documentation and showcase | `https://swagui.rohoswagger.com` |
| Registry catalog | `https://swagui.rohoswagger.com/r/registry.json` |
| Individual item | `https://swagui.rohoswagger.com/r/{name}.json` |
| Source | `https://github.com/rohoswagger/swagui` |

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

## Blocks

Composed marketing sections, installed the same way:

```bash
bunx shadcn@latest add https://swagui.rohoswagger.com/r/hero-centered.json
```

`section`, `reveal`, `hero-centered`, `feature-grid`, `logo-marquee`, `cta-band`.

Blocks may depend on `motion`; components never do, so app bundles stay lean.

## Contributing

Want to add a component, improve the showcase or publish a release? See
[CONTRIBUTING.md](CONTRIBUTING.md) for the local setup, registry workflow,
verification requirements and Cloudflare deployment process.

## License

[MIT](LICENSE) © 2026 rohoswagger.
