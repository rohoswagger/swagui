"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/ui/button"
import { Input } from "@/registry/ui/input"
import {
  Request,
  RequestActions,
  RequestContent,
  RequestDescription,
  RequestQuestion,
  RequestReceipt,
  type RequestStatus,
} from "@/registry/ui/request"
import { Textarea } from "@/registry/ui/textarea"

const RESOLVE_MS = 260

type InputRequestContextValue = {
  status: RequestStatus
  resolving: boolean
  summary: string
  cancel: () => void
}

const InputRequestContext = React.createContext<InputRequestContextValue | null>(null)

function useInputRequest(component: string) {
  const context = React.useContext(InputRequestContext)
  if (!context) throw new Error(`${component} must be used within <InputRequest>`)
  return context
}

function InputRequest(
  allProps: Omit<React.ComponentProps<typeof Request>, "status" | "resolving" | "children"> & {
    status?: RequestStatus
    defaultStatus?: RequestStatus
    onStatusChange?: (status: RequestStatus) => void
    onSubmitData?: (data: FormData) => void
    onCancel?: () => void
    children: React.ReactNode
  }
) {
  const {
    status: controlled,
    defaultStatus = "pending",
    onStatusChange,
    onSubmitData,
    onCancel,
    children,
    ...requestProps
  } = allProps
  const isControlled = "status" in allProps
  const [uncontrolled, setUncontrolled] = React.useState<RequestStatus>(defaultStatus)
  const [resolving, setResolving] = React.useState(false)
  const [summary, setSummary] = React.useState("")
  const timer = React.useRef<number | undefined>(undefined)
  const status = isControlled ? (controlled ?? "pending") : uncontrolled

  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  React.useEffect(() => {
    if (status === "pending") {
      window.clearTimeout(timer.current)
      setResolving(false)
      setSummary("")
    }
  }, [status])

  const commitStatus = React.useCallback(
    (next: RequestStatus) => {
      if (!isControlled) setUncontrolled(next)
      onStatusChange?.(next)
    },
    [isControlled, onStatusChange]
  )

  const settle = React.useCallback(
    (next: Exclude<RequestStatus, "pending">) => {
      if (resolving || status !== "pending") return
      setResolving(true)
      timer.current = window.setTimeout(() => {
        commitStatus(next)
        setResolving(false)
      }, RESOLVE_MS)
    },
    [commitStatus, resolving, status]
  )

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (resolving || status !== "pending") return
      const data = new FormData(event.currentTarget)
      setSummary(summarize(event.currentTarget, data))
      onSubmitData?.(data)
      settle("submitted")
    },
    [onSubmitData, resolving, settle, status]
  )

  const cancel = React.useCallback(() => {
    if (resolving || status !== "pending") return
    onCancel?.()
    settle("cancelled")
  }, [onCancel, resolving, settle, status])

  const context = React.useMemo(
    () => ({ status, resolving, summary, cancel }),
    [cancel, resolving, status, summary]
  )

  return (
    <InputRequestContext.Provider value={context}>
      <Request status={status} resolving={resolving} {...requestProps}>
        <form key={status} data-slot="input-request" onSubmit={handleSubmit}>
          {children}
        </form>
      </Request>
    </InputRequestContext.Provider>
  )
}

const InputRequestQuestion = RequestQuestion
const InputRequestDescription = RequestDescription
const InputRequestContent = RequestContent
const InputRequestActions = RequestActions

function InputRequestField({
  className,
  label,
  hint,
  children,
  ...props
}: React.ComponentProps<"label"> & {
  label: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <label
      data-slot="input-request-field"
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
      {...props}
    >
      <span className="text-[12px] font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="text-[11.5px] text-muted-foreground">{hint}</span> : null}
    </label>
  )
}

function InputRequestInput({
  className,
  unit,
  "aria-describedby": describedBy,
  ...props
}: React.ComponentProps<typeof Input> & { unit?: React.ReactNode }) {
  const unitId = React.useId()

  if (!unit) {
    return (
      <Input
        data-slot="input-request-input"
        aria-describedby={describedBy}
        className={cn("h-8 text-[13px]", className)}
        {...props}
      />
    )
  }

  return (
    <span data-slot="input-request-input-shell" className="relative block min-w-0">
      <Input
        data-slot="input-request-input"
        data-request-unit={typeof unit === "string" ? unit : undefined}
        aria-describedby={[describedBy, unitId].filter(Boolean).join(" ")}
        className={cn("h-8 pr-20 text-[13px]", className)}
        {...props}
      />
      <span
        id={unitId}
        data-slot="input-request-unit"
        className="pointer-events-none absolute top-1/2 right-9 -translate-y-1/2 text-[11.5px] text-muted-foreground"
      >
        {unit}
      </span>
    </span>
  )
}

