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
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputButton,
  PromptInputMenu,
  PromptInputModelSelect,
  PromptInputSubmit,
  PromptInputEditor,
  PromptInputToolbar,
  PromptInputTools,
} from "@/registry/ui/prompt-input"
import {
  SelectionActions,
  SelectionActionsAction,
  SelectionActionsContent,
  SelectionActionsInput,
  SelectionActionsMore,
  SelectionActionsToolbar,
} from "@/registry/ui/selection-actions"
import { faviconSrc, Source, SourceIcon } from "@/registry/ui/source"

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

/* ----------------------------- 04 prompt input ---------------------------- */

const MODELS = [
  { value: "sprinkles-5", label: "Sprinkles 5", hint: "Flagship" },
  { value: "vanilla-1", label: "Vanilla 1", hint: "Basic" },
  { value: "freezer-burn", label: "Freezer Burn 0.4", hint: "Stale" },
]

const COMMANDS = [
  { value: "compare", label: "compare", hint: "Flavour vs. last summer" },
  { value: "churn-plan", label: "churn-plan", hint: "Draft a churn schedule" },
  { value: "restock", label: "restock", hint: "Build a reorder list" },
  { value: "draft-email", label: "draft-email", hint: "Write a supplier email" },
  { value: "summarize", label: "summarize", hint: "Digest the thread so far" },
]

/*
  Real logos, pulled through the same favicon resolver the Source component
  uses. Hand-drawing brand marks gets them subtly wrong and re-drawing them per
  project does not scale; a host is the one identifier every connected app
  already has.
*/
const APPS = [
  { host: "gmail.com", label: "Gmail", hint: "Read and manage mail", badge: "Connected" },
  { host: "drive.google.com", label: "Google Drive", hint: "Docs, sheets and files" },
  { host: "slack.com", label: "Slack", hint: "Channels and DMs" },
  { host: "figma.com", label: "Figma", hint: "Design files and comments" },
  { host: "notion.so", label: "Notion", hint: "Pages and databases" },
  { host: "github.com", label: "GitHub", hint: "Repos, issues and PRs" },
  { host: "linear.app", label: "Linear", hint: "Issues and cycles" },
]

/* Files in the workspace, the way a code editor lets you reference one. */
const FILES = [
  { path: "ChurnSchedule.tsx", hint: "components", glyph: "tsx" },
  { path: "flavors.ts", hint: "lib", glyph: "ts" },
  { path: "forecast.py", hint: "scripts", glyph: "py" },
  { path: "menu.css", hint: "styles", glyph: "css" },
  { path: "sales-q3.csv", hint: "data", glyph: "csv" },
]

function buildSources(onUpload: () => void) {
  return [
  {
    value: "files",
    label: "Photos & files",
    hint: "Upload from this computer",
    icon: <PaperclipIcon />,
    group: "Add",
    // Uploading is not a reference, so it opens a picker instead of becoming
    // a chip in the sentence.
    action: onUpload,
  },
  {
    value: "web",
    label: "Web search",
    hint: "Real-time news and info",
    icon: <GlobeIcon />,
    group: "Add",
  },
  ...APPS.map((a) => ({
    value: a.label.toLowerCase().replace(/\s+/g, "-"),
    label: a.label,
    hint: a.hint,
    badge: a.badge,
    group: "Apps",
    // The same favicon the menu row shows is carried into the chip.
    iconSrc: faviconSrc(a.host),
    icon: <SourceIcon name={a.label} host={a.host} className="ring-0" />,
  })),
  ...FILES.map((f) => ({
    value: f.path,
    label: f.path,
    hint: f.hint,
    glyph: f.glyph,
    group: "Files",
    icon: <FileIcon />,
  })),
  ]
}

function PromptInputDemo() {
  const [shape, setShape] = React.useState("rounded")
  const [model, setModel] = React.useState("vanilla-1")
  const [status, setStatus] = React.useState("ready")
  const [files, setFiles] = React.useState(["sales-q3.csv"])
  const uploadRef = React.useRef<HTMLInputElement | null>(null)

  const sources = React.useMemo(
    () => buildSources(() => uploadRef.current?.click()),
    []
  )
  const [sent, setSent] = React.useState<string | null>(null)

  // A real send loop, so the send-becomes-stop swap can actually be exercised.
  React.useEffect(() => {
    if (status !== "streaming") return
    const id = window.setTimeout(() => setStatus("ready"), 4000)
    return () => window.clearTimeout(id)
  }, [status])

  return (
    <Demo
      controls={
        <>
          <Segmented
            label="Shape"
            value={shape}
            onChange={setShape}
            options={[
              { value: "rounded", label: "Rounded" },
              { value: "pill", label: "Pill" },
            ]}
          />
          <Segmented
            label="State"
            value={status}
            onChange={setStatus}
            options={[
              { value: "ready", label: "Ready" },
              { value: "streaming", label: "Streaming" },
            ]}
          />
        </>
      }
    >
      <div className="mx-auto flex w-full max-w-[46ch] flex-col gap-2">
        <input
          ref={uploadRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []).map((f) => f.name)
            if (picked.length) setFiles((xs) => [...new Set([...xs, ...picked])])
            e.target.value = ""
          }}
        />
        {sent ? (
          <p className="text-[13px] text-muted-foreground">
            Sent: <span className="text-foreground">{sent}</span>
          </p>
        ) : null}

        <PromptInput
          shape={shape === "pill" ? "pill" : "rounded"}
          status={status === "streaming" ? "streaming" : "ready"}
          onSubmit={(v) => {
            setSent(v)
            setStatus("streaming")
          }}
          onStop={() => setStatus("ready")}
        >
          {/* Same primitive, two triggers. */}
          <PromptInputMenu
            trigger="/"
            items={COMMANDS}
            onSelect={(c) => setSent(`/${c}`)}
            empty="No matching command"
          />
          <PromptInputMenu trigger="@" items={sources} empty="No matching source" />

          {files.length ? (
            <PromptInputAttachments>
              {files.map((f) => (
                <PromptInputAttachment
                  key={f}
                  onRemove={() => setFiles((xs) => xs.filter((x) => x !== f))}
                >
                  {f}
                </PromptInputAttachment>
              ))}
            </PromptInputAttachments>
          ) : null}

          <PromptInputEditor placeholder="Ask anything — / for commands, @ for files and apps" />

          <PromptInputToolbar>
            <PromptInputTools>
              {/* Same menu the @ trigger opens, reached with the mouse. */}
              <PromptInputButton label="Add context" opensMenu="@">
                <PlusIcon />
              </PromptInputButton>
              <PromptInputButton label="Dictate">
                <MicIcon />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputModelSelect
              models={MODELS}
              value={model}
              onValueChange={setModel}
            />
            <PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </Demo>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.5 12.5 21a5 5 0 0 1-7-7l8-8a3.5 3.5 0 1 1 5 5l-8 8a2 2 0 1 1-3-3l7-7" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v5" />
    </svg>
  )
}

