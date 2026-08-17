"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
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
import {
  Approval,
  ApprovalConfirm,
  ApprovalDescription,
  ApprovalDismiss,
  ApprovalFooter,
  ApprovalOption,
  ApprovalOptions,
  ApprovalQuestion,
} from "@/registry/ui/approval"
import { Source } from "@/registry/ui/source"

/* ------------------------------ demo chrome ------------------------------ */

function Section({
  index,
  title,
  children,
}: {
  index: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-12">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="mono text-[10px]" style={{ color: "var(--muted-fg)" }}>
          {index}
        </span>
        <h3
          className="mono text-[10px] uppercase"
          style={{ letterSpacing: "0.18em", color: "var(--muted-fg)" }}
        >
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

/**
 * A stage for one component.
 *
 * The card is the frame, the component sits in it with room to breathe, and
 * the knobs live along the bottom edge inside the same frame. Putting them
 * there rather than above ties them to the thing they change, and the card
 * border does the work of separating demo from page — no dashed strip needed.
 */
function Demo({
  controls,
  action,
  children,
}: {
  controls?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="relative rounded-xl border border-border bg-card">
      {action ? <div className="absolute top-3 right-3 z-10">{action}</div> : null}

      <div className="px-6 pt-6 pb-5">{children}</div>

      {/* No rule above these. The whitespace already separates them, and a
          divider would read as a second region rather than as knobs sitting on
          the floor of the card. */}
      {controls ? (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-6 pb-3.5">
          {controls}
        </div>
      ) : null}
    </div>
  )
}

function Segmented<T extends string>({
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
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className="mono shrink-0 text-[8px] uppercase"
        style={{ letterSpacing: "0.14em", color: "var(--muted-fg)" }}
      >
        {label}
      </span>
      <div className="inline-flex items-center rounded-full bg-muted p-px">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-full px-2 py-[3px] text-[10.5px] leading-none outline-none",
                "transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-(--ease-swagui)",
                "focus-visible:ring-2 focus-visible:ring-ring/60",
                active
                  ? "bg-card font-medium text-foreground shadow-(--shadow-hairline)"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg border border-border bg-card outline-none",
        "text-muted-foreground/80",
        "transition-[color,border-color,transform] duration-(--duration-fast) ease-(--ease-swagui)",
        "hover:border-muted-foreground/40 hover:text-foreground active:scale-90",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        "[&_svg]:size-3.5"
      )}
    >
      {children}
    </button>
  )
}

/* -------------------------------- fixtures -------------------------------- */

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

const WEB_RESULTS = [
  { name: "Joy Cone", host: "joycone.com" },
  { name: "WebstaurantStore", host: "webstaurantstore.com" },
  { name: "The Konery", host: "thekonery.com" },
]

const ANSWER =
  "Pistachio is your fastest-growing flavour — sales are up 23% this quarter, and it is the only line in the case that grew every week. Rocky Road is the drag, down 6%, and it has now missed the 40-scoop threshold three weeks running."

/**
 * Holds the height of a demo that animates.
 *
 * A finished copy is rendered invisibly in the same grid cell, so the box is
 * always sized for the settled state and the live copy grows inside it. The
 * spacer wraps the whole block rather than the prose: wrapping the prose made
 * it a grid item, which is block-level, and pushed the caret onto its own line.
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

/* ------------------------------ 01 reasoning ------------------------------ */

type TraceKind = "thinking" | "tools" | "search"

function TraceBody({ kind, shown }: { kind: TraceKind; shown: number }) {
  if (kind === "thinking") {
    return (
      <>
        {THOUGHTS.slice(0, shown).map((t) => (
          <ReasoningText key={t}>{t}</ReasoningText>
        ))}
      </>
    )
  }

  if (kind === "tools") {
    const rows = [
      { label: "Read", body: <>flavors.ts</> },
      {
        label: "Edit",
        body: (
          <>
            ChurnSchedule.tsx <span className="text-success">+74</span>{" "}
            <span className="text-destructive">−41</span>
          </>
        ),
      },
      { label: "Run", body: <>npm run freeze</> },
    ]
    return (
      <>
        {rows.slice(0, shown).map((r) => (
          <ReasoningRow key={r.label} label={r.label}>
            {r.body}
          </ReasoningRow>
        ))}
      </>
    )
  }

  return (
    <>
      <ReasoningRow>best waffle cone supplier</ReasoningRow>
      {WEB_RESULTS.slice(0, Math.max(0, shown - 1)).map((s) => (
        <Source key={s.host} name={s.name} host={s.host} />
      ))}
      {shown > WEB_RESULTS.length ? (
        <span className="text-sm text-muted-foreground/70">+7 more</span>
      ) : null}
    </>
  )
}

