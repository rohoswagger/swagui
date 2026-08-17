"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * The disclosure shell for anything an agent did on its way to an answer —
 * thinking, searching, calling tools.
 *
 * All of those are the same object: a one-line summary you can open into the
 * evidence. So this is one shell rather than three components; the header is
 * the swagui mark, a label and a caret, and the body is a railed indent that
 * takes whatever content the activity produced.
 *
 * The governing rule is subordination. A trace is evidence for the answer and
 * never the answer, so the whole thing sits at muted-foreground and collapses
 * by default. Nothing in here competes with the response above it.
 */

type ReasoningContextValue = {
  streaming: boolean
  /** Seconds. Live while streaming, frozen once the trace settles. */
  elapsed: number
}

const ReasoningContext = React.createContext<ReasoningContextValue | null>(null)

function useReasoning(component: string) {
  const context = React.useContext(ReasoningContext)
  if (!context) {
    throw new Error(`${component} must be used within <Reasoning>`)
  }
  return context
}

function Reasoning({
  className,
  streaming = false,
  duration,
  defaultOpen,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, "duration"> & {
  /** The agent is still working: run the timer and shimmer the label. */
  streaming?: boolean
  /** Final duration in seconds. Omit while streaming and it is counted here. */
  duration?: number
}) {
  const [ticks, setTicks] = React.useState(0)

  // Count only while streaming. Mounting an already-finished trace must not
  // start a timer, or every historical message in a transcript would tick up.
  React.useEffect(() => {
    if (!streaming) return
    const started = Date.now()
    const id = window.setInterval(() => {
      setTicks(Math.round((Date.now() - started) / 100) / 10)
    }, 100)
    return () => window.clearInterval(id)
  }, [streaming])

  const value = React.useMemo(
    () => ({ streaming, elapsed: duration ?? ticks }),
    [streaming, duration, ticks]
  )

  return (
    <ReasoningContext.Provider value={value}>
      <CollapsiblePrimitive.Root
        data-slot="reasoning"
        data-streaming={streaming || undefined}
        // Open while working so the process is visible, then let it fall shut.
        defaultOpen={defaultOpen ?? streaming}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </ReasoningContext.Provider>
  )
}

function ReasoningTrigger({
  className,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger> & {
  /** Replaces the mark — a magnifier for search, a terminal for commands. */
  icon?: React.ReactNode
}) {
  const { streaming, elapsed } = useReasoning("ReasoningTrigger")

  return (
    <CollapsiblePrimitive.Trigger
      data-slot="reasoning-trigger"
      className={cn(
        "group/reasoning flex items-center gap-2 rounded-md py-0.5 text-left text-sm outline-none",
        "text-muted-foreground transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center",
          // The mark is the only thing that moves once the label settles, and
          // it turns rather than blinks — a bloom opening, not a spinner.
          streaming ? "text-muted-foreground" : "text-muted-foreground/70"
        )}
      >
        {icon ?? (
          <TraceMark
            className={cn("size-4", streaming && "animate-[spin_9s_linear_infinite]")}
          />
        )}
      </span>

      <span className={cn("min-w-0 truncate", streaming && "shimmer")}>
        {children ??
          (streaming ? "Thinking" : `Thought for ${formatDuration(elapsed)}`)}
      </span>

      {/* Caret trails the label rather than leading it, so the labels of
          stacked traces stay on one optical left edge. */}
      <Chevron
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground/50",
          "transition-transform duration-(--duration-base) ease-(--ease-swagui)",
          "group-hover/reasoning:text-muted-foreground",
          "group-data-[state=open]/reasoning:rotate-180"
        )}
      />
    </CollapsiblePrimitive.Trigger>
  )
}

function ReasoningContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="reasoning-content"
      className={cn(
        "overflow-hidden",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      {/*
        The rail sits at the centre of the trigger's icon, so it reads as
        hanging off the header rather than as a separate block. Deriving --rail
        from --spacing rather than hardcoding 8px keeps that alignment true in
        compact density, where the icon is smaller.
      */}
      <div
        className={cn(
          "relative pt-1.5 pb-0.5 [--rail:calc(var(--spacing)*2)]",
          "before:absolute before:inset-y-0 before:left-(--rail) before:w-px",
          "before:-translate-x-1/2 before:bg-border"
        )}
      >
        <div className="flex flex-col gap-1.5 pl-6">{children}</div>
      </div>
    </CollapsiblePrimitive.Content>
  )
}

