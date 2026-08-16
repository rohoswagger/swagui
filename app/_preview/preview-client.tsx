"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Check as ChromeCheck, Copy as ChromeCopy } from "lucide-react"

import { BlocksView } from "./blocks-view"
import { ComponentsView } from "./components-view"
import { ACCENTS, CANVASES, PAIRINGS, SURFACES } from "./config"
import { ArrowRight, IconLib, IconProvider, IconWeight, Search } from "./icons"

type State = {
  font: string
  accent: string
  surface: string
  canvas: string
  theme: "light" | "dark"
  view: "marketing" | "blocks" | "app" | "components"
  density: "comfortable" | "compact"
  icons: IconLib
  iconWeight: IconWeight
  squircle: boolean
  grain: boolean
}

const DEFAULTS: State = {
  font: "geist",
  accent: "ocean",
  surface: "elevation",
  canvas: "white",
  theme: "light",
  view: "marketing",
  density: "comfortable",
  icons: "lucide",
  iconWeight: "light",
  squircle: true,
  grain: true,
}

function Group<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { id: T; label: string; note?: string }[]
  onChange: (v: T) => void
}) {
  const active = options.find((o) => o.id === value)
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            title={o.note}
            onClick={() => onChange(o.id)}
            className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
              value === o.id
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {active?.note ? (
        <p className="text-[10px] leading-snug text-neutral-400">{active.note}</p>
      ) : null}
    </div>
  )
}

