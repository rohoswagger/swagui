import type { Accent, Pairing } from "./config"

export type ShareConfiguration = {
  font: string
  accent: string
  surface: string
  base: string
  theme: "light" | "dark"
  view: string
  density: "comfortable" | "compact"
  icons: string
  iconWeight: string
  workingMark: string
  squircle: boolean
  grain: boolean
}

const REGISTRY_URL = "https://swagui.rohoswagger.com/r"

export function paletteUrlFor(configuration: ShareConfiguration, baseUrl: string) {
  const url = new URL(baseUrl)
  url.search = new URLSearchParams({
    font: configuration.font,
    accent: configuration.accent,
    surface: configuration.surface,
    base: configuration.base,
    theme: configuration.theme,
    view: configuration.view,
    density: configuration.density,
    icons: configuration.icons,
    iconWeight: configuration.iconWeight,
    workingMark: configuration.workingMark,
    squircle: configuration.squircle ? "1" : "0",
    grain: configuration.grain ? "1" : "0",
  }).toString()
  return url.toString()
}

function bundleForView(view: string) {
  if (view === "agent" || view === "chat") return "agent"
  if (view === "marketing" || view === "blocks") return "all"
  return "core"
}

export function installCommandFor(configuration: ShareConfiguration) {
  return `bunx shadcn@latest add ${REGISTRY_URL}/${bundleForView(configuration.view)}.json`
}

export function agentSetupPrompt({
  configuration,
  pairing,
  accent,
  paletteUrl,
}: {
  configuration: ShareConfiguration
  pairing: Pairing
  accent: Accent
  paletteUrl: string
}) {
  const brand = configuration.theme === "dark" ? accent.dark : accent.light
  const brandContent =
    configuration.accent === "none"
      ? "var(--foreground)"
      : configuration.theme === "dark"
        ? accent.dark
        : accent.lightContent

  return `Set up this project with swagui to match the shared palette below. Work in the existing project conventions; do not replace its app structure or introduce a second design system.

Install the ${bundleForView(configuration.view)} bundle:
\`${installCommandFor(configuration)}\`

Then configure the swagui theme at the app root (or the narrowest shared layout scope) with these exact choices:
- Typography: ${pairing.label}. Set \`--font-display: ${pairing.display}\`, \`--font-body: ${pairing.body}\`, \`--font-mono-face: ${pairing.mono}\`, \`--display-weight: ${pairing.displayWeight}\`, and \`--display-tracking: ${pairing.displayTracking}\`${pairing.displayItalic ? "; use italic display headings" : ""}${pairing.displayVariation ? `; set \`font-variation-settings: ${pairing.displayVariation}\` for display headings` : ""}.
- Color: ${accent.label} accent on a ${configuration.base} base in ${configuration.theme} mode. Set \`--brand: ${brand}\` and \`--brand-content: ${brandContent}\`.
- Scope attributes: \`data-base="${configuration.base}"\`, \`data-surface="${configuration.surface}"\`, and \`data-density="${configuration.density}"\`.
- Geometry: ${configuration.squircle ? "set `--squircle-factor: 1.4`" : "leave `--squircle-factor: 1`"}.
- Icons: use ${configuration.icons} at ${configuration.iconWeight} weight.
- Agent working mark: ${configuration.workingMark}.
- Texture: ${configuration.grain ? "retain the subtle grain treatment" : "do not add grain"}.

Use the shared palette as the visual reference: ${paletteUrl}

Verify the result at desktop and mobile sizes. Preserve accessible contrast and keyboard focus states, and keep the configuration centralized so future components inherit it automatically.`
}
