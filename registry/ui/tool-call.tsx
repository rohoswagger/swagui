"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * What the agent did, and what came back.
 *
 * A trace is inert and an answer is a claim; a tool call is neither. It is the
 * only thing in the set with consequences — a command ran, a file changed, an
 * image now exists — and the design follows from that one fact.
 *
 * Weight tracks consequence. Reading a file or searching the web leaves the
 * world as it was, so those sit at trace weight with no surface of their own.
 * Writing, running and generating changed something, so they get a surface and
 * carry their result. The eye should be able to find the destructive verbs in
 * a stack of twenty rows without reading any of them.
 *
 * Failure is the exception to every rule here. A failed call renders open, is
 * exempt from collapsing, and colours the group's own summary — a header that
 * says "6 tools" while hiding a failure inside is the one outcome this
 * component must never produce.
 */

type Status = "pending" | "running" | "success" | "error"

type Kind =
  | "read"
  | "edit"
  | "write"
  | "bash"
  | "code"
  | "search"
  | "fetch"
  | "image"
  | "skill"
  | "task"
  | "mcp"
  | "think"

/**
 * Whether the call changed anything. Reads and lookups are observations;
 * everything else left a mark, and the surface says so.
 */
const OBSERVES: Record<Kind, boolean> = {
  read: true,
  search: true,
  fetch: true,
  think: true,
  edit: false,
  write: false,
  bash: false,
  code: false,
  image: false,
  skill: false,
  task: false,
  mcp: false,
}

/** The verb, when the caller does not supply one. */
const VERB: Record<Kind, string> = {
  read: "Read",
  edit: "Edit",
  write: "Write",
  bash: "Run",
  code: "Execute",
  search: "Search",
  fetch: "Fetch",
  image: "Generate",
  skill: "Skill",
  task: "Delegate",
  mcp: "Call",
  think: "Think",
}

type ToolCallContextValue = {
  status: Status
  kind: Kind
  /** Failures cannot be collapsed, so parts read this rather than a prop. */
  forcedOpen: boolean
}

const ToolCallContext = React.createContext<ToolCallContextValue | null>(null)

function useToolCall(component: string) {
  const context = React.useContext(ToolCallContext)
  if (!context) {
    throw new Error(`${component} must be used within <ToolCall>`)
  }
  return context
}

/* --------------------------------- group --------------------------------- */

/**
 * A run of calls under one summary.
 *
 * The summary counts what happened rather than describing it, and a failure
 * anywhere inside promotes itself into that line. Collapsing is a convenience
 * for a clean run, never a way to put an error out of sight.
 */
