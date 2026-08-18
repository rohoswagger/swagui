"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type TaskStatus = "pending" | "running" | "completed" | "error"

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pending",
  running: "In progress",
  completed: "Completed",
  error: "Failed",
}

function Tasks({
  className,
  title,
  status = "running",
  completed = 0,
  total,
  sticky = false,
  open,
  defaultOpen = false,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, "title"> & {
  title: React.ReactNode
  status?: TaskStatus
  completed?: number
  total?: number
  sticky?: boolean
}) {
  const count = total ?? React.Children.count(children)
  const failed = status === "error"
  const done = Math.min(Math.max(completed, 0), count)

  return (
    <CollapsiblePrimitive.Root
      {...props}
      data-slot="tasks"
      data-status={status}
      open={failed ? true : open}
      defaultOpen={failed || defaultOpen}
      aria-busy={status === "running" || undefined}
      className={cn("w-full", className)}
    >
      <div
        data-slot="tasks-summary"
        className={cn(
          "border-t border-border bg-background pt-2",
          sticky && "sticky top-0 z-10"
        )}
      >
        <CollapsiblePrimitive.Trigger
          disabled={failed}
          aria-disabled={failed || undefined}
          className={cn(
            "group/tasks flex w-full items-center gap-2 rounded-md py-1 text-left text-sm outline-none",
            "transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
            "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            failed ? "cursor-default" : "hover:text-foreground"
          )}
        >
          <Chevron
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground/55",
              "transition-transform duration-(--duration-base) ease-(--ease-swagui)",
              "group-data-[state=open]/tasks:rotate-180",
              failed && "opacity-0"
            )}
          />
          <TaskTicks status={status} completed={done} total={count} />
          <span
            className={cn(
              "min-w-0 flex-1 truncate font-medium",
              status === "error" ? "text-destructive" : "text-foreground"
            )}
          >
            {title}
          </span>
          <span className="sr-only">{STATUS_LABEL[status]}.</span>
          <span className="mono w-10 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground/65">
            {done}/{count}
          </span>
        </CollapsiblePrimitive.Trigger>
      </div>

      <CollapsiblePrimitive.Content
        data-slot="tasks-content"
        className="overflow-hidden data-[state=open]:animate-reveal data-[state=closed]:animate-conceal"
      >
        <div role="list" className="flex flex-col gap-0 pt-0.5 pb-0.5 pl-6">
          {children}
        </div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

function Task({
  className,
  title,
  meta,
  status = "pending",
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  meta?: React.ReactNode
  status?: TaskStatus
}) {
  return (
    <div
      data-slot="task"
      data-status={status}
      role="listitem"
      aria-busy={status === "running" || undefined}
      className={cn("min-w-0", className)}
      {...props}
    >
      <TaskHeader title={title} meta={meta} status={status} />
    </div>
  )
}

function TaskHeader({
  title,
  meta,
  status,
}: {
  title: React.ReactNode
  meta?: React.ReactNode
  status: TaskStatus
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 py-0.5 text-[13px]">
      <StatusMark status={status} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          status === "error"
            ? "text-destructive"
            : status === "running"
              ? "text-foreground"
              : "text-muted-foreground"
        )}
      >
        {title}
      </span>
      <span className="sr-only">{STATUS_LABEL[status]}.</span>
      {meta ? (
        <span className="mono shrink-0 pl-2 text-right text-[11px] text-muted-foreground/65">
          {meta}
        </span>
      ) : null}
    </div>
  )
}

function TaskTicks({
  status,
  completed,
  total,
}: {
  status: TaskStatus
  completed: number
  total: number
}) {
  const visible = Math.min(Math.max(total, 1), 6)

  return (
    <span aria-hidden className="flex shrink-0 items-center gap-1">
      {Array.from({ length: visible }, (_, index) => {
        const current = status === "running" && index === completed
        const failed = status === "error" && index === completed

        return (
          <span
            key={index}
            className={cn(
              "h-1 w-4 rounded-full",
              index < completed
                ? "bg-success"
                : failed
                  ? "bg-destructive"
                  : current
                    ? "bg-brand"
                    : "bg-muted-foreground/20",
              current && "animate-pulse motion-reduce:animate-none"
            )}
          />
        )
      })}
    </span>
  )
}

function StatusMark({ status }: { status: TaskStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-3.5 shrink-0 items-center justify-center",
        status === "completed"
          ? "text-success"
          : status === "error"
            ? "text-destructive"
            : status === "running"
              ? "text-brand"
              : "text-muted-foreground/50"
      )}
    >
      {status === "completed" ? (
        <CheckIcon className="size-3.5" />
      ) : status === "error" ? (
        <ErrorIcon className="size-3.5" />
      ) : status === "running" ? (
        <span className="size-2 rounded-full bg-current" />
      ) : (
        <PendingIcon className="size-3.5" />
      )}
    </span>
  )
}

const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg {...stroke} className={className}>
      <path d="m5 12.5 4 4L19 7" />
    </svg>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5M12 16.5h.01" />
    </svg>
  )
}

function PendingIcon({ className }: { className?: string }) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="12" cy="12" r="6.5" />
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

export { Tasks, Task }
