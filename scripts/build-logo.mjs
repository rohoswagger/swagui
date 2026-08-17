/**
 * Generates the swagui mark and every derived asset.
 *
 * The logo is phyllotactic: facet n sits at n * 137.5 degrees with radius
 * proportional to sqrt(n) — the angle and packing real petals use. Accent
 * facets are not picked by index, because consecutive golden-angle facets are
 * 137.5 degrees apart and would scatter. Each facet's true angle is computed
 * and the accents are those nearest evenly spaced targets, restricted to a
 * middle radius band so they come out a similar size and read as one ring.
 *
 * Run: node scripts/build-logo.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"

const GOLDEN = 137.5
const COUNT = 21
const ACCENTS = 5
/** Fills the tile without pushing the outer facets into the squircle corners. */
const BLOOM = 1.15
/** At and below 32px the 21-facet spiral mushes, so small cuts thin out. */
const SMALL_COUNT = 13
const SMALL_MAX = 32
const KITE = "M12 12 9.1 7.1 12 3 14.9 7.1Z"
const SQUIRCLE = "M12 0C21.1 0 24 2.9 24 12s-2.9 12-12 12S0 21.1 0 12 2.9 0 12 0Z"

/** Baked values for contexts that cannot read CSS variables — a favicon is
    rendered outside the document, so var(--brand) resolves to nothing. */
const INK = { light: "#171717", dark: "#fafafa" }
const GROUND = { light: "#ffffff", dark: "#0d0d0d" }
const BRAND = { light: "#2f6fd0", dark: "#6fa4e8" }

function facets(count = COUNT) {
  const all = Array.from({ length: count }, (_, i) => {
    const n = i + 1
    return {
      n,
      angle: (n * GOLDEN) % 360,
      scale: BLOOM * (0.24 + 0.76 * Math.sqrt(n / count)),
    }
  })

  const candidates = all.filter((f) => f.n >= Math.round(count * 0.35))
  const chosen = new Set()
  for (let k = 0; k < ACCENTS; k++) {
    const target = (360 / ACCENTS) * k
    let best = null
    let bestDelta = Infinity
    for (const f of candidates) {
      if (chosen.has(f.n)) continue
      const raw = Math.abs(f.angle - target)
      const delta = Math.min(raw, 360 - raw)
      if (delta < bestDelta) {
        bestDelta = delta
        best = f
      }
    }
    if (best) chosen.add(best.n)
  }

  return all
    .map((f) => ({
      ...f,
      accent: chosen.has(f.n),
      band: f.n > count * 0.66 ? "outer" : f.n > count * 0.33 ? "mid" : "inner",
    }))
    .reverse() // largest first, so the tight centre paints on top
}

const BANDS = { outer: [0.62, 0.16], mid: [0.88, 0.3], inner: [1, 0.46] }

/**
 * One shared light axis in userSpaceOnUse. The petals rotate but the axis
 * does not, so every facet is lit from the same direction — the same reason
 * the surface recipes put a specular on the top edge and only the top edge.
 */
function gradients(ground, brand, prefix) {
  const bands = Object.entries(BANDS)
    .map(
      ([name, [from, to]]) => `    <linearGradient id="${prefix}${name}" gradientUnits="userSpaceOnUse" x1="5" y1="2" x2="19" y2="22">
      <stop offset="0" stop-color="${ground}" stop-opacity="${from}"/>
      <stop offset="1" stop-color="${ground}" stop-opacity="${to}"/>
    </linearGradient>`
    )
    .join("\n")
  return `${bands}
    <linearGradient id="${prefix}core" gradientUnits="userSpaceOnUse" x1="7" y1="4" x2="17" y2="18">
      <stop offset="0" stop-color="${brand}" stop-opacity="1"/>
      <stop offset="1" stop-color="${ground}" stop-opacity="0.55"/>
    </linearGradient>`
}

