"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  Request,
  RequestCollapse,
  RequestDescription,
  RequestQuestion,
} from "@/registry/ui/request"

/**
 * Authorization for a known action. Request owns the shared blocking shell;
 * Approval adds decision selection, destructive intent and a durable record
 * of what the user allowed or declined.
 *
 * `multiple` stages several decisions before one explicit confirmation.
 */

/**
 * Covers the collapse without outlasting it. Every part of the card clears on
 * the same duration and curve, so the surviving answer makes one continuous
 * move up rather than being shunted several times as neighbours vanish at
 * different moments.
 */
const RESOLVE_MS = 300

type ApprovalContextValue = {
  multiple: boolean
  answered: boolean
  /** Values chosen but not yet submitted. Only meaningful when multiple. */
  selection: string[]
  /** The values that survive the collapse, while it is running. */
  resolving: string[] | null
  isChosen: (value: string) => boolean
  onOption: (value: string, intent?: "default" | "danger") => void
  submit: () => void
}

const ApprovalContext = React.createContext<ApprovalContextValue | null>(null)

function useApproval(component: string) {
  const context = React.useContext(ApprovalContext)
  if (!context) {
    throw new Error(`${component} must be used within <Approval>`)
  }
  return context
}

/**
 * Collapses a block to nothing, height included, rather than cutting it.
 *
 * Exits faster than anything enters, and on a plain deceleration curve — an
 * overshoot on something disappearing reads as a glitch rather than as weight.
 * Under reduced motion it simply goes, since the height change is the movement.
 */
function Approval(
  allProps: Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
    value?: string | string[]
    defaultValue?: string | string[]
    onValueChange?: (value: never) => void
    /** Pick several, then confirm. Values become an array. */
    multiple?: boolean
  }
) {
  const {
    className,
    value: controlled,
    defaultValue,
    onValueChange,
    multiple = false,
    children,
    ...props
  } = allProps

  /*
    Detected by whether the prop was passed at all, not by whether it is
    undefined. `undefined` is a real state here — it means unanswered — so the
    usual `value !== undefined` check would treat a reset back to unanswered as
    a switch to uncontrolled and fall back to stale internal state, leaving the
    card stuck on its old answer.
  */
  const isControlled = "value" in allProps

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [selection, setSelection] = React.useState<string[]>([])
  const [resolving, setResolving] = React.useState<string[] | null>(null)
  const [tone, setTone] = React.useState<"default" | "danger">("default")

  const value = isControlled ? controlled : uncontrolled
  const answered = value !== undefined

  const committed = React.useMemo(
    () => (value === undefined ? [] : Array.isArray(value) ? value : [value]),
    [value]
  )

  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  // A reset has to clear an in-flight acknowledgement and the working picks
  // too, or the card would settle again a moment after being cleared.
  React.useEffect(() => {
    if (!answered) {
      window.clearTimeout(timer.current)
      setResolving(null)
      setSelection([])
      setTone("default")
    }
  }, [answered])

  const commit = React.useCallback(
    (next: string | string[]) => {
      setResolving(Array.isArray(next) ? next : [next])
      timer.current = window.setTimeout(() => {
        if (!isControlled) setUncontrolled(next)
        ;(onValueChange as ((v: string | string[]) => void) | undefined)?.(next)
        setResolving(null)
      }, RESOLVE_MS)
    },
    [isControlled, onValueChange]
  )

  const onOption = React.useCallback(
    (next: string, intent: "default" | "danger" = "default") => {
      if (resolving) return
      setTone(intent)
      // Multiple only gathers picks; nothing is decided until the confirm.
      if (multiple) {
        setSelection((s) =>
          s.includes(next) ? s.filter((v) => v !== next) : [...s, next]
        )
        return
      }
      commit(next)
    },
    [commit, multiple, resolving]
  )

  const submit = React.useCallback(() => {
    if (resolving || !selection.length) return
    commit(selection)
  }, [commit, resolving, selection])

  const isChosen = React.useCallback(
    (v: string) => (answered ? committed.includes(v) : selection.includes(v)),
    [answered, committed, selection]
  )

  const context = React.useMemo(
    () => ({ multiple, answered, selection, resolving, isChosen, onOption, submit }),
    [multiple, answered, selection, resolving, isChosen, onOption, submit]
  )

  return (
    <ApprovalContext.Provider value={context}>
      <Request
        data-slot="approval"
        data-answered={answered || undefined}
        data-multiple={multiple || undefined}
        status={answered ? "submitted" : "pending"}
        resolving={!!resolving}
        tone={tone}
        className={className}
        {...props}
      >
        {children}
      </Request>
    </ApprovalContext.Provider>
  )
}

