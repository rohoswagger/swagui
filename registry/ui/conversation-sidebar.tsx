"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  AgentWorkingMark,
  type AgentWorkingMarkVariant,
} from "@/registry/ui/agent-working-mark"

type ConversationStatus = "working" | "done" | "needs-input" | "failed" | "cancelled"

const STATUS_LABEL: Record<ConversationStatus, string> = {
  working: "Working",
  done: "Done",
  "needs-input": "Needs input",
  failed: "Failed",
  cancelled: "Cancelled",
}

function ConversationSidebar({
  open,
  onOpenChange,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"aside"> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const asideRef = React.useRef<HTMLElement>(null)
  const backdropRef = React.useRef<HTMLButtonElement>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onOpenChange, open])

  React.useEffect(() => {
    if (!open || !isMobile) return

    const aside = asideRef.current
    const parent = aside?.parentElement
    if (!aside || !parent) return

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const siblings = Array.from(parent.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element !== aside &&
        element !== backdropRef.current
    )
    const previousStates = siblings.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }))

    siblings.forEach((element) => {
      element.inert = true
      element.setAttribute("aria-hidden", "true")
    })
    aside.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus()

    return () => {
      previousStates.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert
        if (ariaHidden === null) element.removeAttribute("aria-hidden")
        else element.setAttribute("aria-hidden", ariaHidden)
      })
      previousFocus?.focus()
    }
  }, [isMobile, open])

  return (
    <>
      <button
        type="button"
        ref={backdropRef}
        aria-label="Close conversation sidebar"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
        className={cn(
          "absolute inset-0 z-30 bg-foreground/12 opacity-0 transition-opacity duration-(--duration-base) ease-(--ease-swagui) md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none"
        )}
      />
      <aside
        ref={asideRef}
        data-slot="conversation-sidebar"
        data-state={open ? "open" : "closed"}
        role={open && isMobile ? "dialog" : undefined}
        aria-modal={open && isMobile ? true : undefined}
        aria-label="Conversation history"
        inert={!open && isMobile ? true : undefined}
        className={cn(
          "group/conversation-sidebar absolute inset-y-0 left-0 z-40 h-full w-[min(18rem,calc(100vw-2rem))] -translate-x-full text-sidebar-foreground",
          "transition-transform duration-(--duration-base) ease-(--ease-swagui)",
          open && "translate-x-0",
          "md:relative md:inset-auto md:z-40 md:w-11 md:translate-x-0 md:overflow-visible",
          className
        )}
        {...props}
      >
        <div
          data-slot="conversation-sidebar-surface"
          className={cn(
            "h-full w-full overflow-hidden border-r border-sidebar-border bg-sidebar shadow-(--shadow-raised)",
            "transition-[width,box-shadow] duration-(--duration-base) ease-(--ease-swagui)",
            "md:absolute md:inset-y-0 md:left-0 md:w-11 md:shadow-none",
            open && "md:w-64 md:shadow-(--shadow-raised)"
          )}
        >
          <div className="group-data-[state=closed]/conversation-sidebar:w-11 flex h-full w-full flex-col py-2 pr-2 pl-1.5 md:w-64">
            {children}
          </div>
        </div>
      </aside>
    </>
  )
}

