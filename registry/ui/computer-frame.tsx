import * as React from "react"

import { cn } from "@/lib/utils"
import { TabsList, TabsTrigger } from "@/registry/ui/tabs"

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

function ComputerFrameTabs({
  className,
  variant = "line",
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      data-slot="computer-frame-tabs"
      variant={variant}
      className={cn(
        "flex h-8 min-h-8 w-full shrink-0 items-end justify-start gap-0 rounded-none border-b border-border bg-muted/40 px-2 pt-0 group-data-[orientation=horizontal]/tabs:h-8",
        className
      )}
      {...props}
    />
  )
}

function ComputerFrameTabItem({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      data-slot="computer-frame-tab-item"
      className={cn(
        "group/computer-frame-tab-item flex min-w-24 flex-none items-center",
        className
      )}
      {...props}
    />
  )
}

function ComputerFrameTabAction({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      data-slot="computer-frame-tab-action"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function ComputerFrameTab({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      ref={ref}
      data-slot="computer-frame-tab"
      className={cn(
        "h-[calc(100%-1px)] max-w-48 flex-none rounded-t-md rounded-b-none px-2 text-xs after:hidden data-[state=active]:bg-background group-data-[variant=line]/tabs-list:data-[state=active]:!bg-card",
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
  ComputerFrameTab,
  ComputerFrameTabAction,
  ComputerFrameTabItem,
  ComputerFrameTabs,
  ComputerFrameToolbar,
}
