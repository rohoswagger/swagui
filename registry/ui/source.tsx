"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A cited page: favicon, title, and the host it came from.
 *
 * Shared rather than reimplemented per surface — traces, answers and retrieved
 * context all show the same object, and it carries real behaviour (icon
 * failure, hue assignment) that is not worth duplicating three times.
 */

/**
 * The hues of swagui's base palette — clay, olive, sage, slate, mauve. The
 * monogram fallback borrows them at low chroma so a site without an icon reads
 * as a tinted neutral in the family of the theme, not as a stray colour.
 */
const SOURCE_HUES = [45, 110, 150, 255, 315]

/** Stable per host, so a given site keeps its colour across renders. */
function sourceHue(key: string) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return SOURCE_HUES[Math.abs(h) % SOURCE_HUES.length]
}

/**
 * Hitting the site's own /favicon.ico fails too often — plenty of hosts don't
 * serve one and it 404s as HTML — so this goes through a resolver by default.
 * Note it leaks the host to a third party; pass `iconSrc` to serve icons
 * yourself where that matters.
 */
function faviconSrc(host: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`
}

function SourceIcon({
  className,
  name,
  host,
  iconSrc,
  ...props
}: Omit<React.ComponentProps<"img">, "src" | "alt"> & {
  name: string
  host: string
  iconSrc?: string
}) {
  const [failed, setFailed] = React.useState(false)

  if (failed) {
    // An empty square reads as broken, so a missing icon falls back to a
    // monogram that still looks deliberate.
    return (
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-background",
          className
        )}
        style={{ background: `oklch(0.62 0.075 ${sourceHue(host)})` }}
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return (
    // A plain img, not next/image: these components have to work in any React
    // app, not only a Next one.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconSrc ?? faviconSrc(host)}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        "size-4 shrink-0 rounded-full bg-muted object-cover ring-1 ring-border/60",
        className
      )}
      {...props}
    />
  )
}

function Source({
  className,
  name,
  host,
  icon,
  iconSrc,
  asChild,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "icon"> & {
  name: string
  host: string
  /** Full control over the leading glyph; skips favicon loading entirely. */
  icon?: React.ReactNode
  /** Serve the icon yourself instead of going through the default resolver. */
  iconSrc?: string
  asChild?: boolean
}) {
  return (
    <div
      data-slot="source"
      className={cn("flex min-w-0 items-center gap-2 text-sm", className)}
      {...props}
    >
      {icon ?? <SourceIcon name={name} host={host} iconSrc={iconSrc} />}
      <span className="shrink-0 font-medium text-foreground">{name}</span>
      <span className="min-w-0 truncate text-muted-foreground">{host}</span>
    </div>
  )
}

export { Source, SourceIcon, sourceHue, faviconSrc }