const TRACE_LABEL: Record<TraceKind, string> = {
  thinking: "Thought for 6.4s",
  tools: "Ran 3 tools",
  search: "Searched the web",
}

const TRACE_STEPS: Record<TraceKind, number> = {
  thinking: 3,
  tools: 3,
  search: 4,
}

function TraceBlock({
  kind,
  streaming,
  shown,
}: {
  kind: TraceKind
  streaming: boolean
  shown: number
}) {
  return (
    <Reasoning streaming={streaming} duration={streaming ? undefined : 6.4} defaultOpen>
      <ReasoningTrigger>{streaming ? undefined : TRACE_LABEL[kind]}</ReasoningTrigger>
      <ReasoningContent>
        <TraceBody kind={kind} shown={shown} />
      </ReasoningContent>
    </Reasoning>
  )
}

function ReasoningDemo() {
  const [kind, setKind] = React.useState<TraceKind>("thinking")
  const [live, setLive] = React.useState<"streaming" | "settled">("streaming")
  const [shown, setShown] = React.useState(1)

  const total = TRACE_STEPS[kind]

  React.useEffect(() => {
    if (live === "settled") return
    setShown(1)
    const id = window.setInterval(
      () => setShown((n) => (n >= total + 1 ? 1 : n + 1)),
      1500
    )
    return () => window.clearInterval(id)
  }, [live, total, kind])

  const streaming = live === "streaming" && shown <= total

  return (
    <Demo
      controls={
        <>
          <Segmented
            label="Content"
            value={kind}
            onChange={setKind}
            options={[
              { value: "thinking", label: "Thinking" },
              { value: "tools", label: "Tools" },
              { value: "search", label: "Search" },
            ]}
          />
          <Segmented
            label="State"
            value={live}
            onChange={setLive}
            options={[
              { value: "streaming", label: "Streaming" },
              { value: "settled", label: "Settled" },
            ]}
          />
        </>
      }
    >
      <Reserve spacer={<TraceBlock kind={kind} streaming={false} shown={total + 1} />}>
        <TraceBlock
          kind={kind}
          streaming={streaming}
          shown={live === "settled" ? total + 1 : Math.min(shown, total + 1)}
        />
      </Reserve>
    </Demo>
  )
}

/* ------------------------------- 02 response ------------------------------ */

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

function ResponseDemo() {
  const [speed, setSpeed] = React.useState("default")
  const [caret, setCaret] = React.useState("block")

  // Plays once and stops; a demo that replays forever is a distraction on a
  // page you are trying to read.
  const { text, streaming, restart } = useTypewriter(ANSWER, {
    ...SPEEDS[speed],
    loop: false,
  })

  return (
    <Demo
      action={
        <IconButton label="Replay" onClick={restart}>
          <RetryIcon />
        </IconButton>
      }
      controls={
        <>
          <Segmented
            label="Speed"
            value={speed}
            // Changing a knob replays, so the effect is visible straight away.
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
          <Segmented
            label="Caret"
            value={caret}
            onChange={(v) => {
              setCaret(v)
              restart()
            }}
            options={[
              { value: "block", label: "Block" },
              { value: "bar", label: "|" },
              { value: "underscore", label: "_" },
              { value: "dot", label: "●" },
              { value: "none", label: "None" },
            ]}
          />
        </>
      }
    >
      <Reserve spacer={<AnswerBlock streaming={false} text={ANSWER} />}>
        <AnswerBlock streaming={streaming} text={text} caret={CARETS[caret]} />
      </Reserve>
    </Demo>
  )
}

/* ------------------------------ 03 approval ------------------------------ */

type ApprovalKind = "choice" | "multi" | "confirm" | "danger"

