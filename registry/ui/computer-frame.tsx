import * as React from "react"

import { cn } from "@/lib/utils"

function ComputerFrame({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="computer-frame"
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background text-foreground",
        className
      )}
      {...props}
    />
  )
}

function ComputerFrameToolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="computer-frame-toolbar"
      className={cn(
        "flex h-12 shrink-0 flex-row items-center gap-2 border-b border-border bg-muted/40 px-3",
        className
      )}
      {...props}
    />
  )
}

function ComputerFrameAddress({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="computer-frame-address"
      className={cn(
        "min-w-0 flex-1 truncate text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function ComputerFrameContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="computer-frame-content"
      className={cn("min-h-0 flex-1 overflow-auto", className)}
      {...props}
    />
  )
}

function ComputerFrameFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="computer-frame-footer"
      className={cn(
        "flex h-7 shrink-0 flex-row items-center gap-2 border-t border-border bg-muted/40 px-3 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  ComputerFrame,
  ComputerFrameAddress,
  ComputerFrameContent,
  ComputerFrameFooter,
  ComputerFrameToolbar,
}
