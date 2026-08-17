import * as React from "react"

/**
 * The swagui mark: a crystal rose on a squircle tile.
 *
 * Facet n sits at n * 137.5 degrees with radius proportional to sqrt(n) — the
 * phyllotactic packing real petals use, which is why the spiral reads as
 * organic rather than as a pattern.
 *
 * The five accent facets are NOT the first five. Consecutive golden-angle
 * facets are 137.5 degrees apart, so picking by index scatters them. Each
 * facet's true angle is computed and the accents are those nearest evenly
 * spaced targets, restricted to the outer radius band so they come out a
 * similar size and read as one ring. Irregular placement, deliberate colour.
 *
 * Static assets (favicon, apple-icon, OG) are generated from the same
 * constants by scripts/build-logo.mjs — edit there and here together.
 */

const GOLDEN = 137.5
const COUNT = 21
const ACCENTS = 5
/** Fills the tile without pushing the outer facets into the squircle corners. */
const BLOOM = 1.15
/** At and below 32px the 21-facet spiral mushes, so small cuts thin out. */
const SMALL_COUNT = 13
const SMALL_MAX = 32

const SQUIRCLE = "M12 0C21.1 0 24 2.9 24 12s-2.9 12-12 12S0 21.1 0 12 2.9 0 12 0Z"

/**
 * The mark has ONE appearance and does not invert with its surface.
 *
 * The tile used to be currentColor and the facets var(--background), which
 * meant an inverted surface gave the tile the page background while the facets
 * stayed light — white on white, with only the accents visible. A brand mark
 * should not restyle itself based on what it happens to sit on, so the tile and
 * facets are fixed and only the accent follows the theme via --brand.
 */
const INK = "#141414"
const FACET = "#ffffff"
/** Lifts the tile off a dark surface, which it would otherwise sink into. */
const RIM = "#ffffff"
const RIM_OPACITY = 0.14
/** Only used when --brand is absent, e.g. the mark rendered outside the app. */
const BRAND_FALLBACK = "#3f81e4"
const KITE = "M12 12 9.1 7.1 12 3 14.9 7.1Z"

const BANDS = {
  outer: [0.62, 0.16],
  mid: [0.88, 0.3],
  inner: [1, 0.46],
} as const

type Band = keyof typeof BANDS

type Facet = {
  n: number
  angle: number
  scale: number
  band: Band
  accent: boolean
}

function buildFacets(count: number): Facet[] {
  const all = Array.from({ length: count }, (_, i) => {
    const n = i + 1
    return {
      n,
      angle: (n * GOLDEN) % 360,
      scale: BLOOM * (0.24 + 0.76 * Math.sqrt(n / count)),
    }
  })

  const candidates = all.filter((f) => f.n >= Math.round(count * 0.35))
  const chosen = new Set<number>()

  for (let k = 0; k < ACCENTS; k++) {
    const target = (360 / ACCENTS) * k
    let best: number | null = null
    let bestDelta = Infinity
    for (const f of candidates) {
      if (chosen.has(f.n)) continue
      const raw = Math.abs(f.angle - target)
      const delta = Math.min(raw, 360 - raw)
      if (delta < bestDelta) {
        bestDelta = delta
        best = f.n
      }
    }
    if (best !== null) chosen.add(best)
  }

  return all
    .map((f) => ({
      ...f,
      accent: chosen.has(f.n),
      band: (f.n > count * 0.66
        ? "outer"
        : f.n > count * 0.33
          ? "mid"
          : "inner") as Band,
    }))
    .reverse() // largest first, so the tight centre paints on top
}

// Both geometries are fixed, so derive them once at module load, not per render.
const FULL = buildFacets(COUNT)
const SMALL = buildFacets(SMALL_COUNT)

export function SwaguiMark({
  size = 32,
  ...props
}: React.ComponentProps<"svg"> & { size?: number }) {
  // Gradient ids are document-global; two marks on a page would collide.
  const uid = React.useId().replace(/:/g, "")
  const facets = size <= SMALL_MAX ? SMALL : FULL

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="swagui"
      {...props}
    >
      <defs>
        {/*
          One shared light axis in userSpaceOnUse. The facets rotate but the
          axis does not, so the whole bloom is lit from a single direction —
          the same reason the surface recipes put a specular on the top edge
          and only the top edge.
        */}
        {Object.entries(BANDS).map(([name, [from, to]]) => (
          <linearGradient
            key={name}
            id={`${uid}-${name}`}
            gradientUnits="userSpaceOnUse"
            x1="5"
            y1="2"
            x2="19"
            y2="22"
          >
            <stop offset="0" stopColor={FACET} stopOpacity={from} />
            <stop offset="1" stopColor={FACET} stopOpacity={to} />
          </linearGradient>
        ))}
        <linearGradient
          id={`${uid}-core`}
          gradientUnits="userSpaceOnUse"
          x1="7"
          y1="4"
          x2="17"
          y2="18"
        >
          <stop offset="0" stopColor={`var(--brand, ${BRAND_FALLBACK})`} stopOpacity="1" />
          <stop offset="1" stopColor={FACET} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <path d={SQUIRCLE} fill={INK} />
      <path
        d={SQUIRCLE}
        fill="none"
        stroke={RIM}
        strokeOpacity={RIM_OPACITY}
        strokeWidth="0.75"
      />
      {facets.map((f) => (
        <path
          key={f.n}
          d={KITE}
          transform={`rotate(${f.angle.toFixed(2)} 12 12) translate(12 12) scale(${f.scale.toFixed(3)}) translate(-12 -12)`}
          fill={`url(#${uid}-${f.accent ? "core" : f.band})`}
        />
      ))}
    </svg>
  )
}