/** A paragraph of the model's thinking. */
function ReasoningText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="reasoning-text"
      className={cn(
        "text-sm leading-normal text-muted-foreground",
        // Each paragraph fades up as it arrives rather than snapping in.
        "animate-in fade-in slide-in-from-bottom-1 duration-(--duration-base) ease-(--ease-swagui)",
        className
      )}
      {...props}
    />
  )
}

/**
 * A single line of activity — a file read, a command run, a page fetched.
 * The label carries the verb and stays at full contrast; everything after it
 * is detail and drops back.
 */
function ReasoningRow({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & { label?: React.ReactNode }) {
  return (
    <div
      data-slot="reasoning-row"
      className={cn(
        "flex min-w-0 items-baseline gap-2 text-sm",
        "animate-in fade-in slide-in-from-bottom-1 duration-(--duration-base) ease-(--ease-swagui)",
        className
      )}
      {...props}
    >
      {label ? (
        <span className="shrink-0 font-medium text-foreground">{label}</span>
      ) : null}
      <span className="mono min-w-0 truncate text-[13px] text-muted-foreground">
        {children}
      </span>
    </div>
  )
}

/**
 * The hues of swagui's base palette — clay, olive, sage, slate, mauve. Source
 * chips borrow them at low chroma so a list of sites reads as tinted neutrals
 * in the family of the theme, rather than as a row of vendor brand colours.
 */
const SOURCE_HUES = [45, 110, 150, 255, 315]

function hueFor(key: string) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return SOURCE_HUES[Math.abs(h) % SOURCE_HUES.length]
}

/**
 * Where the favicon comes from. Hitting the site's own /favicon.ico fails too
 * often — plenty of hosts don't serve one, and it 404s as HTML — so this goes
 * through a resolver by default. Note this leaks the host to a third party;
 * pass `iconSrc` to serve icons yourself if that matters.
 */
function faviconSrc(host: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`
}

/** A retrieved page: favicon, title, and the host it came from. */
function ReasoningSource({
  className,
  name,
  host,
  icon,
  iconSrc,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "icon"> & {
  name: string
  host: string
  /** Full control over the leading glyph; skips favicon loading entirely. */
  icon?: React.ReactNode
  /** Serve the icon yourself instead of going through the default resolver. */
  iconSrc?: string
}) {
  const [failed, setFailed] = React.useState(false)

  return (
    <div
      data-slot="reasoning-source"
      className={cn(
        "flex min-w-0 items-center gap-2 text-sm",
        "animate-in fade-in slide-in-from-bottom-1 duration-(--duration-base) ease-(--ease-swagui)",
        className
      )}
      {...props}
    >
      {icon ?? (
        failed ? (
          // Not every host serves an icon, and an empty square reads as broken.
          // The monogram falls back on the base palette's hues, so a missing
          // favicon still looks deliberate.
          <span
            aria-hidden
            className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-background"
            style={{ background: `oklch(0.62 0.075 ${hueFor(host)})` }}
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
        ) : (
          // A plain img, not next/image: these components have to work in any
          // React app, not only a Next one.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconSrc ?? faviconSrc(host)}
            alt=""
            width={16}
            height={16}
            loading="lazy"
            onError={() => setFailed(true)}
            className="size-4 shrink-0 rounded-full bg-muted object-cover ring-1 ring-border/60"
          />
        )
      )}
      <span className="shrink-0 font-medium text-foreground">{name}</span>
      <span className="min-w-0 truncate text-muted-foreground">{host}</span>
    </div>
  )
}

/** Sub-second traces read as "0.4s"; longer ones lose the decimal noise. */
function formatDuration(seconds: number) {
  if (seconds < 10) return `${seconds.toFixed(1)}s`
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  return `${mins}m ${Math.round(seconds % 60)}s`
}

/**
 * Three petals of the swagui mark. The logo is a phyllotactic rose, so the
 * thing that marks agent work is the rose itself, mid-bloom — the brand and
 * the busy indicator are the same object rather than a stock sparkle.
 */
function TraceMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      {[0, 120, 240].map((angle) => (
        <path
          key={angle}
          d="M12 12 9.4 7.5 12 3 14.6 7.5Z"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  )
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  ReasoningText,
  ReasoningRow,
  ReasoningSource,
}
