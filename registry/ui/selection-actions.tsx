"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Point at a passage and hand it to the agent.
 *
 * The inverse of the approval card: there the agent asks and waits, here the
 * person asks. It is the only component in the set anchored to something the
 * user made rather than to the layout, which is most of the design problem —
 * the toolbar has to find a selection, follow it, survive being typed into,
 * and disappear the moment it stops being relevant.
 *
 * The hard part is that focusing anything collapses the selection, so the
 * passage being acted on would vanish exactly when the person starts
 * describing what to do with it. Two defences: quick actions take the pointer
 * without stealing focus, and the range is repainted through the Custom
 * Highlight API for the case where focus genuinely has to move.
 */

/** Not in every lib.dom yet, so the API is described rather than assumed. */
type HighlightRegistry = Map<string, unknown> | undefined
declare const Highlight: { new (...ranges: Range[]): unknown } | undefined

const HIGHLIGHT_NAME = "swagui-selection"

/**
 * Registers the ::highlight() rule at runtime rather than shipping it in the
 * theme. Build-time CSS parsers reject ::highlight() as an unknown
 * pseudo-element and fail the whole stylesheet, and an unsupported selector in
 * an adopted sheet is simply ignored by the browser — so this is both the
 * safer and the better-scoped place for it.
 */
function useHighlightStyle() {
  React.useEffect(() => {
    const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights
    if (!registry || typeof CSSStyleSheet === "undefined") return

    let sheet: CSSStyleSheet
    try {
      sheet = new CSSStyleSheet()
      sheet.replaceSync(
        `::highlight(${HIGHLIGHT_NAME}){background-color:color-mix(in oklch,var(--brand) 20%,transparent);}`
      )
    } catch {
      return
    }

    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
    return () => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (s) => s !== sheet
      )
    }
  }, [])
}

function paintHighlight(range: Range | null) {
  const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights
  if (!registry || typeof Highlight === "undefined") return
  if (!range) {
    registry.delete(HIGHLIGHT_NAME)
    return
  }
  registry.set(HIGHLIGHT_NAME, new Highlight(range.cloneRange()))
}

/**
 * Collapses a run of controls along the inline axis.
 *
 * The width is measured and animated to that exact number, not to a ceiling.
 * Transitioning max-width to a generous bound looks instant and then jumpy:
 * with an ease-out curve the value passes the real content width within about
 * a tenth of the duration, so the visible motion is over in ~25ms and the
 * remaining 90% of the animation moves a number nothing can see.
 *
 * Both halves move together on the same curve, so their widths sum to a clean
 * interpolation between the bar's two resting widths.
 *
 * A ResizeObserver keeps the measurement honest when the controls change.
 */
