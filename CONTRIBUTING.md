# Contributing to swagui

Thanks for helping improve swagui. This guide covers local development, adding
registry items, verifying generated output and publishing the static registry.

## Local setup

Requirements:

- [Bun](https://bun.sh/)
- Git

Clone the public repository and start the local showcase:

```bash
git clone https://github.com/rohoswagger/swagui.git
cd swagui
bun install
bun run dev
```

The development server runs at `http://localhost:4200`. The showcase includes the
Marketing, Blocks, Components, App, Agent, Chat and Logo views.

## Project commands

```bash
bun run dev            # Start the showcase on port 4200
bun run test           # Run the test suite
bun run lint           # Run ESLint
bun run registry:build # Generate public/r/*.json
bun run build          # Build the registry and export the site to out/
bun run deploy         # Build and deploy the Cloudflare Worker
```

## Repository structure

| Path | Purpose |
| --- | --- |
| `registry/ui/` | Reusable UI and agent primitives |
| `registry/blocks/` | Composed page sections |
| `registry/theme/` | Theme source and tokens |
| `registry.json` | Registry item definitions and dependency graph |
| `public/r/` | Generated, publicly served registry JSON |
| `app/` | Documentation and component showcase |
| `scripts/` | Registry, theme, logo and validation tooling |

The next agent-facing components are tracked in the
[agent component roadmap](docs/agent-component-roadmap.md).

## Add a component

> **Do not run `bunx shadcn add <name>` from shadcn's registry in this repo.**
> It writes into `registry/ui/` and can overwrite swagui's customized source.
> Pull upstream files into a scratch directory first, then move them deliberately.

1. Add the implementation to `registry/ui/`.
2. Add its showcase and tests where appropriate.
3. Add the item to `registry.json`.

Cross-registry references must use full swagui URLs. A bare dependency such as
`"button"` resolves against `ui.shadcn.com`, not swagui.

```json
{
  "name": "my-component",
  "type": "registry:ui",
  "title": "My Component",
  "description": "A concise description of the component.",
  "registryDependencies": [
    "https://swagui.rohoswagger.com/r/theme.json",
    "https://swagui.rohoswagger.com/r/button.json"
  ],
  "files": [
    {
      "path": "registry/ui/my-component.tsx",
      "type": "registry:ui"
    }
  ]
}
```

4. Generate and inspect the public item:

```bash
bun run registry:build
sed -n '1,120p' public/r/my-component.json
git diff -- registry.json public/r/my-component.json
```

5. Run the relevant checks before opening a pull request:

```bash
bun run test
bun run lint
bun run build
git diff --check
```

Generated files under `public/r/` are committed with their source changes.

## Bundles

`core`, `agent` and `all` are dependency-only registry items in `registry.json`.
When adding a component, decide whether it belongs in one of these public install
surfaces and update the appropriate dependency list:

- `core` contains broadly useful foundational controls and utilities.
- `agent` contains the complete chat and agent experience.
- `all` installs every component, block and agent primitive.

Keep bundle entries explicit so the generated dependency graph stays inspectable.

## Deployment

swagui is a Next.js static export deployed with Cloudflare Workers Static Assets:

1. `shadcn build` generates the installable JSON under `public/r`.
2. Next.js exports the showcase and registry to `out`.
3. Wrangler uploads `out` to the `swagui` Worker.
4. The Worker serves `swagui.rohoswagger.com` as a custom domain.

The deployment contract lives in [`wrangler.jsonc`](wrangler.jsonc). Keep the app
compatible with static export; do not introduce runtime server routes or Node-only
request handling.

### Deploy manually

The Cloudflare account used for deployment must control `rohoswagger.com`.
Authenticate once, then run the repository deployment script:

```bash
bunx wrangler login
bun run deploy
```

`bun run deploy` rebuilds the registry and site before invoking Wrangler. Do not
edit or upload `out` by hand.

For non-interactive environments, provide a scoped `CLOUDFLARE_API_TOKEN` through
the environment instead of using `wrangler login`. Never commit tokens. GitHub
deployment automation is not configured yet, so releases are currently manual.

### Verify a release

```bash
curl --fail --head https://swagui.rohoswagger.com
curl --fail --silent https://swagui.rohoswagger.com/r/registry.json >/dev/null
bunx shadcn@latest view https://swagui.rohoswagger.com/r/button.json
bunx shadcn@latest view https://swagui.rohoswagger.com/r/core.json
bunx shadcn@latest view https://swagui.rohoswagger.com/r/agent.json
bunx shadcn@latest view https://swagui.rohoswagger.com/r/all.json
```

These checks cover the public site, catalog, a single component and every bundle.
For platform details, see the
[Cloudflare static assets documentation](https://developers.cloudflare.com/workers/static-assets/)
and
[shadcn registry documentation](https://ui.shadcn.com/docs/registry/getting-started).
