import * as React from "react"

import { SwaguiMark } from "@/components/swagui-mark"

const SIZES = [96, 64, 40, 24, 16]

export function LogoView({ displayStyle }: { displayStyle: React.CSSProperties }) {
  return (
    <div className="mx-auto max-w-[1000px] px-10 py-10">
      <header className="pb-8">
        <h1 className="display text-[34px]" style={displayStyle}>
          Logo
        </h1>
        <p className="mt-2 max-w-[64ch] text-[14px]" style={{ color: "var(--muted-fg)" }}>
          A crystal rose on a squircle tile. Facets sit at the golden angle with radius
          proportional to <code className="mono">&radic;n</code>, so the spiral is organic;
          the five accent facets are placed at even angles, so the colour is not. The tile is{" "}
          <code className="mono">currentColor</code> and the accent is{" "}
          <code className="mono">--brand</code>, so the mark follows the base, theme and
          accent knobs. The 16px column is the favicon test.
        </p>
      </header>

      <section className="py-8" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="flex flex-wrap items-end gap-9">
          {SIZES.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <SwaguiMark size={s} />
              <span className="mono text-[10px]" style={{ color: "var(--muted-fg)" }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8" style={{ borderTop: "1px solid var(--hairline)" }}>
        <h3
          className="mono mb-5 text-[10px] uppercase"
          style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
        >
          Inverted
        </h3>
        {/* A favicon lands on browser chrome you do not control, so the tile has
            to hold up knocked out as well as it does filled. */}
        <div
          className="inline-flex items-center gap-7 rounded-2xl px-8 py-6"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          {[64, 40, 24, 16].map((s) => (
            <SwaguiMark key={s} size={s} />
          ))}
        </div>
      </section>

      <section className="py-8" style={{ borderTop: "1px solid var(--hairline)" }}>
        <h3
          className="mono mb-5 text-[10px] uppercase"
          style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
        >
          Lockup
        </h3>
        <div className="flex flex-wrap items-center gap-10">
          <div className="flex items-center gap-2.5">
            <SwaguiMark size={28} />
            <span className="display text-[22px]" style={displayStyle}>
              swagui
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SwaguiMark size={18} />
            <span className="display text-[15px]" style={displayStyle}>
              swagui
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