function ApprovalQuestion(props: React.ComponentProps<typeof RequestQuestion>) {
  return <RequestQuestion data-slot="approval-question" {...props} />
}

function ApprovalDescription(props: React.ComponentProps<typeof RequestDescription>) {
  return <RequestDescription data-slot="approval-description" {...props} />
}

function ApprovalOptions({ className, children, ...props }: React.ComponentProps<"div">) {
  const { answered, resolving, isChosen } = useApproval("ApprovalOptions")

  /*
    Settled, the rejected options are dropped here rather than left to render
    nothing. A child that returns null still leaves its wrapper behind, and
    once `resolving` clears those wrappers un-collapse and spring open on their
    own spacing — which put the card back up by 8px exactly as the wave
    started. Filtering first also keeps the index honest, so the surviving
    option is not paying for a gap above a neighbour that no longer exists.
  */
  const items = React.Children.toArray(children).filter((child) => {
    if (!answered) return true
    if (!React.isValidElement<{ value?: string }>(child)) return false
    return !!child.props.value && isChosen(child.props.value)
  })

  return (
    <div
      data-slot="approval-options"
      className={cn(
        "flex flex-col items-stretch",
        // Released with the collapse, not at the commit, for the same reason.
        "transition-[padding] duration-(--duration-base) ease-(--ease-out-expo)",
        resolving || answered ? "pt-0" : "pt-2",
        className
      )}
      {...props}
    >
      {items.map((child, i) => {
        const childValue = React.isValidElement<{ value?: string }>(child)
          ? child.props.value
          : undefined
        const losing = !!resolving && !!childValue && !resolving.includes(childValue)

        return (
          <RequestCollapse key={childValue ?? i} collapsed={losing}>
            <div
              className={cn(
                i > 0 && "pt-1",
                "animate-in fade-in slide-in-from-bottom-1 duration-(--duration-base) ease-(--ease-spring)",
                "motion-reduce:animate-none"
              )}
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
            >
              {child}
            </div>
          </RequestCollapse>
        )
      })}
    </div>
  )
}

/**
 * The shared box. The pending button and the settled record use the same
 * padding and border width so the element swap at the end of the resolve
 * lands on identical geometry and is invisible.
 */
const OPTION_BOX =
  "flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-[13px]"