function paths(prefix, count) {
  return facets(count)
    .map(
      (f) =>
        `  <path d="${KITE}" transform="rotate(${f.angle.toFixed(2)} 12 12) translate(12 12) scale(${f.scale.toFixed(3)}) translate(-12 -12)" fill="url(#${prefix}${f.accent ? "core" : f.band})"/>`
    )
    .join("\n")
}

/** Token-driven: inherits currentColor and --brand like every component. */
function tokenSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" role="img" aria-label="swagui">
  <defs>
${gradients("var(--background, #fff)", "var(--brand, #2f6fd0)", "sw-")}
  </defs>
  <path d="${SQUIRCLE}" fill="currentColor"/>
${paths("sw-", COUNT)}
</svg>
`
}

/** Baked, with a dark-mode swap so the favicon works on either browser chrome. */
function staticSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" role="img" aria-label="swagui">
  <style>
    .tile { fill: ${INK.light}; }
    @media (prefers-color-scheme: dark) { .tile { fill: ${INK.dark}; } }
  </style>
  <defs>
${gradients(GROUND.light, BRAND.light, "l-")}
  </defs>
  <path class="tile" d="${SQUIRCLE}"/>
${paths("l-", COUNT)}
</svg>
`
}

/** Raster needs one fixed scheme; browser chrome is usually light-on-dark. */
function rasterSvg(scheme, count = COUNT) {
  const ink = INK[scheme]
  const ground = GROUND[scheme]
  const brand = BRAND[scheme]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <defs>
${gradients(ground, brand, "r-")}
  </defs>
  <path d="${SQUIRCLE}" fill="${ink}"/>
${paths("r-", count)}
</svg>
`
}

function ogSvg() {
  const inner = rasterSvg("light")
    .replace(/^<svg[^>]*>\n/, "")
    .replace(/<\/svg>\n?$/, "")
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="${GROUND.light}"/>
  <g transform="translate(468 143) scale(11)">
${inner}
  </g>
</svg>
`
}

mkdirSync("public/logo", { recursive: true })

writeFileSync("public/logo/swagui-mark.svg", tokenSvg())
writeFileSync("app/icon.svg", staticSvg())
writeFileSync("public/logo/swagui-mark-static.svg", staticSvg())

const png = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size, { fit: "contain" }).png().toBuffer()

/** Below the threshold the full spiral turns to mush, so thin it out. */
const lightAt = (size) =>
  rasterSvg("light", size <= SMALL_MAX ? SMALL_COUNT : COUNT)

const targets = [
  ["public/logo/icon-16.png", 16],
  ["public/logo/icon-32.png", 32],
  ["public/logo/icon-192.png", 192],
  ["public/logo/icon-512.png", 512],
  ["app/apple-icon.png", 180],
]

for (const [path, size] of targets) {
  writeFileSync(path, await png(lightAt(size), size))
}

/**
 * A real ICO container, not a PNG with the extension swapped. Vista+ allows a
 * raw PNG as an entry payload, so each size is just the PNG we already render
 * wrapped in a 6-byte directory header plus one 16-byte entry each.
 */
async function ico(sizes) {
  const images = await Promise.all(sizes.map((s) => png(lightAt(s), s)))
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type 1 = icon
  header.writeUInt16LE(sizes.length, 4)

  let offset = 6 + sizes.length * 16
  const entries = sizes.map((size, i) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0) // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette count
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(images[i].length, 8)
    e.writeUInt32LE(offset, 12)
    offset += images[i].length
    return e
  })

  return Buffer.concat([header, ...entries, ...images])
}

writeFileSync("app/favicon.ico", await ico([16, 32, 48]))

writeFileSync(
  "public/logo/og.png",
  await sharp(Buffer.from(ogSvg())).png().toBuffer()
)

const chosen = facets().filter((f) => f.accent)
console.log(
  `mark built — ${COUNT} facets, ${ACCENTS} accents at ${chosen
    .map((f) => `${f.angle.toFixed(1)}°`)
    .reverse()
    .join(", ")}`
)
console.log(`assets: ${targets.map(([p]) => p.split("/").pop()).join(", ")}, favicon.ico, og.png`)
