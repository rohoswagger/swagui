import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/ui/button"

function ChatHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="chat-header"
      className={cn(
        "flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-3",
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
      className={cn("ml-auto flex shrink-0 items-center gap-1.5", className)}
      {...props}
    />
  )
}

function ChatHeaderAction({
  className,
  label,
  size = "icon-sm",
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

export {
  ChatHeader,
  ChatHeaderIdentity,
  ChatHeaderDivider,
  ChatHeaderTitle,
  ChatHeaderActions,
  ChatHeaderAction,
  ChatHeaderShortcut,
}