function CollapseX({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  const outerRef = React.useRef<HTMLDivElement | null>(null)
  const innerRef = React.useRef<HTMLDivElement | null>(null)
  const widthRef = React.useRef(0)
  const mounted = React.useRef(false)

  /*
    Measurement and first paint. Runs once.

    The width is unknown until after layout, so going through React state
    guarantees a zero is rendered before the real number and the arrival
    animates. Writing it straight to the node with the transition suppressed,
    flushing, and only then restoring the transition makes the measured width
    simply the element's first painted state.

    The clamp is lifted for the length of one synchronous read: measured while
    the container is held at zero with hidden overflow, the row reports the
    space it was given rather than the space its contents need, which comes
    back short and clips the last control.
  */
  React.useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    outer.style.transition = "none"
    outer.style.width = "auto"
    widthRef.current = Math.ceil(inner.getBoundingClientRect().width)
    outer.style.width = open ? `${widthRef.current}px` : "0px"
    void outer.offsetWidth
    outer.style.transition = ""
    mounted.current = true

    /*
      contentRect is the row's own size, so the clamp never has to be lifted
      again. Corrections are applied without animating: an icon finishing its
      layout or a webfont swapping its metrics is a number that was briefly
      wrong, and easing into a correction reads as the bar still growing after
      it has arrived.
    */
    const observer = new ResizeObserver((entries) => {
      const next = Math.ceil(entries[0].contentRect.width)
      if (!next || next === widthRef.current) return
      widthRef.current = next
      if (!open) return
      outer.style.transition = "none"
      outer.style.width = `${next}px`
      void outer.offsetWidth
      outer.style.transition = ""
    })
    observer.observe(inner)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*
    Toggles, and nothing else. The width is the only thing written here — no
    measuring, no suppressing.

    Suppressing the transition to measure and restoring it in the same task is
    what stopped the toggle animating at all: the browser compares the style
    before the change with the style after it, and the before-change style it
    had just been handed said the property does not transition.
  */
  React.useLayoutEffect(() => {
    const outer = outerRef.current
    if (!outer || !mounted.current) return
    outer.style.width = open ? `${widthRef.current}px` : "0px"
  }, [open])

  return (
    <div
      ref={outerRef}
      style={{ width: 0 }}
      className={cn(
        "shrink-0 overflow-hidden",
        "transition-[width,opacity] duration-(--duration-base) ease-(--ease-swagui)",
        "motion-reduce:transition-none",
        open ? "opacity-100" : "opacity-0"
      )}
      inert={!open || undefined}
    >
      {/* Intrinsically sized, so the row it lives in can be wider than the bar
          and scroll, and so there is a real width to measure. */}
      <div ref={innerRef} className="flex w-max items-center gap-1">
        {children}
      </div>
    </div>
  )
}

type Captured = {
  text: string
  /** Relative to the root, so the toolbar can be positioned without portals. */
  top: number
  bottom: number
  centre: number
  /** The space the toolbar has to stay inside. */
  rootWidth: number
}

type SelectionActionsContextValue = {
  captured: Captured | null
  dismiss: () => void
  /** Repaints the passage after focus has collapsed the real selection. */
  repaint: () => void
  run: (action: string) => void
  /** The overflow actions are showing, and the instruction field is not. */
  expanded: boolean
  setExpanded: (open: boolean) => void
  contentRef: React.RefObject<HTMLDivElement | null>
  toolbarRef: React.RefObject<HTMLDivElement | null>
}

const SelectionActionsContext =
  React.createContext<SelectionActionsContextValue | null>(null)

function useSelectionActions(component: string) {
  const context = React.useContext(SelectionActionsContext)
  if (!context) {
    throw new Error(`${component} must be used within <SelectionActions>`)
  }
  return context
}

function SelectionActions({
  className,
  onAction,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** The action taken, and the passage it applies to. */
  onAction?: (action: string, text: string) => void
}) {
  useHighlightStyle()

  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const toolbarRef = React.useRef<HTMLDivElement | null>(null)
  const rangeRef = React.useRef<Range | null>(null)
  const [captured, setCaptured] = React.useState<Captured | null>(null)
  const [expanded, setExpanded] = React.useState(false)

  const dismiss = React.useCallback(() => {
    rangeRef.current = null
    paintHighlight(null)
    setCaptured(null)
    // A new passage starts from the short bar; the previous one's expansion
    // says nothing about what this one needs.
    setExpanded(false)
  }, [])

  const measure = React.useCallback((range: Range) => {
    const root = rootRef.current
    if (!root) return null
    const box = range.getBoundingClientRect()
    if (!box.width && !box.height) return null
    const frame = root.getBoundingClientRect()
    return {
      text: range.toString().trim(),
      top: box.top - frame.top,
      bottom: box.bottom - frame.top,
      centre: box.left - frame.left + box.width / 2,
      rootWidth: frame.width,
    }
  }, [])

  const commit = React.useCallback(() => {
    // The toolbar owns the selection once it has focus; the document has
    // already lost it, and re-reading here would close the toolbar as soon as
    // someone clicked into it.
    if (toolbarRef.current?.contains(document.activeElement)) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      dismiss()
      return
    }

    const range = selection.getRangeAt(0)
    const content = contentRef.current
    if (!content || !content.contains(range.commonAncestorContainer)) {
      dismiss()
      return
    }

    const next = measure(range)
    if (!next || !next.text) {
      dismiss()
      return
    }

    rangeRef.current = range.cloneRange()
    setCaptured(next)
  }, [dismiss, measure])

  /*
    Two different events, doing two different jobs.

    The toolbar appears when the gesture *ends* — on mouse up, touch end, or
    the key up that finished a shift-arrow selection. Raising it on
    selectionchange instead meant it chased the cursor mid-drag, repositioning
    on every character and sitting under the pointer that was still selecting.

    Disappearing is the opposite case and should be immediate, so
    selectionchange still handles the collapse: the moment a new drag begins or
    the selection is clicked away, the stale toolbar has to go.
  */
  React.useEffect(() => {
    let frame = 0

    const settle = () => {
      cancelAnimationFrame(frame)
      // One frame late, so the browser has finished resolving the selection.
      frame = requestAnimationFrame(commit)
    }

    const onSelectionChange = () => {
      if (toolbarRef.current?.contains(document.activeElement)) return
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) dismiss()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      // Only the keys that extend a selection are worth re-reading. Select-all
      // has to be the chord, not a bare "a", or every typed letter re-reads.
      const selectAll = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a"
      if (e.shiftKey || e.key.startsWith("Arrow") || selectAll) settle()
    }

    document.addEventListener("selectionchange", onSelectionChange)
    document.addEventListener("mouseup", settle)
    document.addEventListener("touchend", settle)
    document.addEventListener("keyup", onKeyUp)
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange)
      document.removeEventListener("mouseup", settle)
      document.removeEventListener("touchend", settle)
      document.removeEventListener("keyup", onKeyUp)
      cancelAnimationFrame(frame)
    }
  }, [commit, dismiss])

  // Follow the passage if the page moves underneath it.
  React.useEffect(() => {
    if (!captured) return
    const reposition = () => {
      const range = rangeRef.current
      if (!range) return
      const next = measure(range)
      if (next) setCaptured(next)
    }
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)
    return () => {
      window.removeEventListener("scroll", reposition, true)
      window.removeEventListener("resize", reposition)
    }
  }, [captured, measure])

  React.useEffect(() => {
    if (!captured) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [captured, dismiss])

  React.useEffect(() => () => paintHighlight(null), [])

  const repaint = React.useCallback(() => {
    paintHighlight(rangeRef.current)
  }, [])

  const run = React.useCallback(
    (action: string) => {
      if (!captured) return
      onAction?.(action, captured.text)
      window.getSelection()?.removeAllRanges()
      dismiss()
    },
    [captured, dismiss, onAction]
  )

  const context = React.useMemo(
    () => ({
      captured,
      dismiss,
      repaint,
      run,
      expanded,
      setExpanded,
      contentRef,
      toolbarRef,
    }),
    [captured, dismiss, expanded, repaint, run]
  )

  return (
    <SelectionActionsContext.Provider value={context}>
      <div
        ref={rootRef}
        data-slot="selection-actions"
        data-active={captured ? "" : undefined}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    </SelectionActionsContext.Provider>
  )
}

