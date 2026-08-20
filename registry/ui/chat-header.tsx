import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/ui/button"

function ChatHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="chat-header"
      className={cn(
        "flex h-11 shrink-0 items-center gap-3 border-b border-border bg-background px-3",
        className
      )}
      {...props}
    />
  )
}

function ChatHeaderIdentity({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-header-identity"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Host-provided wordmark that can also act as the route back to the root thread. */
function ChatHeaderHome({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="chat-header-home"
      className={cn(
        "inline-flex min-w-0 shrink-0 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground outline-none",
        "transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
        className
      )}
      {...props}
    />
  )
}

function ChatHeaderDivider({ className, children = "/", ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="chat-header-divider"
      aria-hidden
      className={cn("shrink-0 text-muted-foreground/45", className)}
      {...props}
    >
      {children}
    </span>
  )
}

function ChatHeaderTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="chat-header-title"
      className={cn("min-w-0 flex-1 truncate text-sm font-medium", className)}
      {...props}
    />
  )
}

function ChatHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-header-actions"
      className={cn("ms-auto flex shrink-0 items-center gap-1.5", className)}
      {...props}
    />
  )
}

function ChatHeaderAction({
  className,
  label,
  size = "sm",
  variant = "outline",
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      type="button"
      data-slot="chat-header-action"
      aria-label={label}
      title={label}
      size={size}
      variant={variant}
      className={cn("rounded-lg", className)}
      {...props}
    >
      {children}
    </Button>
  )
}

function ChatHeaderBack({
  className,
  children = "Back to main",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      data-slot="chat-header-back"
      variant="ghost"
      size="sm"
      className={cn("rounded-lg px-2", className)}
      {...props}
    >
      <BackIcon />
      <span className="hidden sm:inline">{children}</span>
      <span className="sr-only sm:hidden">{children}</span>
    </Button>
  )
}

function ChatHeaderBreadcrumbs({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="chat-header-breadcrumbs"
      aria-label="Agent thread"
      className={cn("flex min-w-0 flex-1 items-center gap-1.5", className)}
      {...props}
    />
  )
}

function ChatHeaderBreadcrumb({
  className,
  current = false,
  children,
  ...props
}: React.ComponentProps<"button"> & { current?: boolean }) {
  if (current) {
    return (
      <span
        data-slot="chat-header-breadcrumb"
        aria-current="page"
        className={cn("min-w-0 truncate text-sm font-medium text-foreground", className)}
        {...props}
      >
        {children}
      </span>
    )
  }

  return (
    <button
      type="button"
      data-slot="chat-header-breadcrumb"
      className={cn(
        "min-w-0 truncate rounded-md px-1 py-0.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function ChatHeaderBreadcrumbSeparator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="chat-header-breadcrumb-separator"
      aria-hidden
      className={cn("shrink-0 text-muted-foreground/40", className)}
      {...props}
    >
      /
    </span>
  )
}

function ChatHeaderShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="chat-header-shortcut"
      className={cn(
        "hidden h-4 min-w-4 items-center justify-center rounded-sm border border-border bg-muted px-1 font-mono text-[9px] font-normal text-muted-foreground sm:inline-flex",
        className
      )}
      {...props}
    />
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export {
  ChatHeader,
  ChatHeaderIdentity,
  ChatHeaderHome,
  ChatHeaderDivider,
  ChatHeaderTitle,
  ChatHeaderActions,
  ChatHeaderAction,
  ChatHeaderBack,
  ChatHeaderBreadcrumbs,
  ChatHeaderBreadcrumb,
  ChatHeaderBreadcrumbSeparator,
  ChatHeaderShortcut,
}
