"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Source, SourceIcon } from "@/registry/ui/source"

/**
 * The agent's answer.
 *
 * This is the exact counterweight to the reasoning trace. That component is
 * evidence and stays at muted-foreground; this one is the conclusion and is
 * the only thing on the surface at full contrast, on a wider measure and a
 * looser leading. If a transcript reads correctly at a glance, it is because
 * these two disagree about weight.
 *
 * Everything hung off the answer — citations, sources, actions, follow-ups —
 * stays subordinate to it, and the parts that invite a next step only appear
 * once the answer has finished arriving.
 */

type ResponseContextValue = {
  streaming: boolean
  caret: React.ReactNode | false
}

const ResponseContext = React.createContext<ResponseContextValue>({
  streaming: false,
  caret: undefined,
})

function Response({
  className,
  streaming = false,
  caret,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  streaming?: boolean
  /**
   * The typing cursor. A string renders as-is ("|", "_", "●"), a node gives
   * full control, and `false` turns it off for surfaces that stream without
   * one. Omit it for the default block, which is sized in em so it tracks the
   * type scale.
   */
  caret?: React.ReactNode | false
}) {
  const value = React.useMemo(() => ({ streaming, caret }), [streaming, caret])

  return (
    <ResponseContext.Provider value={value}>
      <div
        data-slot="response"
        data-streaming={streaming || undefined}
        className={cn("group/response flex w-full flex-col gap-3", className)}
        {...props}
      >
        {children}
      </div>
    </ResponseContext.Provider>
  )
}

/**
 * The prose. Wider measure and looser leading than anything else in the
 * transcript, because this is the part a person actually reads rather than
 * scans.
 */
function ResponseContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { streaming, caret } = React.useContext(ResponseContext)

  return (
    <div
      data-slot="response-content"
      className={cn(
        "max-w-[68ch] text-[15px] leading-relaxed text-foreground",
        "[&_strong]:font-medium [&_strong]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {/* Rendered inline rather than as a pseudo-element so it sits after the
          last word wherever that lands, including mid-wrap. */}
      {streaming && caret !== false ? (
        <span
          aria-hidden
          data-slot="response-caret"
          className={cn(
            "ml-0.5 animate-caret-blink align-baseline",
            // A supplied symbol keeps its own metrics; the default is a block
            // sized in em so it tracks the type scale.
            caret === undefined &&
              "inline-block h-[1.05em] w-[0.45em] translate-y-[0.15em] rounded-[1px] bg-foreground"
          )}
        >
          {caret}
        </span>
      ) : null}
    </div>
  )
}

/**
 * An inline citation. Numeric rather than a favicon: at body-text size an icon
 * is unreadable, and a number keeps the claim tied to an ordered list below.
 */
