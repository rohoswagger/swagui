"use client"

import * as React from "react"

import {
  Reasoning,
  ReasoningContent,
  ReasoningRow,
  ReasoningText,
  ReasoningTrigger,
} from "@/registry/ui/reasoning"
import {
  Response,
  ResponseAction,
  ResponseActions,
  ResponseCitation,
  ResponseContent,
  ResponseFollowUp,
  ResponseFollowUps,
  ResponseSources,
  useTypewriter,
} from "@/registry/ui/response"
import { Source } from "@/registry/ui/source"

function Row({
  index,
  title,
  note,
  children,
}: {
  index: string
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="mb-8 rounded-xl border p-6"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="mb-5 flex items-baseline gap-3">
        <span className="mono text-[10px]" style={{ color: "var(--muted-fg)" }}>
          {index}
        </span>
        <div>
          <h3
            className="mono text-[10px] uppercase"
            style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
          >
            {title}
          </h3>
          {note ? (
            <p className="mt-1 text-[12px]" style={{ color: "var(--muted-fg)" }}>
              {note}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}

function Case({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="mono mb-3 text-[10px] uppercase"
        style={{ letterSpacing: "0.14em", color: "var(--muted-fg)" }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

/**
 * Holds the height of a demo that animates.
 *
 * A finished copy is rendered invisibly in the same grid cell, so the box is
 * always sized for the settled state and the live copy grows inside it. Real
 * streaming legitimately reflows the page; a preview that replays would
 * otherwise shove everything below it up and down.
 *
 * The spacer wraps the whole block rather than the prose. Wrapping the prose
 * made it a grid item, which is block-level, and that pushed the caret onto a
 * line of its own instead of leaving it after the last word.
 */
function Reserve({
  spacer,
  children,
}: {
  spacer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="grid">
      <div className="invisible col-start-1 row-start-1" aria-hidden inert>
        {spacer}
      </div>
      <div className="col-start-1 row-start-1">{children}</div>
    </div>
  )
}

/**
 * Knobs for a demo, deliberately not styled like the components they drive.
 *
 * A bare select sitting next to a component reads as part of it. This borrows
 * the shape of the app's own config bar — stacked label over value with a
 * chevron — and sits inside a dashed, recessed strip, which is the
 * conventional signal for scaffolding rather than product.
 */
function DemoBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 p-2">
      <span
        className="mono flex shrink-0 items-center gap-1.5 pl-1 text-[9px] uppercase"
        style={{ letterSpacing: "0.16em", color: "var(--muted-fg)" }}
      >
        <SlidersIcon />
        Demo
      </span>
      <span className="mr-0.5 h-6 w-px shrink-0 bg-border" />
      {children}
    </div>
  )
}

function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const active = options.find((o) => o.value === value)

  return (
    <label className="group relative flex shrink-0 cursor-pointer flex-col gap-0.5 rounded-md border border-border bg-card px-2.5 py-1.5 transition-colors duration-(--duration-fast) ease-(--ease-swagui) hover:border-muted-foreground/40">
      <span className="text-[9px] leading-none text-muted-foreground">
        {label}
      </span>
      <span className="pr-4 text-[12.5px] leading-tight font-medium text-foreground">
        {active?.label ?? value}
      </span>
      <ChevronDown />
      {/* The real control, laid over the card so the card is the hit target. */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function SlidersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
      className="size-3"
    >
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="16" cy="18" r="2" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="pointer-events-none absolute right-2 bottom-2 size-3 text-muted-foreground/60"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

const THOUGHTS = [
  "Summer demand spikes for stone-fruit flavors — peach and apricot lead.",
  "I should check cone inventory before promoting a waffle-bowl special.",
  "Pistachio is the outlier: up 23% while the rest of the case is flat.",
]

const ANSWER_SOURCES = [
  { name: "Scoop Data", host: "scoopdata.io" },
  { name: "Trends Index", host: "trends.google.com" },
  { name: "Market Basket", host: "marketbasket.io" },
]

const ANSWER =
  "Pistachio is your fastest-growing flavour — sales are up 23% this quarter, and it is the only line in the case that grew every week. Rocky Road is the drag, down 6%, and it has now missed the 40-scoop threshold three weeks running."

function TraceBlock({ streaming, shown }: { streaming: boolean; shown: number }) {
  return (
    <Reasoning
      streaming={streaming}
      duration={streaming ? undefined : 6.4}
      defaultOpen
    >
      <ReasoningTrigger />
      <ReasoningContent>
        {THOUGHTS.slice(0, shown).map((t) => (
          <ReasoningText key={t}>{t}</ReasoningText>
        ))}
      </ReasoningContent>
    </Reasoning>
  )
}

function LiveReasoning() {
  const [shown, setShown] = React.useState(1)

  React.useEffect(() => {
    const id = window.setInterval(
      () => setShown((n) => (n >= THOUGHTS.length + 2 ? 1 : n + 1)),
      1800
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    <Reserve spacer={<TraceBlock streaming={false} shown={THOUGHTS.length} />}>
      <TraceBlock
        streaming={shown <= THOUGHTS.length}
        shown={Math.min(shown, THOUGHTS.length)}
      />
    </Reserve>
  )
}

function AnswerBlock({
  streaming,
  text,
  caret,
}: {
  streaming: boolean
  text: React.ReactNode
  caret?: React.ReactNode | false
}) {
  return (
    <Response streaming={streaming} caret={caret}>
      <ResponseContent>{text}</ResponseContent>
      <ResponseSources count={10}>
        {ANSWER_SOURCES.map((x) => (
          <Source key={x.host} name={x.name} host={x.host} />
        ))}
      </ResponseSources>
      <ResponseActions>
        <ResponseAction label="Copy">
          <CopyIcon />
        </ResponseAction>
        <ResponseAction label="Retry">
          <RetryIcon />
        </ResponseAction>
        <ResponseAction label="Good response">
          <ThumbIcon />
        </ResponseAction>
        <ResponseAction label="Bad response">
          <ThumbIcon className="rotate-180" />
        </ResponseAction>
      </ResponseActions>
      <ResponseFollowUps>
        <ResponseFollowUp>Which flavours sell best in winter</ResponseFollowUp>
        <ResponseFollowUp>Compare gelato and soft serve margins</ResponseFollowUp>
      </ResponseFollowUps>
    </Response>
  )
}

const SPEEDS: Record<string, { charsPerTick: number; interval: number }> = {
  slow: { charsPerTick: 1, interval: 45 },
  default: { charsPerTick: 2, interval: 28 },
  fast: { charsPerTick: 5, interval: 18 },
}

const CARETS: Record<string, React.ReactNode | false | undefined> = {
  block: undefined,
  bar: "|",
  underscore: "_",
  dot: "●",
  none: false,
}

/** One card, with the speed and caret exposed as controls. */
function ResponsePlayground() {
  const [speed, setSpeed] = React.useState("default")
  const [caret, setCaret] = React.useState("block")

  // Plays once and stops. A demo that replays forever is a distraction on a
  // page you are trying to read; Replay puts it under the reader's control.
  const { text, streaming, restart } = useTypewriter(ANSWER, {
    ...SPEEDS[speed],
    loop: false,
  })

  return (
    <div className="flex flex-col gap-4">
      <DemoBar>
        <Picker
          label="Speed"
          value={speed}
          // Changing a knob replays, so the effect of the change is visible
          // straight away rather than on the next manual run.
          onChange={(v) => {
            setSpeed(v)
            restart()
          }}
          options={[
            { value: "slow", label: "Slow" },
            { value: "default", label: "Default" },
            { value: "fast", label: "Fast" },
          ]}
        />
        <Picker
          label="Caret"
          value={caret}
          onChange={(v) => {
            setCaret(v)
            restart()
          }}
          options={[
            { value: "block", label: "Block" },
            { value: "bar", label: "Bar |" },
            { value: "underscore", label: "Underscore _" },
            { value: "dot", label: "Dot ●" },
            { value: "none", label: "None" },
          ]}
        />
        <button
          type="button"
          onClick={restart}
          className="shrink-0 rounded-md border border-border bg-card px-2.5 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors duration-(--duration-fast) ease-(--ease-swagui) hover:border-muted-foreground/40 hover:text-foreground"
        >
          Replay
        </button>
      </DemoBar>

      <Reserve spacer={<AnswerBlock streaming={false} text={ANSWER} />}>
        <AnswerBlock streaming={streaming} text={text} caret={CARETS[caret]} />
      </Reserve>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

function ThumbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
      <path d="M7 11l4-8a2 2 0 0 1 3 1.8V9h4.6a2 2 0 0 1 2 2.5l-1.6 7A2 2 0 0 1 17 20H7" />
    </svg>
  )
}

export function AgentView({ displayStyle }: { displayStyle: React.CSSProperties }) {
  return (
    <div className="mx-auto max-w-[860px] px-10 py-10">
      <header className="pb-8">
        <h1 className="display text-[34px]" style={displayStyle}>
          Agent
        </h1>
        <p
          className="mt-2 max-w-[64ch] text-[14px]"
          style={{ color: "var(--muted-fg)" }}
        >
          Primitives for interfaces where a model is doing the work — the parts
          that make its state legible. These sit on top of the chat shell
          already in the registry (<code className="mono">message</code>,{" "}
          <code className="mono">bubble</code>,{" "}
          <code className="mono">message-scroller</code>) rather than replacing
          it.
        </p>
      </header>

      <Row
        index="01"
        title="Reasoning"
        note="One disclosure shell for everything the agent did on the way to an answer. Thinking, searching and tool calls are the same object — a one-line summary you can open into the evidence — so they share a shell and differ only in content."
      >
        <div className="flex flex-col gap-9">
          <Case label="Thinking — streaming">
            <LiveReasoning />
          </Case>

          <Case label="Thinking — settled, collapsed by default">
            <Reasoning duration={4}>
              <ReasoningTrigger />
              <ReasoningContent>
                {THOUGHTS.map((t) => (
                  <ReasoningText key={t}>{t}</ReasoningText>
                ))}
              </ReasoningContent>
            </Reasoning>
          </Case>

          <Case label="Tool calls">
            <Reasoning defaultOpen>
              <ReasoningTrigger>Ran 3 tools</ReasoningTrigger>
              <ReasoningContent>
                <ReasoningRow label="Read">flavors.ts</ReasoningRow>
                <ReasoningRow label="Edit">
                  ChurnSchedule.tsx <span className="text-success">+74</span>{" "}
                  <span className="text-destructive">−41</span>
                </ReasoningRow>
                <ReasoningRow label="Run">npm run freeze</ReasoningRow>
              </ReasoningContent>
            </Reasoning>
          </Case>

          <Case label="Search">
            <Reasoning defaultOpen>
              <ReasoningTrigger>Searched the web</ReasoningTrigger>
              <ReasoningContent>
                <ReasoningRow>best waffle cone supplier</ReasoningRow>
                {[
                  { name: "Joy Cone", host: "joycone.com" },
                  { name: "WebstaurantStore", host: "webstaurantstore.com" },
                  { name: "The Konery", host: "thekonery.com" },
                ].map((s) => (
                  <Source key={s.host} name={s.name} host={s.host} />
                ))}
                <span className="text-sm text-muted-foreground/70">+7 more</span>
              </ReasoningContent>
            </Reasoning>
          </Case>
        </div>
      </Row>

      <Row
        index="02"
        title="Response"
        note="The answer, and the exact counterweight to the trace above. This is the only thing on the surface at full contrast, on a wider measure and looser leading. Actions and follow-ups are withheld until it has finished arriving."
      >
        <div className="flex flex-col gap-9">
          <Case label="Streaming — speed and caret are props">
            <ResponsePlayground />
          </Case>

          <Case label="Settled, with inline citations">
            <Response>
              <ResponseContent>
                Pistachio is your fastest-growing flavour, up 23% this quarter
                <ResponseCitation index={1} /> and the only line that grew every
                week. Rocky Road is the drag at −6%
                <ResponseCitation index={2} />, and it has missed the 40-scoop
                threshold three weeks running
                <ResponseCitation index={3} />.
              </ResponseContent>
              <ResponseSources count={10}>
                {ANSWER_SOURCES.map((x) => (
                  <Source key={x.host} name={x.name} host={x.host} />
                ))}
              </ResponseSources>
              <ResponseActions>
                <ResponseAction label="Copy">
                  <CopyIcon />
                </ResponseAction>
                <ResponseAction label="Retry">
                  <RetryIcon />
                </ResponseAction>
                <ResponseAction label="Good response">
                  <ThumbIcon />
                </ResponseAction>
                <ResponseAction label="Bad response">
                  <ThumbIcon className="rotate-180" />
                </ResponseAction>
              </ResponseActions>
              <ResponseFollowUps>
                <ResponseFollowUp>
                  Which flavours sell best in winter
                </ResponseFollowUp>
                <ResponseFollowUp>
                  Compare gelato and soft serve margins
                </ResponseFollowUp>
              </ResponseFollowUps>
            </Response>
          </Case>

          <Case label="Trace above answer — how they read together">
            <div className="flex flex-col gap-3">
              <Reasoning duration={4}>
                <ReasoningTrigger />
                <ReasoningContent>
                  {THOUGHTS.map((t) => (
                    <ReasoningText key={t}>{t}</ReasoningText>
                  ))}
                </ReasoningContent>
              </Reasoning>
              <Response>
                <ResponseContent>
                  Pistachio is your fastest-growing flavour, up 23% this quarter
                  <ResponseCitation index={1} />. I would churn it first on
                  Saturday so the batch firms before the afternoon rush.
                </ResponseContent>
                <ResponseActions>
                  <ResponseAction label="Copy">
                    <CopyIcon />
                  </ResponseAction>
                  <ResponseAction label="Retry">
                    <RetryIcon />
                  </ResponseAction>
                </ResponseActions>
              </Response>
            </div>
          </Case>
        </div>
      </Row>
    </div>
  )
}
