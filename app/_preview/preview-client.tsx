"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Check as ChromeCheck,
  ChevronDown,
  Copy as ChromeCopy,
  Shuffle,
} from "lucide-react"

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

/** A control card in the docked bar: muted label above, current value below. */
function Control<T extends string>({
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
    <label
      title={active?.note}
      className="group relative flex shrink-0 cursor-pointer flex-col gap-0.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 transition-colors hover:border-neutral-300"
    >
      <span className="text-[10px] leading-none text-neutral-400">{label}</span>
      <span className="pr-4 text-[12.5px] leading-tight font-medium text-neutral-900">
        {active?.label ?? value}
      </span>
      <ChevronDown className="pointer-events-none absolute right-2.5 bottom-2.5 size-3 text-neutral-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** A boolean control styled to match the cards. */
function Toggle({
  label,
  on,
  onChange,
  title,
}: {
  label: string
  on: boolean
  onChange: (v: boolean) => void
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={() => onChange(!on)}
      className={`flex shrink-0 flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors ${
        on
          ? "border-neutral-900 bg-neutral-900"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      <span className={`text-[10px] leading-none ${on ? "text-neutral-400" : "text-neutral-400"}`}>
        {label}
      </span>
      <span
        className={`text-[12.5px] leading-tight font-medium ${on ? "text-white" : "text-neutral-900"}`}
      >
        {on ? "On" : "Off"}
      </span>
    </button>
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

  /** Randomise the whole permutation — the fastest way to find combinations
      you would never have assembled deliberately. */
  const shuffle = () => {
    const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]
    setState((s) => ({
      ...s,
      font: pick(PAIRINGS).id,
      accent: pick(ACCENTS).id,
      surface: pick(SURFACES).id,
      canvas: pick(CANVASES).id,
      theme: pick(["light", "dark"] as const),
      squircle: Math.random() > 0.35,
    }))
  }

  // Only the component gallery flows into horizontal columns; the other views
  // are page-shaped and would be destroyed by it.
  const horizontal = state.view === "components"

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* ---------------- Canvas ---------------- */}
      <IconProvider value={{ lib: state.icons, weight: state.iconWeight }}>
        <main
          className={`preview-root relative min-h-0 flex-1 ${isDark ? "dark" : ""} ${
            state.grain ? "grain" : ""
          } ${horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto"}`}
          data-theme={state.theme}
          data-canvas={state.canvas}
          data-surface={state.surface}
          data-density={state.density}
          data-layout={horizontal ? "columns" : "flow"}
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
        </main>
      </IconProvider>

      {/* ---------------- Docked config ---------------- */}
      <footer className="shrink-0 border-t border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-2 overflow-x-auto px-3 py-3">
          <Control
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
          <Control
            label="Type"
            value={pairing.id}
            options={PAIRINGS.map((p) => ({ id: p.id, label: p.label, note: p.note }))}
            onChange={(v) => set("font", v)}
          />
          <Control
            label="Accent"
            value={accent.id}
            options={ACCENTS.map((a) => ({ id: a.id, label: a.label, note: a.note }))}
            onChange={(v) => set("accent", v)}
          />
          <Control
            label="Surface"
            value={state.surface}
            options={SURFACES}
            onChange={(v) => set("surface", v)}
          />
          <Control
            label="Canvas"
            value={state.canvas}
            options={CANVASES}
            onChange={(v) => set("canvas", v)}
          />
          <Control
            label="Density"
            value={state.density}
            options={[
              { id: "comfortable" as const, label: "Comfortable" },
              { id: "compact" as const, label: "Compact" },
            ]}
            onChange={(v) => set("density", v)}
          />
          <Control
            label="Theme"
            value={state.theme}
            options={[
              { id: "light" as const, label: "Light" },
              { id: "dark" as const, label: "Dark" },
            ]}
            onChange={(v) => set("theme", v)}
          />
          <Control
            label="Icons"
            value={state.icons}
            options={[
              { id: "lucide" as const, label: "Lucide" },
              { id: "phosphor" as const, label: "Phosphor" },
            ]}
            onChange={(v) => set("icons", v)}
          />
          <Control
            label="Stroke"
            value={state.iconWeight}
            options={[
              { id: "thin" as const, label: "Thin" },
              { id: "light" as const, label: "Light" },
              { id: "regular" as const, label: "Regular" },
            ]}
            onChange={(v) => set("iconWeight", v)}
          />
          <Toggle
            label="Squircle"
            on={state.squircle}
            onChange={(v) => set("squircle", v)}
            title="Multiply every radius token by 1.4"
          />
          <Toggle
            label="Grain"
            on={state.grain}
            onChange={(v) => set("grain", v)}
            title="Fractal-noise grain over the canvas"
          />

          <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
            <button
              type="button"
              onClick={shuffle}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[12.5px] font-medium text-neutral-700 transition-colors hover:border-neutral-300"
            >
              <Shuffle className="size-3.5" /> Shuffle
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-neutral-700"
            >
              {copied ? <ChromeCheck className="size-3.5" /> : <ChromeCopy className="size-3.5" />}
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      </footer>
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