const optionVariants = cva(
  [
    "group/option outline-none",
    OPTION_BOX,
    // Colour only. Nothing here moves the box, so the settle is a change of
    // temperature rather than a change of shape.
    "transition-[color,background-color,border-color] duration-(--duration-base) ease-(--ease-out-expo)",
    "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
  ],
  {
    variants: {
      intent: {
        default:
          "border-border bg-background text-foreground hover:border-brand/50 hover:bg-accent",
        // Destructive approvals are the ones worth slowing down for, so the
        // colour is present before the click rather than only after it.
        danger:
          "border-destructive/30 bg-background text-destructive hover:border-destructive/60 hover:bg-destructive/5",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  }
)

function ApprovalOption({
  className,
  value,
  hint,
  intent = "default",
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> &
  VariantProps<typeof optionVariants> & {
    value: string
    /** A short qualifier — what this choice actually means. */
    hint?: React.ReactNode
  }) {
  const { multiple, answered, resolving, isChosen, onOption } =
    useApproval("ApprovalOption")

  const chosen = isChosen(value)

  // Answered, only the chosen options survive. Keeping the rejected ones would
  // leave a transcript full of buttons that no longer do anything.
  if (answered && !chosen) return null

  if (answered) {
    return (
      <span
        data-slot="approval-option"
        data-chosen
        className={cn(
          OPTION_BOX,
          // Transparent chrome on the same geometry the button had: the record
          // is the button with its surface removed, not a different object.
          "border-transparent bg-transparent text-foreground",
          className
        )}
      >
        {/* Filled rather than a bare tick. This is the only thing left on the
            card, so it carries the whole confirmation. */}
        <span
          className={cn(
            "flex size-[18px] shrink-0 items-center justify-center rounded-full text-white",
            "animate-in zoom-in-50 duration-(--duration-base) ease-(--ease-spring)",
            intent === "danger" ? "bg-destructive" : "bg-success"
          )}
        >
          <Check className="size-3" />
        </span>
        <span className="font-medium">{children}</span>
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </span>
    )
  }

  const acknowledged = !!resolving && resolving.includes(value)

  return (
    <button
      type="button"
      data-slot="approval-option"
      data-intent={intent}
      data-chosen={chosen || undefined}
      role={multiple ? "checkbox" : undefined}
      aria-checked={multiple ? chosen : undefined}
      disabled={!!resolving}
      onClick={() => onOption(value, intent ?? "default")}
      className={cn(
        optionVariants({ intent }),
        "active:bg-accent",
        // Picked but not yet submitted, in a multiple question.
        chosen && !acknowledged && "border-brand/60 bg-brand/5",
        // Acknowledged, the surface dissolves toward the record it is about to
        // become, so the swap at the end has nothing left to change.
        acknowledged && "border-transparent bg-transparent",
        resolving && !acknowledged && "pointer-events-none",
        className
      )}
      {...props}
    >
      {multiple ? <Box checked={chosen} intent={intent ?? "default"} /> : null}
      <span className="font-medium">{children}</span>
      {hint ? (
        <span className="min-w-0 truncate text-muted-foreground">{hint}</span>
      ) : null}
      {!multiple ? (
        // One slot, two glyphs. The arrow that invited the click cross-fades
        // into the check that confirms it, so nothing jumps and the affordance
        // becomes its own receipt.
        <span className="relative ml-auto size-3.5 shrink-0">
          <Arrow
            className={cn(
              "absolute inset-0 size-3.5 text-muted-foreground/0",
              "transition-[color,opacity,transform] duration-(--duration-fast) ease-(--ease-out-expo)",
              acknowledged
                ? "opacity-0"
                : "group-hover/option:translate-x-0.5 group-hover/option:text-muted-foreground"
            )}
          />
          <Check
            className={cn(
              "absolute inset-0 size-3.5",
              intent === "danger" ? "text-destructive" : "text-success",
              "transition-opacity duration-(--duration-base) ease-(--ease-out-expo)",
              acknowledged ? "opacity-100" : "opacity-0"
            )}
          />
        </span>
      ) : null}
    </button>
  )
}

/** Commits a multiple-choice question. Nothing is decided until this is hit. */
function ApprovalConfirm({
  className,
  children = "Confirm",
  ...props
}: React.ComponentProps<"button">) {
  const { answered, selection, resolving, submit } = useApproval("ApprovalConfirm")
  if (answered) return null

  const count = selection.length

  return (
    <RequestCollapse collapsed={!!resolving}>
      <button
        type="button"
        data-slot="approval-confirm"
        disabled={!count || !!resolving}
        onClick={submit}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium outline-none",
          // Not a brand fill. --brand-content is the darker step meant for text
          // on light surfaces, so on a brand background it measured 1.39:1 and
          // the label all but disappeared. The system's own primary pair is
          // near-black on white and keeps the hot colour reserved.
          "bg-primary text-primary-foreground shadow-(--shadow-raised)",
          "transition-[filter,transform,background-color,color] duration-(--duration-press) ease-(--ease-spring)",
          "hover:brightness-125 active:scale-[0.97]",
          // A ghosted fill reads as broken; an unfilled control reads as
          // waiting, which is what this is until something is picked.
          "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
          "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          className
        )}
        {...props}
      >
        {children}
        {count ? (
          // Keyed on the count so it re-runs the pop on every pick.
          <span
            key={count}
            className="inline-flex min-w-4 animate-in items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-[11px] tabular-nums zoom-in-50 duration-(--duration-fast) ease-(--ease-spring)"
          >
            {count}
          </span>
        ) : null}
      </button>
    </RequestCollapse>
  )
}

/**
 * A row of secondary controls — dismiss, ask again, open the diff. Hidden once
 * the question is settled.
 */
function ApprovalFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { answered, resolving } = useApproval("ApprovalFooter")
  if (answered) return null

  return (
    <RequestCollapse collapsed={!!resolving}>
      <div
        data-slot="approval-footer"
        className={cn("flex items-center gap-3 pt-2", className)}
        {...props}
      />
    </RequestCollapse>
  )
}

function ApprovalDismiss({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="approval-dismiss"
      className={cn(
        "rounded-md text-[12.5px] text-muted-foreground outline-none",
        "transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        className
      )}
      {...props}
    />
  )
}

function Box({ checked, intent }: { checked: boolean; intent: "default" | "danger" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[15px] shrink-0 items-center justify-center rounded-[5px] border",
        "transition-[background-color,border-color] duration-(--duration-press) ease-(--ease-spring)",
        checked
          ? intent === "danger"
            ? "border-destructive bg-destructive text-white"
            : "border-brand bg-brand text-brand-content"
          : "border-border bg-background"
      )}
    >
      {checked ? (
        <Check className="size-2.5 animate-in zoom-in-50 duration-(--duration-fast) ease-(--ease-spring)" />
      ) : null}
    </span>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function Arrow({ className }: { className?: string }) {
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
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export {
  Approval,
  ApprovalQuestion,
  ApprovalDescription,
  ApprovalOptions,
  ApprovalOption,
  ApprovalConfirm,
  ApprovalFooter,
  ApprovalDismiss,
}