function ResponseCitation({
  className,
  index,
  href,
  ...props
}: React.ComponentProps<"a"> & { index: number }) {
  return (
    <a
      data-slot="response-citation"
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      className={cn(
        "mx-0.5 inline-flex size-[1.15em] translate-y-[-0.15em] items-center justify-center rounded-[0.3em]",
        "bg-muted align-baseline text-[0.62em] font-medium text-muted-foreground no-underline tabular-nums",
        "transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:bg-brand hover:text-brand-content",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {index}
    </a>
  )
}

/**
 * The sources behind the answer. Collapsed to a count by default — a wall of
 * links under every reply competes with the reply.
 *
 * Withheld while streaming, like the actions and follow-ups. The count is not
 * final until the answer is, and the inline citations these map to have not
 * all arrived yet, so showing them early offers receipts for claims the reader
 * cannot see.
 */
function ResponseSources({
  className,
  count,
  label = "sources",
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  /** Total found, which may exceed the number actually listed. */
  count?: number
  label?: string
  children?: React.ReactNode
}) {
  const { streaming } = React.useContext(ResponseContext)
  const [open, setOpen] = React.useState(false)
  const items = React.Children.toArray(children)
  const total = count ?? items.length

  if (streaming) return null

  return (
    <div
      data-slot="response-sources"
      className={cn(
        "min-w-0",
        "animate-in fade-in slide-in-from-bottom-1 duration-(--duration-base) ease-(--ease-swagui)",
        className
      )}
      {...props}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "group/sources flex items-center gap-2 rounded-md text-sm outline-none",
          "text-muted-foreground transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
          "hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        {/* The favicons themselves are the affordance: you can see whose work
            it is before deciding to open the list. */}
        <span className="flex -space-x-1.5">
          {items.slice(0, 3).map((child, i) => {
            const props = (child as React.ReactElement<{ name: string; host: string }>)
              .props
            return (
              <SourceIcon
                key={i}
                name={props?.name ?? "?"}
                host={props?.host ?? "?"}
                className="ring-2 ring-background"
              />
            )
          })}
        </span>
        <span>
          {total} {label}
        </span>
        <Chevron
          className={cn(
            "size-3.5 text-muted-foreground/50 transition-transform duration-(--duration-base) ease-(--ease-swagui)",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="mt-2 flex flex-col gap-1.5">
          {items.map((child, i) => (
            <div
              key={i}
              className="animate-in fade-in slide-in-from-bottom-1 duration-(--duration-base) ease-(--ease-swagui)"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
            >
              {child}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Copy, retry, rate. Held back until the answer has finished: offering to rate
 * a sentence that is still being written asks for a judgement too early.
 */
function ResponseActions({ className, ...props }: React.ComponentProps<"div">) {
  const { streaming } = React.useContext(ResponseContext)
  if (streaming) return null

  return (
    <div
      data-slot="response-actions"
      className={cn(
        // Pulled left by the button's own padding so the first glyph sits on
        // the same optical edge as the text above, not indented from it.
        "-ml-1.5 flex items-center gap-0.5",
        "pointer-events-none translate-y-0.5 opacity-0",
        "transition-[opacity,transform] duration-(--duration-fast) ease-(--ease-swagui)",
        "group-hover/response:pointer-events-auto group-hover/response:translate-y-0 group-hover/response:opacity-100",
        "group-focus-within/response:pointer-events-auto group-focus-within/response:translate-y-0 group-focus-within/response:opacity-100",
        "[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100",
        className
      )}
      {...props}
    />
  )
}

/** Final receipt for a completed assistant turn. */
function ResponseUsage({
  className,
  duration,
  tokens,
  ...props
}: React.ComponentProps<"div"> & {
  /** Total wall-clock seconds for the turn. */
  duration: number
  /** Total input and output tokens consumed by the turn. */
  tokens: number
}) {
  const { streaming } = React.useContext(ResponseContext)
  if (streaming) return null

  return (
    <div
      data-slot="response-usage"
      className={cn(
        "flex items-center gap-1.5 text-[11px] text-muted-foreground/70",
        className
      )}
      {...props}
    >
      <span className="tabular-nums">{formatDuration(duration)}</span>
      <span aria-hidden>·</span>
      <span className="tabular-nums">{formatTokens(tokens)} tokens</span>
    </div>
  )
}

function ResponseAction({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      data-slot="response-action"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md outline-none",
        "text-muted-foreground/70",
        "transition-[color,background-color,transform] duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:bg-accent hover:text-foreground active:scale-90",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

function formatTokens(tokens: number) {
  return new Intl.NumberFormat("en-US").format(tokens)
}

/** Suggested next prompts. Also withheld while streaming. */
function ResponseFollowUps({
  className,
  label = "Follow-ups",
  children,
  ...props
}: React.ComponentProps<"div"> & { label?: string }) {
  const { streaming } = React.useContext(ResponseContext)
  if (streaming) return null

  return (
    <div
      data-slot="response-follow-ups"
      className={cn("flex flex-col gap-2 border-t border-border pt-3", className)}
      {...props}
    >
      <span className="mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground/70">
        {label}
      </span>
      <div className="flex flex-col items-start gap-1.5">
        {React.Children.map(children, (child, i) => (
          <div
            className="animate-in fade-in slide-in-from-bottom-1 duration-(--duration-base) ease-(--ease-swagui)"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

function ResponseFollowUp({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="response-follow-up"
      className={cn(
        "group/followup inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5",
        "text-left text-sm text-muted-foreground outline-none",
        "transition-[color,background-color,border-color] duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:border-border hover:bg-accent hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {/* The arrow leans into the direction of travel on hover. */}
      <ArrowRight
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground/50",
          "transition-transform duration-(--duration-fast) ease-(--ease-swagui)",
          "group-hover/followup:translate-x-0.5 group-hover/followup:text-foreground"
        )}
      />
    </button>
  )
}

/**
 * Reveals text progressively. Real streaming arrives in chunks from a server
 * and needs none of this, but simulations, demos and replayed transcripts do —
 * and doing it here keeps the timing out of every call site.
 */
function useTypewriter(
  text: string,
  {
    charsPerTick = 2,
    interval = 28,
    loop = false,
    startDelay = 0,
  }: {
    /** Characters revealed each tick. Raise for speed without jitter. */
    charsPerTick?: number
    /** Milliseconds between ticks. */
    interval?: number
    /** Pause in ms before restarting, or false to stop when finished. */
    loop?: number | false
    /** Milliseconds to wait before the first character. */
    startDelay?: number
  } = {}
) {
  const [count, setCount] = React.useState(0)
  const [runId, setRunId] = React.useState(0)

  React.useEffect(() => {
    setCount(0)
    let tick: number | undefined
    let restart: number | undefined

    const begin = window.setTimeout(() => {
      tick = window.setInterval(() => {
        setCount((n) => {
          if (n < text.length) return Math.min(text.length, n + charsPerTick)
          if (loop === false) {
            window.clearInterval(tick)
            return n
          }
          window.clearInterval(tick)
          restart = window.setTimeout(() => setRunId((r) => r + 1), loop)
          return n
        })
      }, interval)
    }, startDelay)

    return () => {
      window.clearTimeout(begin)
      window.clearInterval(tick)
      window.clearTimeout(restart)
    }
  }, [text, charsPerTick, interval, loop, startDelay, runId])

  return {
    text: text.slice(0, count),
    streaming: count < text.length,
    restart: React.useCallback(() => setRunId((r) => r + 1), []),
  }
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

function ArrowRight({ className }: { className?: string }) {
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
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export {
  Response,
  ResponseContent,
  ResponseCitation,
  ResponseSources,
  ResponseUsage,
  ResponseActions,
  ResponseAction,
  ResponseFollowUps,
  ResponseFollowUp,
  useTypewriter,
  Source,
}
