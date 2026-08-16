export type Pairing = {
  id: string
  label: string
  note: string
  display: string
  body: string
  mono: string
  displayWeight: number
  displayTracking: string
  displayItalic?: boolean
  /** font-variation-settings for variable faces driven off their defaults. */
  displayVariation?: string
}

export type Accent = {
  id: string
  label: string
  note: string
  light: string
  lightContent: string
  dark: string
}

/** Font stacks reference the CSS variables declared by next/font in page.tsx. */
export const PAIRINGS: Pairing[] = [
  {
    id: "runde",
    label: "Open Runde",
    note: "Soft geometric sans. Free, warm, pairs naturally with a squircle radius.",
    display: '"Open Runde", var(--font-geist), sans-serif',
    body: '"Open Runde", var(--font-geist), sans-serif',
    mono: "var(--font-jetbrains), ui-monospace, monospace",
    displayWeight: 600,
    displayTracking: "-0.03em",
  },
  {
    id: "geist",
    label: "Geist",
    note: "Variable, neutral, highly legible. Safe but reads as a common modern default.",
    display: "var(--font-geist), sans-serif",
    body: "var(--font-geist), sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
    displayWeight: 500,
    displayTracking: "-0.03em",
  },
  {
    id: "serif",
    label: "Instrument Serif",
    note: "Serif italic display over a neutral sans. Free, editorial, the most distinctive option.",
    display: "var(--font-instrument), Georgia, serif",
    body: "var(--font-geist), sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
    displayWeight: 400,
    displayTracking: "-0.02em",
    displayItalic: true,
  },
  {
    id: "manrope",
    label: "Manrope",
    note: "Semi-condensed geometric grotesk. Distinctive but professional; holds up at large sizes.",
    display: "var(--font-manrope), sans-serif",
    body: "var(--font-manrope), sans-serif",
    mono: "var(--font-jetbrains), ui-monospace, monospace",
    displayWeight: 700,
    displayTracking: "-0.04em",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    note: "Variable serif display run off its default axes. The most expressive option.",
    display: "var(--font-fraunces), Georgia, serif",
    body: "var(--font-geist), sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
    displayWeight: 600,
    displayTracking: "-0.02em",
    displayVariation: "'SOFT' 40, 'WONK' 1, 'opsz' 96",
  },
  {
    id: "jakarta",
    label: "Plus Jakarta",
    note: "One family for display and body. Reads as confidence rather than limitation.",
    display: "var(--font-jakarta), sans-serif",
    body: "var(--font-jakarta), sans-serif",
    mono: "var(--font-jetbrains), ui-monospace, monospace",
    displayWeight: 800,
    displayTracking: "-0.04em",
  },
]

/**
 * Every candidate is withheld from buttons by design — it appears only on links,
 * focus rings, status dots and glows.
 * `*Content` is the darker step used for brand text on a light canvas.
 */
export const ACCENTS: Accent[] = [
  {
    id: "ocean",
    label: "Ocean",
    note: "Cool, restrained. The conventional pick.",
    light: "oklch(0.58 0.16 250)",
    lightContent: "oklch(0.5 0.16 250)",
    dark: "oklch(0.7 0.14 250)",
  },
  {
    id: "sky",
    label: "Sky",
    note: "Brighter, more open. Reads friendly.",
    light: "oklch(0.68 0.15 230)",
    lightContent: "oklch(0.56 0.14 234)",
    dark: "oklch(0.78 0.13 226)",
  },
  {
    id: "violet",
    label: "Violet",
    note: "Non-blue but still cool. Distinctive without shouting.",
    light: "oklch(0.55 0.22 285)",
    lightContent: "oklch(0.48 0.22 285)",
    dark: "oklch(0.7 0.18 285)",
  },
  {
    id: "ember",
    label: "Ember",
    note: "Warm and energetic. Differentiates hardest.",
    light: "oklch(0.62 0.18 45)",
    lightContent: "oklch(0.54 0.17 42)",
    dark: "oklch(0.74 0.15 50)",
  },
  {
    id: "rust",
    label: "Rust",
    note: "Deep and desaturated. Muted, editorial.",
    light: "oklch(0.48 0.14 35)",
    lightContent: "oklch(0.44 0.14 33)",
    dark: "oklch(0.65 0.13 38)",
  },
  {
    id: "moss",
    label: "Moss",
    note: "Quiet green. Reads as calm rather than 'success'.",
    light: "oklch(0.55 0.1 155)",
    lightContent: "oklch(0.48 0.1 155)",
    dark: "oklch(0.72 0.1 155)",
  },
  {
    id: "magenta",
    label: "Magenta",
    note: "Loudest option. High personality, higher risk.",
    light: "oklch(0.6 0.24 350)",
    lightContent: "oklch(0.52 0.23 350)",
    dark: "oklch(0.72 0.2 350)",
  },
  {
    id: "none",
    label: "None",
    note: "No hot colour at all. Links inherit the foreground.",
    light: "oklch(0.4 0 0)",
    lightContent: "oklch(0.3 0 0)",
    dark: "oklch(0.8 0 0)",
  },
]

export const SURFACES = [
  { id: "elevation", label: "Elevation", note: "Hairline border plus three shadow layers at 3–4% alpha" },
  { id: "glass", label: "Glass", note: "Translucent color-mix tints, backdrop blur, inset top highlight" },
  { id: "bevel", label: "Bevel", note: "0.5px outer hairline over a 1px white inner bevel" },
] as const

export const BASES = [
  { id: "ash", label: "Ash", note: "Pure neutral. No hue at all." },
  { id: "slate", label: "Slate", note: "Cool blue undertone. Technical, recedes." },
  { id: "clay", label: "Clay", note: "Warm red-brown. The most tactile." },
  { id: "sage", label: "Sage", note: "Desaturated green. Calm, unusual." },
  { id: "mauve", label: "Mauve", note: "Muted purple. Soft without being sweet." },
  { id: "olive", label: "Olive", note: "Yellow-green. Dry, editorial." },
] as const
