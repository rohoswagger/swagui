/**
 * Verifies every base ramp against WCAG before it ships.
 *
 * Body text needs >= 4.5:1, large/secondary >= 3:1. The classic failure this
 * catches is muted grey body text on a tinted near-white, which reads elegant
 * in isolation and is unreadable in place.
 */

function oklchToSrgb(L, C, Hdeg) {
  const H = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(H)
  const b = C * Math.sin(H)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)))
}

/** WCAG relative luminance takes linear-light channels. */
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

export function contrast(fg, bg) {
  const a = luminance(oklchToSrgb(...fg))
  const b = luminance(oklchToSrgb(...bg))
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

export function hex(L, C, H) {
  return (
    "#" +
    oklchToSrgb(L, C, H)
      .map((v) => {
        const s = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055
        return Math.round(s * 255)
          .toString(16)
          .padStart(2, "0")
      })
      .join("")
  )
}

export function report(name, mode, ramp) {
  const checks = [
    ["foreground on background", ramp.foreground, ramp.background, 4.5],
    ["foreground on card", ramp.foreground, ramp.card, 4.5],
    ["muted-foreground on background", ramp.mutedForeground, ramp.background, 4.5],
    ["muted-foreground on card", ramp.mutedForeground, ramp.card, 4.5],
  ]
  const rows = checks.map(([label, fg, bg, min]) => {
    const ratio = contrast(fg, bg)
    return { label, ratio: +ratio.toFixed(2), min, pass: ratio >= min }
  })
  return { name, mode, bg: hex(...ramp.background), rows, pass: rows.every((r) => r.pass) }
}