export function PreviewClient() {
  const params = useSearchParams()

  const [state, setState] = React.useState<State>(() => ({
    font: params.get("font") ?? DEFAULTS.font,
    accent: params.get("accent") ?? DEFAULTS.accent,
    surface: params.get("surface") ?? DEFAULTS.surface,
    canvas: params.get("canvas") ?? DEFAULTS.canvas,
    theme: (params.get("theme") as State["theme"]) ?? DEFAULTS.theme,
    view: (params.get("view") as State["view"]) ?? DEFAULTS.view,
    density: (params.get("density") as State["density"]) ?? DEFAULTS.density,
    icons: (params.get("icons") as IconLib) ?? DEFAULTS.icons,
    iconWeight: (params.get("iconWeight") as IconWeight) ?? DEFAULTS.iconWeight,
    squircle: params.get("squircle") !== "0",
    grain: params.get("grain") !== "0",
  }))

  const [copied, setCopied] = React.useState(false)

  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setState((s) => ({ ...s, [k]: v }))

  // Keep the URL in sync so a configuration is shareable and bookmarkable.
  React.useEffect(() => {
    const q = new URLSearchParams({
      font: state.font,
      accent: state.accent,
      surface: state.surface,
      canvas: state.canvas,
      theme: state.theme,
      view: state.view,
      density: state.density,
      icons: state.icons,
      iconWeight: state.iconWeight,
      squircle: state.squircle ? "1" : "0",
      grain: state.grain ? "1" : "0",
    })
    window.history.replaceState(null, "", `?${q}`)
  }, [state])

  const pairing = PAIRINGS.find((p) => p.id === state.font) ?? PAIRINGS[1]
  const accent = ACCENTS.find((a) => a.id === state.accent) ?? ACCENTS[0]
  const isDark = state.theme === "dark"

  const rootStyle = {
    // The theme's own knob names, so the preview drives exactly what a
    // consuming project would set.
    "--font-display": pairing.display,
    "--font-body": pairing.body,
    "--font-mono-face": pairing.mono,
    // Legacy aliases still referenced by the hand-authored sections.
    "--display-font": pairing.display,
    "--body-font": pairing.body,
    "--mono-font": pairing.mono,
    "--display-weight": pairing.displayWeight,
    "--display-tracking": pairing.displayTracking,
    "--brand": isDark ? accent.dark : accent.light,
    "--brand-content":
      state.accent === "none" ? "var(--fg)" : isDark ? accent.dark : accent.lightContent,
    "--squircle-factor": state.squircle ? 1.4 : 1,
  } as React.CSSProperties

  const displayStyle: React.CSSProperties = {
    ...(pairing.displayItalic ? { fontStyle: "italic" } : {}),
    ...(pairing.displayVariation
      ? { fontVariationSettings: pairing.displayVariation }
      : {}),
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const toggleCls = (active: boolean) =>
    `rounded-md px-2 py-1 text-[11px] transition-colors ${
      active
        ? "bg-neutral-900 text-white"
        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
    }`

  return (
    <div className="flex min-h-screen bg-white">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-white px-4 py-5">
        <div className="mb-5">
          <span className="text-sm font-semibold tracking-tight">swagui</span>
          <p className="text-[10px] text-neutral-500">token preview</p>
        </div>

        <div className="flex flex-col gap-5">
          <Group
            label="View"
            value={state.view}
            options={[
              { id: "marketing" as const, label: "Marketing" },
              { id: "blocks" as const, label: "Blocks" },
              { id: "components" as const, label: "Components" },
              { id: "app" as const, label: "App" },
            ]}
            onChange={(v) => set("view", v)}
          />
          <Group
            label="Type"
            value={pairing.id}
            options={PAIRINGS.map((p) => ({ id: p.id, label: p.label, note: p.note }))}
            onChange={(v) => set("font", v)}
          />
          <Group
            label="Accent"
            value={accent.id}
            options={ACCENTS.map((a) => ({ id: a.id, label: a.label, note: a.note }))}
            onChange={(v) => set("accent", v)}
          />
          <Group
            label="Surface"
            value={state.surface}
            options={SURFACES}
            onChange={(v) => set("surface", v)}
          />
          <Group
            label="Canvas"
            value={state.canvas}
            options={CANVASES}
            onChange={(v) => set("canvas", v)}
          />
          <Group
            label="Density"
            value={state.density}
            options={[
              { id: "comfortable" as const, label: "Comfortable", note: "Marketing register." },
              {
                id: "compact" as const,
                label: "Compact",
                note: 'data-density="compact" — app interiors.',
              },
            ]}
            onChange={(v) => set("density", v)}
          />
          <Group
            label="Icons"
            value={state.icons}
            options={[
              { id: "lucide" as const, label: "Lucide", note: "The most common set. Broad coverage, 1500+ icons." },
              {
                id: "phosphor" as const,
                label: "Phosphor",
                note: "~9k icons, six weights. You own the import mapping.",
              },
            ]}
            onChange={(v) => set("icons", v)}
          />
          <Group
            label="Icon weight"
            value={state.iconWeight}
            options={[
              { id: "thin" as const, label: "Thin", note: "Lucide stroke 1.25 / Phosphor thin." },
              { id: "light" as const, label: "Light", note: "Lucide stroke 1.5 / Phosphor light." },
              {
                id: "regular" as const,
                label: "Regular",
                note: "Lucide stroke 2 (stock) / Phosphor regular.",
              },
            ]}
            onChange={(v) => set("iconWeight", v)}
          />
          <Group
            label="Theme"
            value={state.theme}
            options={[
              { id: "light" as const, label: "Light" },
              { id: "dark" as const, label: "Dark" },
            ]}
            onChange={(v) => set("theme", v)}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
              Toggles
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => set("squircle", !state.squircle)}
                title="Multiply every radius token by 1.4 for continuous, Apple-like corners"
                className={toggleCls(state.squircle)}
              >
                Squircle
              </button>
              <button
                type="button"
                onClick={() => set("grain", !state.grain)}
                title="SVG fractal-noise grain plus a fine dot grid"
                className={toggleCls(state.grain)}
              >
                Grain
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={copyLink}
            className="flex items-center justify-center gap-1.5 rounded-md bg-neutral-100 px-2 py-1.5 text-[11px] text-neutral-600 transition-colors hover:bg-neutral-200"
          >
            {copied ? <ChromeCheck className="size-3" /> : <ChromeCopy className="size-3" />}
            {copied ? "Link copied" : "Copy share link"}
          </button>
        </div>
      </aside>

      {/* ---------------- Canvas ---------------- */}
      <IconProvider value={{ lib: state.icons, weight: state.iconWeight }}>
        <div
          // `dark` drives shadcn's @custom-variant dark (&:is(.dark *)) so the
          // vendored components' dark: utilities fire inside this subtree.
          className={`preview-root relative flex-1 ${isDark ? "dark" : ""} ${
            state.grain ? "grain" : ""
          }`}
          data-theme={state.theme}
          data-canvas={state.canvas}
          data-surface={state.surface}
          data-density={state.density}
          style={rootStyle}
        >
          {state.view === "marketing" ? (
            <MarketingView displayStyle={displayStyle} grain={state.grain} />
          ) : state.view === "blocks" ? (
            <BlocksView />
          ) : state.view === "components" ? (
            <ComponentsView displayStyle={displayStyle} />
          ) : (
            <AppView displayStyle={displayStyle} />
          )}
        </div>
      </IconProvider>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function MarketingView({
  displayStyle,
  grain,
}: {
  displayStyle: React.CSSProperties
  grain: boolean
}) {
  return (
    <div className="relative">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-5">
        <span className="display text-[17px]" style={displayStyle}>
          swagui
        </span>
        <nav className="flex items-center gap-7 text-[14px]" style={{ color: "var(--muted-fg)" }}>
          <span>Product</span>
          <span>Docs</span>
          <span>Pricing</span>
          <button className="btn-secondary ctl focus-ring">Sign in</button>
        </nav>
      </header>

      <section
        className={`relative mx-auto max-w-[1200px] px-8 pt-24 pb-28 text-center ${grain ? "dotgrid" : ""}`}
      >
        <p
          className="mono mb-7 text-[11px] uppercase"
          style={{ letterSpacing: "0.24em", color: "var(--muted-fg)" }}
        >
          Design system
        </p>
        <h1
          className="display mx-auto max-w-[13ch] text-[clamp(2.75rem,6vw,5rem)]"
          style={displayStyle}
        >
          Interfaces that look expensive.
        </h1>
        <p
          className="mx-auto mt-7 max-w-[52ch] text-[17px] leading-[1.6]"
          style={{ color: "var(--muted-fg)" }}
        >
          A registry of primitives and sections sharing one fixed identity. Swap the accent per
          project — everything else stays exactly the same. Read the{" "}
          <a href="#" className="brand-link">
            token reference
          </a>{" "}
          to see how far it goes.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <button className="btn-primary ctl focus-ring inline-flex items-center gap-2 font-medium">
            Get started <ArrowRight className="size-4" />
          </button>
          <button className="btn-secondary ctl focus-ring font-medium">Read the docs</button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-[13px]">
          <span className="brand-dot inline-block size-1.5 rounded-full" />
          <span style={{ color: "var(--muted-fg)" }}>v1.0 shipping now</span>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-8 pb-28">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Fixed identity",
              d: "Radius, type scale, shadows and motion curves never vary. That is the family resemblance.",
            },
            {
              t: "Color-only presets",
              d: "Surfaces derive from color-mix() off foreground and background, so dark mode is free.",
            },
            {
              t: "Two registers",
              d: "One token set, a compact scope for app interiors. Marketing stays generous.",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="surface brand-glow"
              style={{ borderRadius: "var(--r-xl)", padding: "var(--card-p)" }}
            >
              <h3 className="display mb-2 text-[19px]" style={displayStyle}>
                {f.t}
              </h3>
              <p className="text-[14px] leading-[1.6]" style={{ color: "var(--muted-fg)" }}>
                {f.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-8 pb-32">
        <div
          className="surface mx-auto max-w-[620px] text-center"
          style={{ borderRadius: "var(--r-xl)", padding: "2.5rem" }}
        >
          <h2 className="display mb-3 text-[30px]" style={displayStyle}>
            Ship it everywhere.
          </h2>
          <p className="mb-6 text-[15px]" style={{ color: "var(--muted-fg)" }}>
            One registry, every project.
          </p>
          <div className="flex gap-2">
            <input className="field focus-ring" placeholder="you@example.com" />
            <button className="btn-primary ctl focus-ring shrink-0 font-medium">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function AppView({ displayStyle }: { displayStyle: React.CSSProperties }) {
  const rows = [
    { name: "relays", status: "Live", usage: "12,480", change: "+18%" },
    { name: "leorio", status: "Live", usage: "8,201", change: "+4%" },
    { name: "gojo", status: "Building", usage: "3,914", change: "-2%" },
    { name: "kaito", status: "Live", usage: "22,067", change: "+31%" },
  ]

  return (
    <div className="flex min-h-screen">
      <aside
        className="w-56 shrink-0 border-r px-3 py-4"
        style={{ borderColor: "var(--hairline)", background: "var(--paper)" }}
      >
        <span className="display mb-5 block px-2 text-[15px]" style={displayStyle}>
          swagui
        </span>
        <nav className="flex flex-col gap-0.5 text-[13px]">
          {["Overview", "Projects", "Registry", "Themes", "Settings"].map((n, i) => (
            <span
              key={n}
              className="ctl flex items-center"
              style={
                i === 1
                  ? { background: "color-mix(in oklch, var(--fg) 7%, transparent)" }
                  : { color: "var(--muted-fg)" }
              }
            >
              {n}
            </span>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-7 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="display text-[24px]" style={displayStyle}>
              Projects
            </h1>
            <p className="text-[13px]" style={{ color: "var(--muted-fg)" }}>
              Four projects consuming the registry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
                style={{ color: "var(--muted-fg)" }}
              />
              <input
                className="field focus-ring w-52"
                style={{ paddingLeft: "1.875rem" }}
                placeholder="Search"
              />
            </div>
            <button className="btn-primary ctl focus-ring font-medium">New</button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          {[
            { l: "Installs", v: "46.6k" },
            { l: "Components", v: "23" },
            { l: "Presets", v: "7" },
            { l: "Bundle", v: "18 KB" },
          ].map((s) => (
            <div
              key={s.l}
              className="surface"
              style={{ borderRadius: "var(--r-md)", padding: "var(--card-p)" }}
            >
              <p
                className="mono mb-1 text-[10px] uppercase"
                style={{ letterSpacing: "0.16em", color: "var(--muted-fg)" }}
              >
                {s.l}
              </p>
              <p className="display text-[22px]" style={displayStyle}>
                {s.v}
              </p>
            </div>
          ))}
        </div>

        <div className="surface overflow-hidden" style={{ borderRadius: "var(--r-md)" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ color: "var(--muted-fg)" }}>
                {["Project", "Status", "Requests", "Change"].map((h) => (
                  <th
                    key={h}
                    className="border-b px-4 py-2.5 text-left font-medium"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="border-b px-4 py-2.5" style={{ borderColor: "var(--hairline)" }}>
                    <a href="#" className="brand-link">
                      {r.name}
                    </a>
                  </td>
                  <td className="border-b px-4 py-2.5" style={{ borderColor: "var(--hairline)" }}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="brand-dot inline-block size-1.5 rounded-full" />
                      {r.status}
                    </span>
                  </td>
                  <td className="border-b px-4 py-2.5" style={{ borderColor: "var(--hairline)" }}>
                    {r.usage}
                  </td>
                  <td
                    className="border-b px-4 py-2.5"
                    style={{ borderColor: "var(--hairline)", color: "var(--muted-fg)" }}
                  >
                    {r.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="surface mt-5 max-w-md"
          style={{ borderRadius: "var(--r-md)", padding: "var(--card-p)" }}
        >
          <h2 className="display mb-4 text-[16px]" style={displayStyle}>
            New project
          </h2>
          <div className="flex flex-col" style={{ gap: "var(--stack)" }}>
            <label className="text-[12px]" style={{ color: "var(--muted-fg)" }}>
              Name
            </label>
            <input className="field focus-ring" placeholder="my-project" />
            <label className="mt-1 text-[12px]" style={{ color: "var(--muted-fg)" }}>
              Registry URL
            </label>
            <input className="field focus-ring" defaultValue="swagui.rohoswagger.com" />
            <div className="mt-2 flex gap-2">
              <button className="btn-primary ctl focus-ring font-medium">Create</button>
              <button className="btn-secondary ctl focus-ring font-medium">Cancel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
