# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Roshan (rohoswagger) and the coding agents that build his projects. swagui is a personal design system; the public hosting at swagui.rohoswagger.com is a distribution mechanism (the shadcn CLI needs URLs), not a product goal. No external audience commitment — demo content in the preview app may stay illustrative.

## Product Purpose

A personal shadcn-compatible component registry that makes every new project look like one recognizable, elegant family without redesigning each from zero. A project varies its accent colour (and a few knobs); everything else — radius, type scale, shadows, motion — stays fixed swagui identity. Success: new projects start from swagui and are visibly siblings.

## Positioning

A full shadcn replacement, not a layer on top: 51 components vendored into `registry/ui/`, with upstream drift owned deliberately. Identity lives in a token layer (`registry/theme/swagui.css`) that every component dereferences at use time, so one override on a wrapper retunes the whole system. Distribution is registry copy-paste only — no npm package; per-project drift is accepted by design.

## Operating Context

- Consumed via `bunx shadcn add https://swagui.rohoswagger.com/r/<item>.json` into new projects only (existing projects — relays, leorio, gojo, jotaro — are explicitly not retrofitted).
- Developed in this repo: Next.js static export (`output: 'export'`) deployed to Cloudflare Workers with Static Assets (not Vercel). Preview app at `bun run dev` (port 4200) with URL-driven knobs (`?view=…&accent=…&theme=…`).
- `bun run registry:build` serialises theme + components into `public/r/*.json`; `scripts/check-contrast.mjs` verifies palette pairs.

## Capabilities and Constraints

- Theme presets are **colour-only** registry items. Radius, type scale, shadows, and motion curves never vary per project — that fixed layer is the family resemblance, and it is near-irreversible (installed copies can't be corrected by a preset).
- The hot colour is `--brand` / `--brand-content`, never `--accent` (shadcn's `--accent` is a neutral hover fill). Brand appears only on links, focus rings, status dots, glows — deliberately withheld from buttons and surfaces.
- `motion` (Framer) is allowed in blocks and marketing sections only; primitives stay pure CSS (Radix `data-state` + tw-animate-css) so app bundles pay nothing. A `motion` entry in a primitive's `dependencies` is a defect.
- `data-density`, `data-base`, `data-surface` container scopes must be honoured by every component from the start.
- `registryDependencies` must be full URLs (`https://swagui.rohoswagger.com/r/….json`); bare names silently resolve to ui.shadcn.com.
- oklch `color-mix` toward `--background` rotates hue through magenta (explicit hue 0); mix brand with `transparent` instead.
- Out of scope for v1 (deliberate): three.js/shader work, npm packaging, runtime theme switching, palette generator CLI, retrofitting existing projects.

## Brand Commitments

- Name: **swagui**; domain swagui.rohoswagger.com.
- Voice of the codebase: reasoned comments explaining *why* a value is what it is; components documented as decisions, not options.
- Visual direction (settled, binding): "refined shadcn" — same skeleton, elevated execution; near-monochrome with one hot accent. heyclicky.com, aside.com, poke.com, tryjotaro.vercel.app are design inputs only, never codebases to extract from.

## Evidence on Hand

- 51 vendored primitives (`registry/ui/`), 14 blocks (`registry/blocks/`), agent components, theme tokens, preview app (`app/_preview/`).
- Contrast verification: worst case 5.83:1 light / 7.15:1 dark against the 4.5:1 requirement (`scripts/check-contrast.mjs`).
- No real testimonials, customers, or pricing exist — preview content (tiers, quotes, stats) is illustrative and must not be presented as fact anywhere public-facing beyond the demo.

## Product Principles

1. **The permutation is the theme.** Every value is a knob; no presets beyond colour. Never add a preset that freezes what should stay a knob.
2. **Identity through restraint.** The brand colour means something because it is withheld; hierarchy comes from elevation and type.
3. **Tokens over files.** A change that requires touching component files instead of the token layer is probably designed wrong.
4. **Bundles stay honest.** Marketing surfaces may pay for motion; app interiors never do.
5. **Copies drift, and that's fine.** The registry is a starting point, not a runtime dependency; correctness at install time beats synchronised updates.

## Accessibility & Inclusion

WCAG AA is binding: 4.5:1 body / 3:1 large text for every shipped pair and theme permutation. `scripts/check-contrast.mjs` is the gate; a change that drops a pair below the floor is a defect regardless of how it looks. Reduced-motion variants are required for every animation (established pattern in `swagui.css`).
