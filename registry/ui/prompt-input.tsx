"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/ui/tooltip"
import { Slider } from "@/registry/ui/slider"

/**
 * The composer.
 *
 * Everything else in the agent set reports outward; this is the one surface
 * the person types into, so it is the only one that holds focus, grows with
 * what is being said, and has to stay obviously interactive at rest. It is
 * built as a field that happens to contain controls, not a toolbar that
 * happens to contain a field: the message sits on top with the tools beneath
 * it, so a long message never squeezes the buttons and the buttons never
 * squeeze the message.
 *
 * The field is a contenteditable rather than a textarea. A textarea holds
 * plain text, so a referenced file could only ever be a tinted run of
 * characters; here a mention is a real node — icon, proper name, deleted in
 * one keystroke — and the value is serialised back out on every edit.
 *
 * The DOM is the source of truth for the field. React renders it once and then
 * leaves it alone: re-rendering a contenteditable from state destroys the
 * caret on every keystroke.
 */

type Status = "ready" | "submitted" | "streaming"

type Mention = {
  value: string
  label: string
  /** Drawn into the chip. A favicon URL for a connected app. */
  iconSrc?: string
  /** Drawn into the chip when there is no image — a file-type glyph. */
  glyph?: string
}

type PromptInputContextValue = {
  value: string
  status: Status
  submit: () => void
  stop: () => void
  clear: () => void
  editorRef: React.RefObject<HTMLDivElement | null>
  /** Bumped on every edit and caret move, so menus re-read the DOM selection. */
  signal: number
  sync: () => void
  insertMention: (trigger: string, mention: Mention) => void
  /** A menu opened by a button rather than by typing its trigger. */
  openMenu: string | null
  setOpenMenu: (trigger: string | null) => void
}

const PromptInputContext = React.createContext<PromptInputContextValue | null>(null)

function usePromptInput(component: string) {
  const context = React.useContext(PromptInputContext)
  if (!context) {
    throw new Error(`${component} must be used within <PromptInput>`)
  }
  return context
}

/** Reads the field back out as text, with each mention as its own token. */
function serialize(root: HTMLElement | null): string {
  if (!root) return ""
  let out = ""

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? ""
      return
    }
    if (node instanceof HTMLElement) {
      if (node.dataset.mention !== undefined) {
        out += `${node.dataset.trigger ?? "@"}${node.dataset.value ?? ""}`
        return
      }
      if (node.tagName === "BR") {
        out += "\n"
        return
      }
      // A div per line is how browsers model Shift+Enter in a contenteditable.
      if (node.tagName === "DIV" && out && !out.endsWith("\n")) out += "\n"
    }
    node.childNodes.forEach(walk)
  }

  root.childNodes.forEach(walk)
  // Editing inserts non-breaking spaces; callers want ordinary ones.
  return out.replace(/ /g, " ")
}

/**
 * The token being typed at the caret, read from the live selection.
 *
 * The trigger has to start a word — an address in the middle of a sentence is
 * not a mention — and the token ends at the first space, which is what closes
 * the menu naturally as someone keeps typing.
 */
function tokenAtCaret(root: HTMLElement | null, trigger: string) {
  if (!root) return null
  const selection = window.getSelection()
  if (!selection || !selection.isCollapsed) return null

  const node = selection.anchorNode
  if (!node || node.nodeType !== Node.TEXT_NODE || !root.contains(node)) return null

  const before = (node.textContent ?? "").slice(0, selection.anchorOffset)
  const start = before.lastIndexOf(trigger)
  if (start === -1) return null
  if (start > 0 && !/[\s ]/.test(before[start - 1])) return null

  const query = before.slice(start + 1)
  if (/[\s ]/.test(query)) return null

  return { node, start, end: selection.anchorOffset, query }
}

function buildChip(trigger: string, mention: Mention) {
  const chip = document.createElement("span")
  chip.dataset.mention = ""
  chip.dataset.trigger = trigger
  chip.dataset.value = mention.value
  chip.setAttribute("contenteditable", "false")
  // A hairline in the same hue as the fill. The tint alone left the chip
  // floating in the sentence; an edge gives it a shape without making it loud.
  chip.className =
    "mx-px inline-flex translate-y-[1px] items-center gap-1 rounded-md border border-brand/25 bg-brand/12 px-1.5 py-px align-baseline text-[13px] font-medium text-brand-content"

  if (mention.iconSrc) {
    const img = document.createElement("img")
    img.src = mention.iconSrc
    img.alt = ""
    img.width = 14
    img.height = 14
    img.className = "size-3.5 shrink-0 rounded-[3px] object-cover"
    chip.appendChild(img)
  } else if (mention.glyph) {
    const glyph = document.createElement("span")
    glyph.textContent = mention.glyph
    glyph.className = "mono shrink-0 text-[10px] opacity-70"
    chip.appendChild(glyph)
  }

  chip.appendChild(document.createTextNode(mention.label))
  return chip
}