/** The selectable region. Only selections inside it raise the toolbar. */
function SelectionActionsContent({ className, ...props }: React.ComponentProps<"div">) {
  const { contentRef } = useSelectionActions("SelectionActionsContent")

  return (
    <div
      ref={contentRef}
      data-slot="selection-actions-content"
      className={cn("selection:bg-brand/20", className)}
      {...props}
    />
  )
}

/**
 * Floats over the passage. Sits above it by default and flips below when there
 * is not room, which is the only placement rule worth having: the toolbar must
 * never cover the thing it is about to change.
 */
function SelectionActionsToolbar({
  className,
  offset = 10,
  children,
  ...props
}: React.ComponentProps<"div"> & { offset?: number }) {
  const { captured, toolbarRef } = useSelectionActions("SelectionActionsToolbar")
  const [size, setSize] = React.useState({ width: 0, height: 0 })

  // Observed rather than read once: the bar changes width while the overflow
  // opens, and a clamp computed from its old width leaves it mis-centred for
  // the length of the animation and then snaps when something re-renders.
  React.useLayoutEffect(() => {
    const el = toolbarRef.current
    if (!el) return
    const read = () => {
      const box = el.getBoundingClientRect()
      setSize({ width: box.width, height: box.height })
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [captured, toolbarRef])

  if (!captured) return null

  const above = captured.top - size.height - offset
  const flipped = above < 0
  const top = flipped ? captured.bottom + offset : above

  /*
    Centred on the passage, then held inside the container.

    Without the clamp the centring transform walks the bar off whichever edge
    the selection is nearest. Capping the width instead would squeeze the row,
    and since the collapsing track hides its overflow that squeeze arrives as a
    sliced-off action rather than as a narrower bar.
  */
  const inset = 8
  const half = size.width / 2
  const room = Math.max(0, captured.rootWidth - size.width - inset * 2)
  const left =
    room === 0
      ? captured.rootWidth / 2
      : Math.min(
          Math.max(captured.centre, half + inset),
          captured.rootWidth - half - inset
        )

  return (
    <div
      ref={toolbarRef}
      data-slot="selection-actions-toolbar"
      data-placement={flipped ? "bottom" : "top"}
      style={{ top, left, maxWidth: `calc(100% - ${inset * 2}px)` }}
      // Positioning only. The centring transform lives here and nowhere else:
      // a keyframe that writes transform overrides an inline one, so animating
      // this element would drop it half its own width to the right for the
      // length of the entrance and snap it back at the end.
      className="absolute z-20 -translate-x-1/2"
    >
      <div
        role="toolbar"
        aria-label="Selection actions"
        // Grows from the edge nearest the passage that summoned it, so it
        // reads as coming out of the selection rather than arriving at it.
        style={{ transformOrigin: flipped ? "center top" : "center bottom" }}
        className={cn(
          "emerge no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full p-1",
          "border border-border bg-popover shadow-(--shadow-overlay)",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

/** Free-text instruction. The one control here that needs the caret. */
function SelectionActionsInput({
  className,
  placeholder = "Describe edits",
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const { captured, expanded, repaint, run } = useSelectionActions("SelectionActionsInput")
  const [value, setValue] = React.useState("")

  // A fresh passage is a fresh instruction.
  React.useEffect(() => setValue(""), [captured?.text])

  // The bar is one row wide by design; the overflow actions take the space the
  // field was using rather than pushing it off the end.
  return (
    <CollapseX open={!expanded}>
    <input
      type="text"
      data-slot="selection-actions-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      // Focus collapses the document selection, so the passage is repainted
      // through the Highlight API to stay visible while the instruction is
      // typed. Without this the person loses sight of what they are editing at
      // the exact moment they describe the edit.
      onFocus={repaint}
      onKeyDown={(e) => {
        if (e.key === "Enter" && value.trim()) {
          e.preventDefault()
          run(value.trim())
        }
      }}
      className={cn(
        // Sized to the instruction it invites, not to a round number. At w-44
        // the placeholder ended a third of the way across the field and the
        // gap before the first action read as a hole in the bar.
        "w-32 shrink-0 bg-transparent px-2.5 text-[13px] outline-none",
        "text-foreground placeholder:text-muted-foreground",
        className
      )}
      {...props}
      />
      {/* Its own divider, so the two go together. Left to the caller it stays
          behind when the field closes, and a rule with nothing on one side of
          it reads as a stray line down the end of the bar. */}
      <SelectionActionsSeparator />
    </CollapseX>
  )
}

function SelectionActionsSeparator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="selection-actions-separator"
      className={cn("h-5 w-px shrink-0 bg-border", className)}
      {...props}
    />
  )
}

/**
 * A named action. Takes the pointer without taking focus, so the browser
 * selection — and with it the passage — is still there when it runs.
 */
function SelectionActionsAction({
  className,
  value,
  icon,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & {
  value: string
  icon?: React.ReactNode
}) {
  const { run } = useSelectionActions("SelectionActionsAction")

  return (
    <button
      type="button"
      data-slot="selection-actions-action"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => run(value)}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] outline-none",
        "text-muted-foreground",
        "transition-[color,background-color,transform] duration-(--duration-press) ease-(--ease-spring)",
        "hover:bg-accent hover:text-foreground active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

/**
 * Reveals the rest of the actions.
 *
 * The bar starts short — an instruction field and the two or three actions
 * most passages want — because a toolbar that opens with everything makes the
 * common case read the whole list. The chevron is the way to the rest, and it
 * turns to point back the way it came once they are showing.
 */
function SelectionActionsMore({
  className,
  label = "More actions",
  children,
  ...props
}: React.ComponentProps<"button"> & { label?: string }) {
  const { expanded, setExpanded } = useSelectionActions("SelectionActionsMore")

  return (
    <>
      <CollapseX open={expanded}>{children}</CollapseX>
      <SelectionActionsSeparator />
      <button
        type="button"
        data-slot="selection-actions-more"
        aria-label={label}
        aria-expanded={expanded}
        title={label}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-full outline-none",
          "text-muted-foreground",
          "transition-[color,background-color,transform] duration-(--duration-press) ease-(--ease-spring)",
          "hover:bg-accent hover:text-foreground active:scale-90",
          "focus-visible:ring-2 focus-visible:ring-ring/60",
          "[&_svg]:size-4 [&_svg]:shrink-0",
          className
        )}
        {...props}
      >
        <ChevronRight
          className={cn(
            "transition-transform duration-(--duration-base) ease-(--ease-out-expo)",
            expanded && "rotate-180"
          )}
        />
      </button>
    </>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export {
  SelectionActions,
  SelectionActionsContent,
  SelectionActionsToolbar,
  SelectionActionsInput,
  SelectionActionsSeparator,
  SelectionActionsAction,
  SelectionActionsMore,
}
