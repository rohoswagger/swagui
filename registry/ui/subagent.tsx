"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SubagentStatus = "pending" | "running" | "completed" | "failed" | "cancelled"

const STATUS_LABEL: Record<SubagentStatus, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
}

const AGENT_COLORS = [
  "text-sky-600 dark:text-sky-400",
  "text-violet-600 dark:text-violet-400",
  "text-amber-600 dark:text-amber-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-rose-600 dark:text-rose-400",
  "text-cyan-700 dark:text-cyan-400",
  "text-fuchsia-600 dark:text-fuchsia-400",
] as const

function Subagents({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="subagents"
      role="list"
      className={cn("flex w-full flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function Subagent({
  className,
  name,
  description,
  duration = 0,
  status = "pending",
  onOpen,
  ...props
}: Omit<React.HTMLAttributes<HTMLElement>, "title" | "onClick"> & {
  name: React.ReactNode
  description?: React.ReactNode
  /** Elapsed seconds. Running agents continue counting from this value. */
  duration?: number
  status?: SubagentStatus
  onOpen?: () => void
}) {
  const navigable = status !== "pending" && status !== "cancelled" && !!onOpen
  const generatedId = React.useId()
  const colorIndex = hashIdentity(typeof name === "string" ? name : generatedId) % AGENT_COLORS.length
  const [elapsed, setElapsed] = React.useState(duration)

  React.useEffect(() => {
    setElapsed(duration)
    if (status !== "running") return

    const started = Date.now()
    const id = window.setInterval(() => {
      setElapsed(duration + Math.floor((Date.now() - started) / 1000))
    }, 1000)

    return () => window.clearInterval(id)
  }, [duration, status])

  const content = (
    <>
      {status === "running" ? <SubagentTrail /> : null}
      <SubagentMark color={AGENT_COLORS[colorIndex]} colorIndex={colorIndex} />
      <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
        <span className="max-w-[45%] shrink-0 truncate text-[13px] font-medium text-foreground">
          {name}
        </span>
        <span className="sr-only">{STATUS_LABEL[status]}.</span>
        {description ? (
          <>
            <span aria-hidden className="shrink-0 text-[10px] text-muted-foreground/45">·</span>
            <span className="min-w-0 truncate text-[12px] text-muted-foreground">{description}</span>
          </>
        ) : null}
      </span>
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/70">
        {formatDuration(elapsed)}
      </span>
      <SubagentStateMark status={status} navigable={navigable} />
    </>
  )

  const classes = cn(
    "relative flex min-h-8 w-full min-w-0 items-center gap-2 rounded-md border border-transparent bg-brand/7 px-1.5 py-1 text-left",
    "transition-[background-color,transform] duration-(--duration-fast) ease-(--ease-swagui)",
    navigable && "cursor-pointer hover:bg-brand/11 active:scale-[0.997] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
    className
  )

  if (navigable) {
    return (
      <div role="listitem" className="min-w-0">
        <button
          type="button"
          data-slot="subagent"
          data-status={status}
          onClick={onOpen}
          className={classes}
          {...props}
        >
          {content}
        </button>
      </div>
    )
  }

  return (
    <div
      data-slot="subagent"
      data-status={status}
      role="listitem"
      className={classes}
      {...props}
    >
      {content}
    </div>
  )
}

function SubagentMark({ color, colorIndex }: { color: string; colorIndex: number }) {
  return (
    <span
      aria-hidden
      data-slot="subagent-identity"
      data-color-index={colorIndex}
      className={cn("relative flex size-4 shrink-0 items-center justify-center", color)}
    >
      <AgentGlyph />
    </span>
  )
}

function SubagentStateMark({ status, navigable }: { status: SubagentStatus; navigable: boolean }) {
  const mark = status === "completed"
    ? <Check />
    : status === "failed" || status === "cancelled"
      ? <Cross />
      : navigable
        ? <Chevron />
        : null

  if (!mark) return null

  return (
    <span
      aria-hidden
      data-slot="subagent-state-mark"
      data-status={status}
      className={cn(
        "flex size-3.5 shrink-0 items-center justify-center",
        status === "completed" && "text-success",
        (status === "failed" || status === "cancelled") && "text-destructive"
      )}
    >
      {mark}
    </span>
  )
}

function SubagentTrail() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      preserveAspectRatio="none"
    >
      <rect
        x="1"
        y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        pathLength="100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="14 86"
        vectorEffect="non-scaling-stroke"
        className="subagent-trail text-brand [rx:calc(var(--radius-md)-1px)] [ry:calc(var(--radius-md)-1px)]"
      />
    </svg>
  )
}

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-3.5",
}

function AgentGlyph() {
  return <svg {...icon}><circle cx="12" cy="8" r="3" /><path d="M6 20a6 6 0 0 1 12 0" /></svg>
}

function Chevron() {
  return <svg {...icon} className="size-3 text-muted-foreground/55"><path d="m9 6 6 6-6 6" /></svg>
}

function Check() {
  return <svg {...icon} className="size-3.5"><path d="m5 12.5 4 4L19 7" /></svg>
}

function Cross() {
  return <svg {...icon} className="size-3.5"><path d="m7 7 10 10M17 7 7 17" /></svg>
}

function hashIdentity(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

export { Subagents, Subagent }