function PromptInput({
  className,
  onValueChange,
  onSubmit,
  onStop,
  status = "ready",
  shape = "rounded",
  children,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  onValueChange?: (value: string) => void
  /** Called with the trimmed message. The field is cleared here. */
  onSubmit?: (value: string) => void
  onStop?: () => void
  status?: Status
  shape?: "rounded" | "pill"
}) {
  const editorRef = React.useRef<HTMLDivElement | null>(null)
  const [value, setValue] = React.useState("")
  const [signal, setSignal] = React.useState(0)
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)

  const sync = React.useCallback(() => {
    const next = serialize(editorRef.current)
    setValue(next)
    setSignal((n) => n + 1)
    onValueChange?.(next)
  }, [onValueChange])

  const clear = React.useCallback(() => {
    if (editorRef.current) editorRef.current.innerHTML = ""
    setValue("")
    setSignal((n) => n + 1)
    onValueChange?.("")
  }, [onValueChange])

  const submit = React.useCallback(() => {
    const trimmed = serialize(editorRef.current).trim()
    if (!trimmed || status !== "ready") return
    onSubmit?.(trimmed)
    clear()
  }, [clear, onSubmit, status])

  const stop = React.useCallback(() => onStop?.(), [onStop])

  const insertMention = React.useCallback(
    (trigger: string, mention: Mention) => {
      const root = editorRef.current
      if (!root) return
      const token = tokenAtCaret(root, trigger)

      const range = document.createRange()
      if (token) {
        // Typed: the trigger and its query are replaced by the chip.
        range.setStart(token.node, token.start)
        range.setEnd(token.node, token.end)
        range.deleteContents()
      } else {
        // Opened from a button, so there is nothing to replace. Drop the chip
        // at the caret if it is in the field, otherwise at the end.
        const selection = window.getSelection()
        const caretInside =
          selection?.rangeCount &&
          selection.anchorNode &&
          root.contains(selection.anchorNode)
        if (caretInside) {
          range.setStart(selection.anchorNode!, selection.anchorOffset)
          range.collapse(true)
        } else {
          range.selectNodeContents(root)
          range.collapse(false)
        }
      }

      const chip = buildChip(trigger, mention)
      range.insertNode(chip)

      // A trailing space, so typing continues outside the chip rather than
      // being swallowed by its edge.
      const spacer = document.createTextNode(" ")
      chip.after(spacer)

      const selection = window.getSelection()
      const after = document.createRange()
      after.setStart(spacer, 1)
      after.collapse(true)
      selection?.removeAllRanges()
      selection?.addRange(after)

      root.focus()
      sync()
    },
    [sync]
  )

  const context = React.useMemo(
    () => ({
      value,
      status,
      submit,
      stop,
      clear,
      editorRef,
      signal,
      sync,
      insertMention,
      openMenu,
      setOpenMenu,
    }),
    [value, status, submit, stop, clear, signal, sync, insertMention, openMenu]
  )

  return (
    <PromptInputContext.Provider value={context}>
      <form
        data-slot="prompt-input"
        data-status={status}
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className={cn(
          "relative w-full",
          // Focus is drawn on the wrapper rather than the field, so the whole
          // composer lights up as one control instead of a box inside a box.
          "border border-input bg-card shadow-(--shadow-hairline)",
          "transition-[border-color,box-shadow] duration-(--duration-fast) ease-(--ease-swagui)",
          "focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-ring/40",
          // One radius class rather than two competing ones. The squircle
          // factor already multiplies these, so 2xl came out at 34px.
          shape === "pill" ? "rounded-[1.75rem]" : "rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </form>
    </PromptInputContext.Provider>
  )
}

/**
 * The message field. Grows with the content up to a ceiling, then scrolls.
 *
 * Rendered empty and never re-rendered from state: React writing children into
 * a contenteditable on each keystroke would reset the caret to the start.
 */
function PromptInputEditor({
  className,
  placeholder = "Write a message…",
  maxRows = 10,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  placeholder?: string
  maxRows?: number
}) {
  const { value, status, submit, sync, editorRef } = usePromptInput("PromptInputEditor")
  const empty = value.trim() === ""

  return (
    <div className="relative">
      {empty ? (
        <p
          aria-hidden
          className="pointer-events-none absolute inset-0 px-4 pt-3 text-[14px] leading-normal text-muted-foreground"
        >
          {placeholder}
        </p>
      ) : null}

      <div
        ref={editorRef}
        data-slot="prompt-input-editor"
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        contentEditable={status !== "submitted"}
        suppressContentEditableWarning
        onInput={sync}
        onKeyUp={sync}
        onClick={sync}
        onPaste={(e) => {
          // Plain text only: pasted markup would arrive with its own styling
          // and its own nodes, neither of which this field knows how to
          // serialise.
          e.preventDefault()
          const text = e.clipboardData.getData("text/plain")
          document.execCommand("insertText", false, text)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented) return
          // Enter sends, Shift+Enter breaks the line. IME composition must be
          // left alone or it submits mid-word in Japanese and Chinese input.
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          }
        }}
        style={{ maxHeight: `calc(${maxRows} * 1.5em)` }}
        className={cn(
          "block w-full overflow-y-auto px-4 pt-3 text-[14px] leading-normal outline-none",
          "text-foreground caret-foreground selection:bg-brand/25",
          "break-words whitespace-pre-wrap",
          status === "submitted" && "opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

/** The row beneath the message: tools on the left, model and send on the right. */
function PromptInputToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-toolbar"
      className={cn("flex items-center gap-1 px-2 pt-1 pb-2", className)}
      {...props}
    />
  )
}

function PromptInputTools({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-tools"
      className={cn("flex flex-1 items-center gap-0.5", className)}
      {...props}
    />
  )
}

function PromptInputButton({
  className,
  label,
  opensMenu,
  onClick,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  label: string
  /** Opens the menu for this trigger, e.g. "@", without typing it. */
  opensMenu?: string
}) {
  const { openMenu, setOpenMenu, editorRef } = usePromptInput("PromptInputButton")

  return (
    <button
      type="button"
      data-slot="prompt-input-button"
      aria-label={label}
      aria-expanded={opensMenu ? openMenu === opensMenu : undefined}
      title={label}
      onClick={(e) => {
        onClick?.(e)
        if (!opensMenu) return
        setOpenMenu(openMenu === opensMenu ? null : opensMenu)
        editorRef.current?.focus()
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg outline-none",
        "text-muted-foreground",
        "transition-[color,background-color,transform] duration-(--duration-press) ease-(--ease-spring)",
        "hover:bg-accent hover:text-foreground active:scale-90",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        "disabled:pointer-events-none disabled:opacity-40",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Send, or stop while the model is talking. One button rather than two: there
 * is only ever one useful action here, and swapping the glyph in place keeps
 * the target where the hand already is.
 */
function PromptInputSubmit({
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children">) {
  const { value, status, stop } = usePromptInput("PromptInputSubmit")
  const busy = status === "streaming" || status === "submitted"
  const empty = !value.trim()

  return (
    <button
      type={busy ? "button" : "submit"}
      data-slot="prompt-input-submit"
      data-busy={busy || undefined}
      aria-label={busy ? "Stop" : "Send message"}
      title={busy ? "Stop" : "Send message"}
      onClick={busy ? stop : undefined}
      disabled={!busy && empty}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg outline-none",
        "bg-primary text-primary-foreground shadow-(--shadow-raised)",
        "transition-[filter,transform,background-color,color,opacity] duration-(--duration-press) ease-(--ease-spring)",
        "hover:brightness-125 active:scale-90",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        // Nothing to send reads as waiting, not as broken.
        "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {busy ? <Square /> : <ArrowUp />}
    </button>
  )
}

type ReasoningEffort = "low" | "medium" | "high" | "xhigh" | "max"

const DEFAULT_REASONING_EFFORTS: {
  value: ReasoningEffort
  label: string
  hint: string
}[] = [
  { value: "low", label: "Low", hint: "Faster replies" },
  { value: "medium", label: "Medium", hint: "Balanced" },
  { value: "high", label: "High", hint: "Deeper analysis" },
  { value: "xhigh", label: "XHigh", hint: "Extended reasoning" },
  { value: "max", label: "Max", hint: "Maximum depth" },
]

/** Detailed model and reasoning picker for the current turn. */
function PromptInputModelSelect({
  className,
  models,
  value,
  onValueChange,
  reasoningEffort = "medium",
  onReasoningEffortChange,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  ...nativeProps
}: Omit<React.ComponentProps<"select">, "value" | "onChange" | "children"> & {
  models: { value: string; label: string; hint?: string; detail?: string }[]
  value: string
  onValueChange: (value: string) => void
  reasoningEffort?: string
  onReasoningEffortChange?: (value: string) => void
  reasoningEfforts?: { value: string; label: string; hint?: string }[]
}) {
  const active = models.find((m) => m.value === value)
  const activeEffort = reasoningEfforts.find((effort) => effort.value === reasoningEffort)
  const effortIndex = Math.max(0, reasoningEfforts.findIndex((effort) => effort.value === reasoningEffort))
  // Native select props opt into the old surface so form participation,
  // disabled state and browser focus behavior are not silently degraded.
  const legacyNativeSelect = Object.keys(nativeProps).length > 0

  if (legacyNativeSelect) {
    return (
      <label
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5",
          "text-[13px] text-muted-foreground transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
          "hover:bg-accent hover:text-foreground focus-within:ring-2 focus-within:ring-ring/60",
          className
        )}
      >
        <span className="max-w-[14ch] truncate">{active?.label ?? value}</span>
        <Chevron className="size-3 shrink-0 opacity-60" />
        <select
          data-slot="prompt-input-model"
          aria-label="Model"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          {...nativeProps}
        >
          {models.map((model) => (
            <option key={model.value} value={model.value}>
              {model.hint ? `${model.label} — ${model.hint}` : model.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="prompt-input-model"
          aria-label={`Model: ${active?.label ?? value}; reasoning: ${activeEffort?.label ?? reasoningEffort}`}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] text-muted-foreground outline-none",
            "transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
            "hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
            className
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{active?.label ?? value}</span>
          <span aria-hidden className="text-muted-foreground/40">·</span>
          <span className="hidden text-[11px] sm:inline">{activeEffort?.label ?? reasoningEffort}</span>
          <Chevron className="size-3 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" sideOffset={8} className="w-56 p-2">
        <div className="px-2 pt-1 pb-1.5 text-[11px] font-medium text-muted-foreground">Model</div>
        <div
          role="radiogroup"
          aria-label="Model"
          className="flex flex-col gap-0.5"
          onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
            )
            if (!items.length) return
            const current = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement))
            const next = event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : event.key === "ArrowDown" || event.key === "ArrowRight"
                  ? (current + 1) % items.length
                  : (current - 1 + items.length) % items.length
            event.preventDefault()
            items[next].focus()
            items[next].click()
          }}
        >
          {models.map((model) => {
            const selected = model.value === value
            return (
              <button
                key={model.value}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onValueChange(model.value)}
                className={cn(
                  "flex items-start gap-2 rounded-md px-2 py-1.5 text-left outline-none",
                  "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60",
                  selected && "bg-accent/70"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-foreground">{model.label}</span>
                  {model.hint || model.detail ? (
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {[model.hint, model.detail].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 flex size-3.5 shrink-0 items-center justify-center text-brand">
                  {selected ? <Check /> : null}
                </span>
              </button>
            )
          })}
        </div>

        <div className="my-2 h-px bg-border" />
        <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-medium text-muted-foreground">
          <span>Reasoning effort</span>
          <span className="text-foreground">{activeEffort?.label ?? reasoningEffort}</span>
        </div>
        <div className="px-2 pb-1">
          <Slider
            value={[effortIndex]}
            min={0}
            max={reasoningEfforts.length - 1}
            step={1}
            marks={reasoningEfforts.length}
            thumbLabel="Reasoning effort"
            thumbValueText={activeEffort?.label ?? reasoningEffort}
            disabled={!onReasoningEffortChange}
            onValueChange={([next]) => onReasoningEffortChange?.(reasoningEfforts[next]?.value)}
            className="py-1 [&_[data-slot=slider-range]]:bg-brand [&_[data-slot=slider-thumb]]:border-brand [&_[data-slot=slider-thumb]]:ring-brand/30"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Compact context-window meter with its exact usage disclosed on hover. */
function PromptInputContextIndicator({
  className,
  used,
  total,
  label = "Context window",
}: {
  className?: string
  used: number
  total: number
  label?: string
}) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (used / total) * 100)) : 0
  const summary = `${formatTokenCount(used)} of ${formatTokenCount(total)} tokens used (${Math.round(percentage)}%)`

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-slot="prompt-input-context"
            role="meter"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={Math.min(total, Math.max(0, used))}
            aria-valuetext={summary}
            aria-label={`${label}: ${summary}`}
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none",
              "transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
              "hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
              className
            )}
          >
            <svg viewBox="0 0 20 20" className="size-[18px] -rotate-90" aria-hidden>
              <circle cx="10" cy="10" r="7" pathLength="100" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20" />
              <circle
                cx="10"
                cy="10"
                r="7"
                pathLength="100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="100"
                strokeDashoffset={100 - percentage}
                className="text-muted-foreground"
              />
            </svg>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          <span className="font-medium">{label}</span>
          <span className="ml-1.5 opacity-75">{summary}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Files uploaded from this machine, which have no place in the sentence.
 * Anything referenced with @ belongs inline in the message instead.
 */
function PromptInputAttachments({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-attachments"
      className={cn("flex flex-wrap gap-1.5 px-3 pt-3", className)}
      {...props}
    />
  )
}

function PromptInputAttachment({
  className,
  onRemove,
  children,
  ...props
}: React.ComponentProps<"span"> & { onRemove?: () => void }) {
  return (
    <span
      data-slot="prompt-input-attachment"
      className={cn(
        "inline-flex max-w-[22ch] items-center gap-1.5 rounded-md border border-border bg-background py-1 pr-1 pl-2",
        "text-[12px] text-foreground",
        "animate-in fade-in zoom-in-95 duration-(--duration-base) ease-(--ease-spring)",
        className
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label="Remove attachment"
          onClick={onRemove}
          className={cn(
            "inline-flex size-4 shrink-0 items-center justify-center rounded outline-none",
            "text-muted-foreground transition-colors duration-(--duration-fast) ease-(--ease-swagui)",
            "hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
            "[&_svg]:size-3"
          )}
        >
          <Cross />
        </button>
      ) : null}
    </span>
  )
}

type MenuItem = {
  value: string
  label: string
  hint?: string
  /** Drawn in the menu row. */
  icon?: React.ReactNode
  /** Favicon URL, carried into the inserted chip. */
  iconSrc?: string
  /** A short type marker for the chip when there is no image, e.g. "tsx". */
  glyph?: string
  badge?: React.ReactNode
  /** Groups rows under a heading, e.g. "Apps" and "Files". */
  group?: string
  /** Runs instead of inserting a chip — opening a file picker, say. */
  action?: () => void
}

/**
 * The menu behind both triggers.
 *
 * `/` runs a command and `@` inserts a source, but they are the same object: a
 * token being typed, filtered live, picked with the keyboard. Rendered in the
 * composer's own stacking context rather than a popover — a popover moves
 * focus, and the whole point is that typing continues to filter the list.
 */
function PromptInputMenu({
  className,
  trigger = "/",
  mode = trigger === "@" ? "insert" : "replace",
  items,
  empty,
  onSelect,
}: {
  className?: string
  trigger?: string
  /** replace: the token is the whole message. insert: it is one chip in it. */
  mode?: "replace" | "insert"
  items: MenuItem[]
  empty?: React.ReactNode
  onSelect?: (value: string) => void
}) {
  const { editorRef, signal, clear, insertMention, openMenu, setOpenMenu } =
    usePromptInput("PromptInputMenu")
  const [active, setActive] = React.useState(0)
  const [dismissed, setDismissed] = React.useState(false)

  // Re-read the live selection whenever the field reports a change.
  const token = React.useMemo(
    () => tokenAtCaret(editorRef.current, trigger),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signal, trigger]
  )

  const query = token?.query.toLowerCase() ?? null
  const fromButton = openMenu === trigger
  const open = fromButton || (token !== null && !dismissed)

  const matches = React.useMemo(
    () =>
      // A button-opened menu has no query, so it offers everything.
      query === null
        ? items
        : items.filter(
            (i) =>
              i.value.toLowerCase().includes(query) ||
              i.label.toLowerCase().includes(query)
          ),
    [items, query]
  )

  /*
    Depends on the query string and a boolean, never on `token` itself.
    tokenAtCaret builds a fresh object every read, so listing it here reset the
    highlight to the first item the instant an arrow key moved it — the menu
    looked like it ignored the keyboard.
  */
  const hasToken = token !== null
  React.useEffect(() => {
    if (!hasToken) setDismissed(false)
  }, [hasToken])
  React.useEffect(() => {
    setActive(0)
  }, [query])

  const close = React.useCallback(() => {
    setDismissed(true)
    setOpenMenu(null)
  }, [setOpenMenu])

  const choose = React.useCallback(
    (item: MenuItem) => {
      onSelect?.(item.value)
      // An item can carry its own action — "upload a file" opens a picker and
      // has no business becoming a chip in the sentence.
      if (item.action) {
        item.action()
      } else if (mode === "replace") {
        clear()
      } else {
        insertMention(trigger, {
          value: item.value,
          label: item.label,
          iconSrc: item.iconSrc,
          glyph: item.glyph,
        })
      }
      close()
    },
    [clear, close, insertMention, mode, onSelect, trigger]
  )

  // Bound to the field so the caret never leaves it.
  React.useEffect(() => {
    const el = editorRef.current
    if (!el || !open || !matches.length) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActive((i) => (i + 1) % matches.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActive((i) => (i - 1 + matches.length) % matches.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        e.stopPropagation()
        choose(matches[active])
      } else if (e.key === "Escape") {
        e.preventDefault()
        close()
      } else if (fromButton && e.key.length === 1) {
        // Typing past a button-opened menu means the person moved on.
        setOpenMenu(null)
      }
    }

    el.addEventListener("keydown", onKey)
    return () => el.removeEventListener("keydown", onKey)
  }, [active, choose, close, editorRef, fromButton, matches, open, setOpenMenu])

  // A button-opened menu is dismissed by clicking away from it.
  React.useEffect(() => {
    if (!fromButton) return
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      if ((target as HTMLElement).closest?.("[data-slot='prompt-input-button']")) return
      setOpenMenu(null)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [fromButton, setOpenMenu])

  // Keeps the keyboard selection inside the scroll box on long lists.
  const activeRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" })
  }, [active])

  if (!open) return null
  if (!matches.length && !empty) return null

  let lastGroup: string | undefined

  return (
    <div
      ref={menuRef}
      data-slot="prompt-input-menu"
      data-trigger={trigger}
      role="listbox"
      className={cn(
        "absolute bottom-[calc(100%+0.5rem)] left-0 z-20 max-h-72 w-full overflow-y-auto rounded-lg",
        "border border-border bg-popover shadow-(--shadow-overlay)",
        "animate-in fade-in slide-in-from-bottom-1 duration-(--duration-fast) ease-(--ease-out-expo)",
        className
      )}
    >
      {matches.length ? (
        matches.map((item, i) => {
          const heading = item.group && item.group !== lastGroup ? item.group : null
          lastGroup = item.group

          return (
            <React.Fragment key={item.value}>
              {heading ? (
                <div
                  className="mono px-3 pt-2.5 pb-1 text-[9px] uppercase"
                  style={{ letterSpacing: "0.16em", color: "var(--muted-foreground)" }}
                >
                  {heading}
                </div>
              ) : null}
              <button
                ref={i === active ? activeRef : undefined}
                type="button"
                role="option"
                aria-selected={i === active}
                // Pointer down, not click: the field must not lose focus first,
                // or the selection the insertion depends on is already gone.
                onMouseDown={(e) => {
                  e.preventDefault()
                  choose(item)
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] outline-none",
                  "transition-colors duration-(--duration-press) ease-(--ease-swagui)",
                  i === active ? "bg-accent" : ""
                )}
              >
                {item.icon ? (
                  <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
                    {item.icon}
                  </span>
                ) : null}
                <span className="shrink-0 font-medium text-foreground">{item.label}</span>
                {item.hint ? (
                  <span className="min-w-0 truncate text-muted-foreground">
                    {item.hint}
                  </span>
                ) : null}
                {item.badge ? (
                  <span className="ml-auto shrink-0 text-[12px] text-success">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            </React.Fragment>
          )
        })
      ) : (
        <div className="px-3 py-2 text-[13px] text-muted-foreground">{empty}</div>
      )}
    </div>
  )
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

function Square() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="7" y="7" width="10" height="10" rx="2" />
    </svg>
  )
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function Cross() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5">
      <path d="m5 12.5 4 4L19 7" />
    </svg>
  )
}

function formatTokenCount(tokens: number) {
  return new Intl.NumberFormat("en-US").format(tokens)
}

export {
  PromptInput,
  PromptInputEditor,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputContextIndicator,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputMenu,
}