function ToolCalls({
  className,
  label,
  open,
  defaultOpen = false,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, "title"> & {
  /** Overrides the counted summary. */
  label?: React.ReactNode
}) {
  /*
    Failures are counted from the children's own props rather than reported
    upward by the children themselves.

    A collapsed disclosure does not render its contents, so a failed call
    inside a closed group would never mount, never report, and the group would
    go on advertising a clean run while hiding the one row that matters.
    Reading the props is synchronous and true before anything is mounted.
  */
  const items = React.Children.toArray(children)
  const count = items.length
  const failures = items.filter(
    (child) =>
      React.isValidElement<{ status?: Status }>(child) &&
      child.props.status === "error"
  ).length

  return (
    <>
      <CollapsiblePrimitive.Root
        {...props}
        data-slot="tool-calls"
        data-failed={failures ? "" : undefined}
        // A failed run opens itself. Nothing is hidden behind a tidy count.
        defaultOpen={defaultOpen || failures > 0}
        open={failures > 0 ? true : open}
        className={cn("w-full", className)}
      >
        <CollapsiblePrimitive.Trigger
          data-slot="tool-calls-trigger"
          disabled={failures > 0}
          className={cn(
            "group/tools flex items-center gap-2 rounded-md py-0.5 text-left text-sm outline-none",
            "transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
            "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            failures
              ? "cursor-default text-destructive"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Chevron
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground/50",
              "transition-transform duration-(--duration-base) ease-(--ease-swagui)",
              "group-data-[state=open]/tools:rotate-180",
              failures && "opacity-0"
            )}
          />
          <span>
            {label ?? (
              <>
                {count} {count === 1 ? "tool call" : "tool calls"}
                {failures ? ` · ${failures} failed` : null}
              </>
            )}
          </span>
        </CollapsiblePrimitive.Trigger>

        <CollapsiblePrimitive.Content
          data-slot="tool-calls-content"
          className={cn(
            "overflow-hidden",
            /*
              The timing is written into the shorthand rather than layered on
              top of it. `animate-accordion-down` is itself a shorthand carrying
              0.2s ease-out, so a separate animation-duration utility is the
              same specificity and simply loses to source order.

              A run of tool calls is taller than a menu and should read as a
              list unfolding rather than a panel snapping, so it runs longer and
              on the softer curve.
            */
            "data-[state=open]:animate-reveal data-[state=closed]:animate-conceal"
          )}
        >
          <div className="flex flex-col gap-1.5 pt-2 pl-[1.375rem]">{children}</div>
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    </>
  )
}

/* ---------------------------------- call ---------------------------------- */

const rowVariants = cva(
  [
    "group/call flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm outline-none",
    // A call is appended to a run as it happens, so it arrives rather than
    // simply existing.
    "animate-in fade-in slide-in-from-bottom-1 duration-(--duration-base) ease-(--ease-soft)",
    "motion-reduce:animate-none",
    "transition-[background-color,color] duration-(--duration-fast) ease-(--ease-swagui)",
    "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ],
  {
    variants: {
      tone: {
        // Observed the world without changing it.
        quiet: "text-muted-foreground",
        // Changed something. The verb carries full contrast.
        acted: "text-foreground",
        failed: "text-destructive",
      },
    },
    defaultVariants: { tone: "quiet" },
  }
)

function ToolCall({
  className,
  kind = "bash",
  status = "success",
  label,
  target,
  meta,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof rowVariants> & {
    kind?: Kind
    status?: Status
    /** The verb. Defaults to one derived from the kind. */
    label?: React.ReactNode
    /** What the verb acted on — a path, a command, a query. */
    target?: React.ReactNode
    /** Trailing detail: a duration, an exit code, a count. */
    meta?: React.ReactNode
    children?: React.ReactNode
  }) {
  const failed = status === "error"
  const hasDetail = React.Children.count(children) > 0
  const tone = failed ? "failed" : OBSERVES[kind] ? "quiet" : "acted"
  const context = React.useMemo(
    () => ({ status, kind, forcedOpen: failed }),
    [status, kind, failed]
  )

  const head = (
    <>
      <ToolIcon kind={kind} status={status} />
      <span className={cn("shrink-0", tone === "quiet" ? "" : "font-medium")}>
        {label ?? VERB[kind]}
      </span>
      {target ? (
        <span
          data-slot="tool-call-target"
          className={cn(
            // rounded-sm, not `rounded`. The bare utility is a hardcoded 4px
            // that sits off the ladder and ignores --squircle-factor, so it
            // stayed square while every other corner in the system moved.
            "mono min-w-0 truncate rounded-sm px-2 py-[3px] text-[12.5px]",
            // The surface is the tell. An observation reads as plain text; a
            // change reads as an object that now exists.
            failed
              ? "bg-destructive/10 text-destructive"
              : OBSERVES[kind]
                ? "text-muted-foreground"
                : "bg-muted text-foreground",
            status === "running" && "shimmer"
          )}
        >
          {target}
        </span>
      ) : null}
      <span className="mono ml-auto shrink-0 pl-2 text-[11px] text-muted-foreground/70">
        {meta}
      </span>
      {/*
        A fixed slot, present on every row whether or not it opens. Rendering
        the chevron only where there is detail made the trailing meta land in a
        different place on each row, so a column of durations and exit codes
        never lined up with the diffs above it.
      */}
      <span aria-hidden className="flex size-3 shrink-0 items-center justify-center">
        {hasDetail && !failed ? (
          <Chevron
            className={cn(
              "size-3 text-muted-foreground/40",
              "transition-transform duration-(--duration-base) ease-(--ease-swagui)",
              "group-data-[state=open]/call:rotate-180"
            )}
          />
        ) : null}
      </span>
    </>
  )

  return (
    <ToolCallContext.Provider value={context}>
      <div
        data-slot="tool-call"
        data-kind={kind}
        data-status={status}
        className={cn("min-w-0", className)}
        {...props}
      >
        {hasDetail ? (
          <CollapsiblePrimitive.Root
            // A failure is not a disclosure. Its output is the point.
            open={failed ? true : undefined}
            defaultOpen={failed}
          >
            <CollapsiblePrimitive.Trigger
              disabled={failed}
              className={cn(rowVariants({ tone }), !failed && "hover:bg-accent/50")}
            >
              {head}
            </CollapsiblePrimitive.Trigger>
            <CollapsiblePrimitive.Content
              className={cn(
                "overflow-hidden",
                "data-[state=open]:animate-reveal data-[state=closed]:animate-conceal"
              )}
            >
              <div className="flex flex-col gap-2 pt-2 pb-1.5 pl-7">{children}</div>
            </CollapsiblePrimitive.Content>
          </CollapsiblePrimitive.Root>
        ) : (
          <div className={cn(rowVariants({ tone }))}>{head}</div>
        )}
      </div>
    </ToolCallContext.Provider>
  )
}

/* -------------------------------- evidence -------------------------------- */

/**
 * Whatever the tool printed. Monospaced because it is machine output and its
 * alignment carries meaning, capped in height because a thousand lines of log
 * is not worth the scroll position of the page it interrupts.
 */
function ToolCallOutput({
  className,
  children,
  ...props
}: React.ComponentProps<"pre">) {
  const { status } = useToolCall("ToolCallOutput")

  return (
    <pre
      data-slot="tool-call-output"
      className={cn(
        "no-scrollbar max-h-56 overflow-auto rounded-md px-3 py-2.5",
        "mono text-[12px] leading-relaxed whitespace-pre-wrap",
        status === "error"
          ? "bg-destructive/8 text-destructive"
          : "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  )
}

/** Added and removed lines, in the two colours that already mean that. */
function ToolCallDiff({
  className,
  added,
  removed,
  ...props
}: React.ComponentProps<"span"> & { added?: number; removed?: number }) {
  if (!added && !removed) return null

  return (
    <span
      data-slot="tool-call-diff"
      className={cn("mono shrink-0 text-[12px] tabular-nums", className)}
      {...props}
    >
      {added ? <span className="text-success">+{added}</span> : null}
      {added && removed ? " " : null}
      {removed ? <span className="text-destructive">−{removed}</span> : null}
    </span>
  )
}

/**
 * An image the agent made or looked at. Shown rather than described: the whole
 * reason it is here is that a caption cannot stand in for it.
 */
function ToolCallImage({
  className,
  src,
  alt = "",
  caption,
  ...props
}: Omit<React.ComponentProps<"img">, "alt"> & {
  alt?: string
  caption?: React.ReactNode
}) {
  return (
    <figure data-slot="tool-call-image" className={cn("min-w-0", className)}>
      {/* A plain img, not next/image: these components have to work in any
          React app, not only a Next one. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-56 w-auto rounded-md border border-border bg-muted object-contain"
        {...props}
      />
      {caption ? (
        <figcaption className="mono pt-1 text-[11px] text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/**
 * A named result: the arguments a skill ran with, the fields an API returned.
 * Two columns because a key and its value are not the same kind of thing.
 */
function ToolCallFields({ className, ...props }: React.ComponentProps<"dl">) {
  return (
    <dl
      data-slot="tool-call-fields"
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12.5px]",
        className
      )}
      {...props}
    />
  )
}

function ToolCallField({
  className,
  name,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "name"> & { name: React.ReactNode }) {
  return (
    <div className="contents" {...props}>
      <dt className="mono text-muted-foreground">{name}</dt>
      <dd className={cn("mono min-w-0 truncate text-foreground", className)}>
        {children}
      </dd>
    </div>
  )
}

/**
 * The files a run touched, as a footer to the whole group. A stack of edit
 * rows answers "what happened"; this answers "what is different now", which is
 * the question someone scrolling back actually has.
 */
function ToolCallFiles({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tool-call-files"
      className={cn(
        "flex flex-wrap items-center gap-2 border-t border-border pt-3.5",
        className
      )}
      {...props}
    />
  )
}

function ToolCallFile({
  className,
  path,
  added,
  removed,
  ...props
}: React.ComponentProps<"button"> & {
  path: string
  added?: number
  removed?: number
}) {
  return (
    <button
      type="button"
      data-slot="tool-call-file"
      className={cn(
        "mono inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-[12px] outline-none",
        "transition-[border-color,background-color] duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:border-muted-foreground/40 hover:bg-accent",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        className
      )}
      {...props}
    >
      <span className="min-w-0 truncate text-foreground">{path}</span>
      <ToolCallDiff added={added} removed={removed} />
    </button>
  )
}

/* ---------------------------------- icons --------------------------------- */

function ToolIcon({ kind, status }: { kind: Kind; status: Status }) {
  const Glyph = GLYPHS[kind]

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center",
        status === "error"
          ? "text-destructive"
          : status === "running"
            ? "text-foreground"
            : "text-muted-foreground/70",
        // Only the running call moves, and it turns rather than blinks.
        status === "running" && "animate-[spin_2.4s_linear_infinite]"
      )}
    >
      {status === "running" ? <Spinner /> : <Glyph />}
    </span>
  )
}

const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-4",
}

const GLYPHS: Record<Kind, () => React.JSX.Element> = {
  read: () => (
    <svg {...stroke}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  ),
  edit: () => (
    <svg {...stroke}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
      <path d="M14.5 5.5 18.5 9.5" />
    </svg>
  ),
  write: () => (
    <svg {...stroke}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      <path d="M14 3v5h5" />
      <path d="M18 3v6M15 6h6" />
    </svg>
  ),
  bash: () => (
    <svg {...stroke}>
      <path d="m5 8 4 4-4 4M12 16h7" />
    </svg>
  ),
  code: () => (
    <svg {...stroke}>
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
    </svg>
  ),
  search: () => (
    <svg {...stroke}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  ),
  fetch: () => (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5a14 14 0 0 1 0 17a14 14 0 0 1 0-17" />
    </svg>
  ),
  image: () => (
    <svg {...stroke}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.5 17 4.5-4.5 4 4 3-2.5 3.5 3" />
    </svg>
  ),
  skill: () => (
    <svg {...stroke}>
      <path d="M12 3.5 14.2 9l5.8.4-4.4 3.8 1.4 5.6L12 15.8l-5 3 1.4-5.6L4 9.4 9.8 9z" />
    </svg>
  ),
  task: () => (
    <svg {...stroke}>
      <circle cx="12" cy="7" r="3" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  ),
  mcp: () => (
    <svg {...stroke}>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
      <path d="M11 7.5h4.5a2 2 0 0 1 2 2V13" />
    </svg>
  ),
  think: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      {[0, 120, 240].map((a) => (
        <path key={a} d="M12 12 9.4 7.5 12 3 14.6 7.5Z" transform={`rotate(${a} 12 12)`} />
      ))}
    </svg>
  ),
}

function Spinner() {
  return (
    <svg {...stroke} strokeWidth={2}>
      <path d="M12 3.5a8.5 8.5 0 1 1-8.5 8.5" />
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
  ToolCalls,
  ToolCall,
  ToolCallOutput,
  ToolCallDiff,
  ToolCallImage,
  ToolCallFields,
  ToolCallField,
  ToolCallFiles,
  ToolCallFile,
}