function ApprovalDemo() {
  const [kind, setKind] = React.useState<ApprovalKind>("choice")
  const [answer, setAnswer] = React.useState<string | string[] | undefined>(
    undefined
  )

  // A fresh question each time the kind changes, so switching does not carry a
  // decision over to a different ask.
  React.useEffect(() => setAnswer(undefined), [kind])

  return (
    <Demo
      action={
        <IconButton label="Reset" onClick={() => setAnswer(undefined)}>
          <RetryIcon />
        </IconButton>
      }
      controls={
        <Segmented
          label="Ask"
          value={kind}
          onChange={setKind}
          options={[
            { value: "choice", label: "Choice" },
            { value: "multi", label: "Multi-select" },
            { value: "confirm", label: "Confirm" },
            { value: "danger", label: "Destructive" },
          ]}
        />
      }
    >
      <Approval
        value={answer}
        multiple={kind === "multi"}
        onValueChange={setAnswer}
      >
        {kind === "choice" ? (
          <>
            <ApprovalQuestion>
              How many flavours should we launch this summer?
            </ApprovalQuestion>
            <ApprovalDescription>
              This sets the printed menu and the reorder volumes for June.
            </ApprovalDescription>
            <ApprovalOptions>
              <ApprovalOption value="three" hint="core line">
                Three
              </ApprovalOption>
              <ApprovalOption value="five" hint="full case">
                Five
              </ApprovalOption>
              <ApprovalOption value="one" hint="pistachio only">
                Just one hero
              </ApprovalOption>
            </ApprovalOptions>
            <ApprovalFooter>
              <ApprovalDismiss>Ask me later</ApprovalDismiss>
            </ApprovalFooter>
          </>
        ) : kind === "multi" ? (
          <>
            <ApprovalQuestion>
              Which flavours go on the summer menu?
            </ApprovalQuestion>
            <ApprovalDescription>
              Pick as many as you want. Nothing is ordered until you confirm.
            </ApprovalDescription>
            <ApprovalOptions>
              <ApprovalOption value="pistachio" hint="+23%">
                Pistachio
              </ApprovalOption>
              <ApprovalOption value="mint" hint="+12%">
                Mint chip
              </ApprovalOption>
              <ApprovalOption value="peach" hint="seasonal">
                Peach
              </ApprovalOption>
              <ApprovalOption value="rocky" hint="−6%">
                Rocky Road
              </ApprovalOption>
            </ApprovalOptions>
            <ApprovalFooter>
              <ApprovalConfirm>Submit</ApprovalConfirm>
              <ApprovalDismiss>Skip</ApprovalDismiss>
            </ApprovalFooter>
          </>
        ) : kind === "confirm" ? (
          <>
            <ApprovalQuestion>Place this restock order?</ApprovalQuestion>
            <ApprovalDescription>
              240 waffle cones from cone_king, arriving in seven days.
            </ApprovalDescription>
            <ApprovalOptions>
              <ApprovalOption value="approve">Place the order</ApprovalOption>
              <ApprovalOption value="decline" hint="I will do it myself">
                Not now
              </ApprovalOption>
            </ApprovalOptions>
          </>
        ) : (
          <>
            <ApprovalQuestion>
              Retire Rocky Road from every store?
            </ApprovalQuestion>
            <ApprovalDescription>
              Removes it from 12 menus and cancels the standing dairy order.
              This cannot be undone from here.
            </ApprovalDescription>
            <ApprovalOptions>
              <ApprovalOption value="retire" intent="danger">
                Retire the flavour
              </ApprovalOption>
              <ApprovalOption value="keep">Keep it for now</ApprovalOption>
            </ApprovalOptions>
          </>
        )}
      </Approval>
    </Demo>
  )
}

/* --------------------------------- icons --------------------------------- */

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

/* ---------------------------------- view ---------------------------------- */

export function AgentView({ displayStyle }: { displayStyle: React.CSSProperties }) {
  return (
    <div className="mx-auto max-w-[860px] px-10 py-10">
      <header className="pb-10">
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

      <Section
        index="01"
        title="Reasoning"
      >
        <ReasoningDemo />
      </Section>

      <Section
        index="02"
        title="Response"
      >
        <ResponseDemo />

        <Demo>
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
        </Demo>
      </Section>

      <Section index="03" title="Approval">
        <ApprovalDemo />
      </Section>
    </div>
  )
}