function InputRequestText({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="input-request-text"
      className={cn("min-h-20 resize-y text-[13px]", className)}
      {...props}
    />
  )
}

function InputRequestChoices({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-request-choices"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function InputRequestChoice({
  className,
  type = "radio",
  label,
  hint,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  type?: "radio" | "checkbox"
  label: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <label
      data-slot="input-request-choice"
      className={cn(
        "group/choice relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-left outline-none",
        "transition-[background-color,border-color] duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:bg-accent has-[:checked]:border-brand/55 has-[:checked]:bg-brand/5",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/60 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-card",
        className
      )}
    >
      <input
        type={type}
        data-request-label={typeof label === "string" ? label : undefined}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border border-border bg-background",
          type === "radio" ? "rounded-full" : "rounded-[5px]",
          "group-has-[:checked]/choice:border-brand group-has-[:checked]/choice:bg-brand group-has-[:checked]/choice:text-white"
        )}
      >
        {type === "radio" ? (
          <span className="size-1.5 rounded-full bg-current opacity-0 group-has-[:checked]/choice:opacity-100" />
        ) : (
          <CheckIcon className="size-2.5 opacity-0 group-has-[:checked]/choice:opacity-100" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-medium text-foreground">{label}</span>
      {hint ? <span className="truncate text-[11.5px] text-muted-foreground">{hint}</span> : null}
    </label>
  )
}

function InputRequestFile({
  className,
  label = "Choose files",
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label?: React.ReactNode }) {
  const [files, setFiles] = React.useState<string[]>([])

  return (
    <label
      data-slot="input-request-file"
      className={cn("flex min-w-0 cursor-pointer items-center gap-2", className)}
    >
      <input
        type="file"
        className="sr-only"
        onChange={(event) => {
          setFiles(Array.from(event.currentTarget.files ?? []).map((file) => file.name))
          onChange?.(event)
        }}
        {...props}
      />
      <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[12.5px] font-medium shadow-(--shadow-hairline) hover:bg-accent">
        <PaperclipIcon />
        {label}
      </span>
      <span className="min-w-0 truncate text-[11.5px] text-muted-foreground">
        {files.length ? files.join(", ") : "No file selected"}
      </span>
    </label>
  )
}

function InputRequestSubmit({
  children = "Submit",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { resolving } = useInputRequest("InputRequestSubmit")
  return (
    <Button type="submit" size="sm" disabled={resolving} {...props}>
      {children}
    </Button>
  )
}

function InputRequestCancel({
  children = "Skip",
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { resolving, cancel } = useInputRequest("InputRequestCancel")
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={resolving}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) cancel()
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

function InputRequestReceipt({ children, ...props }: React.ComponentProps<typeof RequestReceipt>) {
  const { status, summary } = useInputRequest("InputRequestReceipt")
  return (
    <RequestReceipt {...props}>
      {children ?? (status === "cancelled" ? "Skipped" : summary || "Submitted")}
    </RequestReceipt>
  )
}

function summarize(form: HTMLFormElement, data: FormData) {
  const values: string[] = []
  const controls = Array.from(form.elements).filter(
    (element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
  )

  for (const [name, value] of data.entries()) {
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (!trimmed) continue
      const control = controls.find((element) => {
        if (element.name !== name) return false
        if (element instanceof HTMLInputElement && ["radio", "checkbox"].includes(element.type)) {
          return element.checked && element.value === value
        }
        return true
      })
      const label = control?.dataset.requestLabel
      const unit = control?.dataset.requestUnit
      values.push(label ?? `${trimmed}${unit ? ` ${unit}` : ""}`)
    } else if (value.name) {
      values.push(value.name)
    }
  }
  return values.join(", ")
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5">
      <path d="m21.4 11.6-8.8 8.8a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="m5 12.5 4 4L19 7" />
    </svg>
  )
}

export {
  InputRequest,
  InputRequestActions,
  InputRequestCancel,
  InputRequestChoice,
  InputRequestChoices,
  InputRequestContent,
  InputRequestDescription,
  InputRequestField,
  InputRequestFile,
  InputRequestInput,
  InputRequestQuestion,
  InputRequestReceipt,
  InputRequestSubmit,
  InputRequestText,
  type RequestStatus as InputRequestStatus,
}
