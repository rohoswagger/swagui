"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type RequestStatus = "pending" | "submitted" | "cancelled"

type RequestContextValue = {
  status: RequestStatus
  resolving: boolean
  settled: boolean
  questionId: string
}

const RequestContext = React.createContext<RequestContextValue | null>(null)

function useRequest(component: string) {
  const context = React.useContext(RequestContext)
  if (!context) throw new Error(`${component} must be used within <Request>`)
  return context
}

function RequestCollapse({
  collapsed,
  children,
}: {
  collapsed: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-(--duration-base) ease-(--ease-out-expo)",
        "motion-reduce:transition-none",
        collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
      )}
      inert={collapsed || undefined}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}

function Request({
  className,
  status = "pending",
  resolving = false,
  tone = "default",
  style,
  "aria-labelledby": labelledBy,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  status?: RequestStatus
  resolving?: boolean
  tone?: "default" | "danger"
}) {
  const settled = status !== "pending"
  const questionId = React.useId()
  const context = React.useMemo(
    () => ({ status, resolving, settled, questionId }),
    [questionId, resolving, settled, status]
  )

  return (
    <RequestContext.Provider value={context}>
      <div
        data-slot="request"
        data-status={status}
        data-resolving={resolving || undefined}
        role={settled ? undefined : "group"}
        aria-labelledby={settled ? undefined : (labelledBy ?? questionId)}
        className={cn(
          "snake relative mx-auto w-full max-w-[46ch] overflow-hidden rounded-xl bg-card shadow-(--shadow-raised)",
          "after:transition-opacity after:duration-(--duration-fast) after:ease-(--ease-out-expo)",
          settled && "after:opacity-0 wave-once",
          className
        )}
        style={{
          ...(tone === "danger" ? { "--wave-tone": "var(--destructive)" } : null),
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        <div
          className={cn(
            "flex flex-col transition-[padding] duration-(--duration-base) ease-(--ease-out-expo)",
            resolving || settled ? "p-2" : "p-3"
          )}
        >
          {children}
        </div>
      </div>
    </RequestContext.Provider>
  )
}

function RequestQuestion({ className, children, id, ...props }: React.ComponentProps<"p">) {
  const { questionId, resolving, settled } = useRequest("RequestQuestion")
  if (settled) return null

  return (
    <RequestCollapse collapsed={resolving}>
      <p
        id={id ?? questionId}
        data-slot="request-question"
        className={cn(
          "text-[13.5px] leading-snug font-medium text-balance text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </p>
    </RequestCollapse>
  )
}

function RequestDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { resolving, settled } = useRequest("RequestDescription")
  if (settled) return null

  return (
    <RequestCollapse collapsed={resolving}>
      <p
        data-slot="request-description"
        className={cn("pt-1 text-[12.5px] leading-normal text-muted-foreground", className)}
        {...props}
      />
    </RequestCollapse>
  )
}

function RequestContent({ className, ...props }: React.ComponentProps<"div">) {
  const { resolving, settled } = useRequest("RequestContent")
  if (settled) return null

  return (
    <RequestCollapse collapsed={resolving}>
      <div
        data-slot="request-content"
        className={cn("flex flex-col gap-2 pt-2", className)}
        {...props}
      />
    </RequestCollapse>
  )
}

function RequestActions({ className, ...props }: React.ComponentProps<"div">) {
  const { resolving, settled } = useRequest("RequestActions")
  if (settled) return null

  return (
    <RequestCollapse collapsed={resolving}>
      <div
        data-slot="request-actions"
        className={cn("flex items-center gap-2 pt-2", className)}
        {...props}
      />
    </RequestCollapse>
  )
}

function RequestReceipt({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { status, settling } = useReceiptState()
  if (!settling) return null

  const cancelled = status === "cancelled"
  return (
    <div
      data-slot="request-receipt"
      data-status={status}
      aria-live="polite"
      className={cn(
        "flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full",
          cancelled ? "bg-muted text-muted-foreground" : "bg-success text-white"
        )}
      >
        {cancelled ? <CrossIcon /> : <CheckIcon />}
      </span>
      <span className="min-w-0 flex-1">{children ?? (cancelled ? "Skipped" : "Submitted")}</span>
    </div>
  )
}

function useReceiptState() {
  const { status, resolving, settled } = useRequest("RequestReceipt")
  return { status, settling: settled && !resolving }
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-3",
}

function CheckIcon() {
  return <svg {...iconProps}><path d="m5 12.5 4 4L19 7" /></svg>
}

function CrossIcon() {
  return <svg {...iconProps}><path d="m7 7 10 10M17 7 7 17" /></svg>
}

export {
  Request,
  RequestActions,
  RequestCollapse,
  RequestContent,
  RequestDescription,
  RequestQuestion,
  RequestReceipt,
  useRequest,
  type RequestStatus,
}