/* -------------------------- 05 selection actions -------------------------- */

const PASSAGE =
  "Pistachio holds the top slot all weekend. Churn it first thing Saturday so the batch has time to firm up before the afternoon rush. Rocky Road can wait until Monday — it has missed the 40-scoop threshold three weeks running, and the freezer window is better spent on the line that is actually growing."

function SelectionActionsDemo() {
  const [last, setLast] = React.useState<{ action: string; text: string } | null>(
    null
  )

  return (
    <Demo
      action={
        last ? (
          <IconButton label="Clear" onClick={() => setLast(null)}>
            <RetryIcon />
          </IconButton>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <SelectionActions onAction={(action, text) => setLast({ action, text })}>
          <SelectionActionsContent className="max-w-[62ch] text-[15px] leading-relaxed text-foreground">
            {PASSAGE}
          </SelectionActionsContent>

          <SelectionActionsToolbar>
            <SelectionActionsInput />
            <SelectionActionsAction value="explain" icon={<HelpIcon />}>
              Explain
            </SelectionActionsAction>
            <SelectionActionsAction value="improve" icon={<WandIcon />}>
              Improve
            </SelectionActionsAction>
            <SelectionActionsMore>
              <SelectionActionsAction value="shorten" icon={<ShortenIcon />}>
                Shorten
              </SelectionActionsAction>
              <SelectionActionsAction value="tone" icon={<ToneIcon />}>
                Tone
              </SelectionActionsAction>
              <SelectionActionsAction value="grammar" icon={<GrammarIcon />}>
                Grammar
              </SelectionActionsAction>
            </SelectionActionsMore>
          </SelectionActionsToolbar>
        </SelectionActions>

        {last ? (
          <div className="rounded-lg border border-border bg-background p-3 text-[13px]">
            <p className="mono text-[10px] uppercase" style={{ letterSpacing: "0.14em", color: "var(--muted-fg)" }}>
              {last.action}
            </p>
            <p className="mt-1 text-muted-foreground">
              &ldquo;{last.text}&rdquo;
            </p>
          </div>
        ) : (
          <p className="text-[12px]" style={{ color: "var(--muted-fg)" }}>
            Highlight any part of the passage.
          </p>
        )}
      </div>
    </Demo>
  )
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9.5a3 3 0 0 1 5.6 1.2c0 2-3 2.3-3 4" />
      <path d="M12 17.5h.01" />
    </svg>
  )
}

function WandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.6 3.2a.4.4 0 0 1 .8 0l1 3.9a2 2 0 0 0 1.5 1.4l3.9 1a.4.4 0 0 1 0 .8l-3.9 1a2 2 0 0 0-1.5 1.5l-1 3.9a.4.4 0 0 1-.8 0l-1-3.9a2 2 0 0 0-1.4-1.5l-4-1a.4.4 0 0 1 0-.8l4-1a2 2 0 0 0 1.4-1.4Z" />
      <path d="M18.4 15.3a.25.25 0 0 1 .5 0l.5 1.8a1 1 0 0 0 .7.7l1.8.5a.25.25 0 0 1 0 .5l-1.8.5a1 1 0 0 0-.7.7l-.5 1.8a.25.25 0 0 1-.5 0l-.5-1.8a1 1 0 0 0-.7-.7l-1.8-.5a.25.25 0 0 1 0-.5l1.8-.5a1 1 0 0 0 .7-.7Z" />
    </svg>
  )
}

function ToneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 14.5a4 4 0 0 0 6 0" />
      <path d="M9.5 9.5h.01M14.5 9.5h.01" />
    </svg>
  )
}

function GrammarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15V9h3.2M8.6 12.4h1.6M13.4 9h3.6M15.2 9v6" />
    </svg>
  )
}

function ShortenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M4 12h10M4 17h6" />
    </svg>
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

      <Section index="04" title="Prompt input">
        <PromptInputDemo />
      </Section>

      <Section index="05" title="Selection actions">
        <SelectionActionsDemo />
      </Section>
    </div>
  )
}