function ConversationSidebarToggle({
  className,
  icon,
  hoverIcon,
  label,
  open,
  closeIcon,
  closeLabel = "Close conversation sidebar",
  onClose,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  icon: React.ReactNode
  hoverIcon?: React.ReactNode
  label: React.ReactNode
  open: boolean
  closeIcon?: React.ReactNode
  closeLabel?: string
  onClose?: () => void
}) {
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const showHoverIcon = !open && !!hoverIcon && (hovered || focused)

  React.useEffect(() => {
    setHovered(false)
    setFocused(false)
  }, [open])

  return (
    <div
      data-slot="conversation-sidebar-toggle"
      className={cn(
        "relative flex h-8 w-full -translate-y-[2.5px] items-center",
        className
      )}
    >
      {!open ? (
        <button
          type="button"
          onClick={(event) => {
            setHovered(false)
            setFocused(false)
            onClick?.(event)
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={(event) => setFocused(event.currentTarget.matches(":focus-visible"))}
          onBlur={() => setFocused(false)}
          className="absolute left-0 h-8 w-[31px] rounded-md outline-none transition-colors duration-(--duration-fast) ease-(--ease-swagui) hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring/60"
          {...props}
        >
          <span className="sr-only">{label}</span>
        </button>
      ) : null}
      <span
        data-slot="conversation-sidebar-logo"
        className="pointer-events-none absolute left-[5.5px] flex size-5 items-center justify-center"
      >
        {showHoverIcon ? <span className="[&>svg]:size-4">{hoverIcon}</span> : icon}
      </span>
      {open ? (
        <span className="min-w-0 truncate pr-10 pl-[34.5px] text-[13px] font-medium">
          {label}
        </span>
      ) : null}
      {open && closeIcon ? (
        <button
          type="button"
          aria-label={closeLabel}
          title={closeLabel}
          onClick={() => {
            setHovered(false)
            setFocused(false)
            onClose?.()
          }}
          className="absolute right-0 flex size-8 items-center justify-center rounded-md text-sidebar-foreground/65 outline-none transition-colors duration-(--duration-fast) ease-(--ease-swagui) hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/60 [&>svg]:size-4"
        >
          {closeIcon}
        </button>
      ) : null}
    </div>
  )
}

function ConversationSidebarActions({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="conversation-sidebar-actions"
      className={cn("mt-3 flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function ConversationSidebarAction({
  className,
  icon,
  children,
  ...props
}: React.ComponentProps<"button"> & { icon: React.ReactNode }) {
  return (
    <button
      type="button"
      data-slot="conversation-sidebar-action"
      aria-label={typeof children === "string" ? children : undefined}
      className={cn(
        "relative flex h-8 w-full items-center rounded-md pr-2 text-left text-[13px] text-sidebar-foreground/72 outline-none",
        "transition-colors duration-(--duration-fast) ease-(--ease-swagui) hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/60",
        "group-data-[state=closed]/conversation-sidebar:mx-auto group-data-[state=closed]/conversation-sidebar:w-[31px] group-data-[state=closed]/conversation-sidebar:pr-0",
        className
      )}
      {...props}
    >
      <span className="absolute left-[5.5px] flex size-5 items-center justify-center [&>svg]:size-4">{icon}</span>
      <span className="min-w-0 truncate pl-[33.5px] group-data-[state=closed]/conversation-sidebar:hidden">
        {children}
      </span>
    </button>
  )
}

function ConversationSidebarPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="conversation-sidebar-panel"
      className={cn(
        "mt-4 flex min-h-0 flex-1 flex-col opacity-100 transition-opacity duration-(--duration-fast)",
        "group-data-[state=closed]/conversation-sidebar:invisible group-data-[state=closed]/conversation-sidebar:pointer-events-none group-data-[state=closed]/conversation-sidebar:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function ConversationSidebarGroup({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="conversation-sidebar-group"
      className={cn("min-h-0", className)}
      {...props}
    />
  )
}

function ConversationSidebarGroupLabel({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="conversation-sidebar-group-label"
      className={cn("px-2 pb-1.5 text-[11px] font-medium text-sidebar-foreground/58", className)}
      {...props}
    />
  )
}

function ConversationSidebarList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="conversation-sidebar-list"
      role="list"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function ConversationSidebarItem({
  className,
  title,
  status,
  duration = 0,
  active = false,
  workingMark = "mobius",
  ...props
}: Omit<React.ComponentProps<"button">, "title"> & {
  title: React.ReactNode
  status: ConversationStatus
  duration?: number
  active?: boolean
  workingMark?: AgentWorkingMarkVariant
}) {
  const [elapsed, setElapsed] = React.useState(duration)

  React.useEffect(() => {
    setElapsed(duration)
    if (status !== "working") return

    const started = Date.now()
    const id = window.setInterval(() => {
      setElapsed(duration + Math.floor((Date.now() - started) / 1000))
    }, 1000)

    return () => window.clearInterval(id)
  }, [duration, status])

  return (
    <div role="listitem" className="min-w-0">
      <button
        type="button"
        data-slot="conversation-sidebar-item"
        data-status={status}
        data-active={active || undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/item flex w-full min-w-0 flex-col gap-0.5 rounded-md px-2 py-1.5 text-left outline-none",
          "transition-colors duration-(--duration-fast) ease-(--ease-swagui) hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring/60",
          active && "bg-sidebar-accent text-sidebar-accent-foreground",
          className
        )}
        {...props}
      >
        <span className="w-full truncate text-[13px] font-medium">{title}</span>
        <span className="flex h-4 w-full items-center gap-1.5 text-[10px] text-sidebar-foreground/60">
          <ConversationSidebarStateMark status={status} workingMark={workingMark} />
          <span>{STATUS_LABEL[status]}</span>
          {duration > 0 || status === "working" ? (
            <>
              <span aria-hidden>·</span>
              <span className="font-mono tabular-nums">{formatDuration(elapsed)}</span>
            </>
          ) : null}
        </span>
      </button>
    </div>
  )
}

function ConversationSidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="conversation-sidebar-footer"
      className={cn(
        "mt-auto min-w-0 border-t border-sidebar-border pt-2 opacity-100 transition-opacity duration-(--duration-fast)",
        "group-data-[state=closed]/conversation-sidebar:invisible group-data-[state=closed]/conversation-sidebar:pointer-events-none group-data-[state=closed]/conversation-sidebar:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function ConversationSidebarStateMark({
  status,
  workingMark,
}: {
  status: ConversationStatus
  workingMark: AgentWorkingMarkVariant
}) {
  if (status === "working") {
    return <AgentWorkingMark variant={workingMark} size={12} label="Working" />
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-3 shrink-0 items-center justify-center",
        status === "done" && "text-success",
        status === "needs-input" && "text-amber-600 dark:text-amber-400",
        (status === "failed" || status === "cancelled") && "text-destructive"
      )}
    >
      {status === "done" ? <CheckIcon /> : status === "needs-input" ? <InputIcon /> : <CrossIcon />}
    </span>
  )
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-3",
}

function CheckIcon() {
  return <svg {...iconProps}><path d="m5 12.5 4 4L19 7" /></svg>
}

function InputIcon() {
  return <svg {...iconProps}><path d="M12 3v10M8 9l4 4 4-4M5 21h14" /></svg>
}

function CrossIcon() {
  return <svg {...iconProps}><path d="m7 7 10 10M17 7 7 17" /></svg>
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

export {
  ConversationSidebar,
  ConversationSidebarAction,
  ConversationSidebarActions,
  ConversationSidebarFooter,
  ConversationSidebarGroup,
  ConversationSidebarGroupLabel,
  ConversationSidebarItem,
  ConversationSidebarList,
  ConversationSidebarPanel,
  ConversationSidebarToggle,
  type ConversationStatus,
}
