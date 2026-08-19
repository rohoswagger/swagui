import * as React from "react"

import { cn } from "@/lib/utils"

type FooterColumn = { title: string; links: { label: string; href: string }[] }

function SiteFooter({
  brand,
  tagline,
  columns = [],
  bottom,
  wordmark,
  wordmarkStyle,
  className,
  ...props
}: React.ComponentProps<"footer"> & {
  brand: React.ReactNode
  tagline?: React.ReactNode
  columns?: FooterColumn[]
  bottom?: React.ReactNode
  /** Decorative terminal brand line. Defaults to `brand`; pass false to hide. */
  wordmark?: React.ReactNode | false
  wordmarkStyle?: React.CSSProperties
}) {
  const terminalWordmark =
    wordmark === undefined
      ? typeof brand === "string" || typeof brand === "number"
        ? brand
        : false
      : wordmark
  const terminalWordmarkStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 400,
    letterSpacing: "var(--display-tracking, -0.04em)",
    fontStyle: "normal",
    fontVariationSettings: "var(--display-variation, normal)",
    ...wordmarkStyle,
  }

  return (
    <footer
      data-slot="site-footer"
      className={cn(
        "border-border/60 w-full overflow-hidden border-t px-6 pt-20 pb-10 sm:px-8",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-[75rem]">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <p className="font-[family-name:var(--font-display)] text-[1.125rem]">{brand}</p>
            {tagline ? (
              <p className="text-muted-foreground mt-3 max-w-[34ch] text-[0.9375rem] leading-[1.6]">
                {tagline}
              </p>
            ) : null}
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-muted-foreground mb-4 font-mono text-[0.625rem] tracking-[0.22em] uppercase">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-muted-foreground hover:text-foreground text-[0.9375rem] transition-colors duration-(--duration-fast) ease-(--ease-swagui)"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border/60 text-muted-foreground mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-8 text-[0.8125rem]">
          {bottom}
        </div>

        {terminalWordmark !== false ? (
          <div
            data-slot="site-footer-wordmark"
            aria-hidden
            className="mt-14 flex w-full justify-center overflow-visible pt-3 pb-[0.1em] text-center"
          >
            <div
              className="max-w-full text-[clamp(4.5rem,26vw,20rem)] leading-[0.82] whitespace-nowrap text-foreground select-none"
              style={terminalWordmarkStyle}
            >
              {terminalWordmark}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  )
}

export { SiteFooter }
