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
  ResponseUsage,
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
  PromptInputContextIndicator,
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
import {
  ToolCall,
  ToolCallDiff,
  ToolCallField,
  ToolCallFields,
  ToolCallFile,
  ToolCallFiles,
  ToolCallImage,
  ToolCallOutput,
  ToolCalls,
} from "@/registry/ui/tool-call"
import { Task, Tasks } from "@/registry/ui/tasks"
import { AgentWorkingMark, type AgentWorkingMarkVariant } from "@/registry/ui/agent-working-mark"
import { Subagent, Subagents } from "@/registry/ui/subagent"
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactContent,
  ArtifactDescription,
  ArtifactMeta,
  ArtifactOpenMark,
  ArtifactPreview,
  ArtifactTitle,
} from "@/registry/ui/artifact"
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
      { label: "Run", body: <>bun run freeze</> },
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
      <ResponseUsage duration={8} tokens={1248} />
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
  const [reasoningEffort, setReasoningEffort] = React.useState("medium")
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
            <PromptInputContextIndicator used={28400} total={128000} />
            <PromptInputModelSelect
              models={MODELS}
              value={model}
              onValueChange={setModel}
              reasoningEffort={reasoningEffort}
              onReasoningEffortChange={setReasoningEffort}
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

/* ------------------------------ 06 tool calls ----------------------------- */

type ToolScene = "run" | "kinds" | "failure" | "live"

function ToolCallsDemo() {
  const [scene, setScene] = React.useState<ToolScene>("run")

  return (
    <Demo
      controls={
        <Segmented
          label="Scene"
          value={scene}
          onChange={setScene}
          options={[
            { value: "run", label: "A run" },
            { value: "kinds", label: "Every kind" },
            { value: "failure", label: "Failure" },
            { value: "live", label: "In flight" },
          ]}
        />
      }
    >
      <div className="min-h-[19rem]">
        {scene === "run" ? <SceneRun /> : null}
        {scene === "kinds" ? <SceneKinds /> : null}
        {scene === "failure" ? <SceneFailure /> : null}
        {scene === "live" ? <SceneLive /> : null}
      </div>
    </Demo>
  )
}

/** The shape a real turn takes: think, read, change, verify, report. */
function SceneRun() {
  return (
    <div className="flex flex-col gap-3">
      <ToolCalls>
        <ToolCall kind="think" label="Planned the churn schedule" />
        <ToolCall kind="read" target="flavors.ts" meta="1.2 kB" />
        <ToolCall kind="write" label="Write 204 lines" target="ChurnSchedule.tsx" />
        <ToolCall kind="bash" label="Rebuild" target="bun run freeze" meta="1.2s">
          <ToolCallOutput>{"✓ built in 1.2s\n✓ 34 checks passed"}</ToolCallOutput>
        </ToolCall>
      </ToolCalls>

      <ToolCallFiles>
        <ToolCallFile path="flavors.css" added={13} />
        <ToolCallFile path="ChurnSchedule.tsx" added={74} removed={41} />
        <ToolCallFile path="menu.ts" added={8} removed={2} />
        <span className="mono text-[12px] text-muted-foreground/70">+2 more</span>
      </ToolCallFiles>
    </div>
  )
}

/** One of each, so the weight difference between them is visible at a glance. */
function SceneKinds() {
  return (
    <ToolCalls>
      <ToolCall kind="read" target="flavors.ts" />
      <ToolCall kind="search" target="best waffle cone supplier" meta="10 results" />
      <ToolCall kind="fetch" target="joycone.com/wholesale" meta="200" />
      <ToolCall kind="edit" target="menu.ts">
        <ToolCallDiff added={8} removed={2} />
        <ToolCallOutput>
          {"- const flavors = base\n+ const flavors = base.filter(inSeason)"}
        </ToolCallOutput>
      </ToolCall>
      <ToolCall kind="bash" label="Test" target="bun run freeze" meta="1.2s">
        <ToolCallOutput>{"✓ built in 1.2s\n✓ 34 checks passed"}</ToolCallOutput>
      </ToolCall>
      <ToolCall kind="code" label="Run Python" target="forecast.py" meta="0.4s">
        <ToolCallOutput>{"peak_week = 27\nconfidence = 0.86"}</ToolCallOutput>
      </ToolCall>
      <ToolCall kind="image" label="Generate" target="flavor-chart.png" meta="1280×720">
        <ToolCallImage
          src="https://www.google.com/s2/favicons?domain=joycone.com&sz=128"
          caption="flavor-chart.png · 1280×720"
        />
      </ToolCall>
      <ToolCall kind="skill" label="Skill" target="impeccable" meta="polish">
        <ToolCallFields>
          <ToolCallField name="target">registry/ui/menu.tsx</ToolCallField>
          <ToolCallField name="mode">Operate</ToolCallField>
        </ToolCallFields>
      </ToolCall>
      <ToolCall kind="mcp" label="Call" target="linear.create_issue">
        <ToolCallFields>
          <ToolCallField name="team">Creamery Ops</ToolCallField>
          <ToolCallField name="title">Retire Rocky Road</ToolCallField>
        </ToolCallFields>
      </ToolCall>
    </ToolCalls>
  )
}

/** The rule that matters: a failure cannot be tidied away. */
function SceneFailure() {
  return (
    <ToolCalls>
      <ToolCall kind="read" target="flavors.ts" />
      <ToolCall
        kind="edit"
        target="ChurnSchedule.tsx"
        meta={<ToolCallDiff added={74} removed={41} />}
      />
      <ToolCall kind="bash" label="Rebuild" target="bun run freeze" status="error" meta="exit 1">
        <ToolCallOutput>
          {"ChurnSchedule.tsx:82:14 - error TS2551\n  Property 'churnAt' does not exist on type 'Batch'.\n\nFound 1 error."}
        </ToolCallOutput>
      </ToolCall>
    </ToolCalls>
  )
}

/** A run assembling itself: each call arrives, works, settles, then the next. */
function SceneLive() {
  const steps = [
    { kind: "read" as const, target: "flavors.ts", meta: "1.2 kB" },
    { kind: "write" as const, target: "ChurnSchedule.tsx", label: "Write 204 lines" },
    { kind: "bash" as const, target: "bun run freeze", label: "Rebuild", meta: "1.2s" },
    { kind: "image" as const, target: "flavor-chart.png", label: "Generate", meta: "1280×720" },
  ]

  // One tick per step, then a pause on the finished run before it replays.
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = window.setInterval(() => setTick((n) => (n + 1) % (steps.length + 3)), 1100)
    return () => window.clearInterval(id)
  }, [steps.length])

  const settled = tick >= steps.length
  const shown = settled ? steps.length : tick + 1

  return (
    <ToolCalls key={settled ? "settled" : "working"}>
      {steps.slice(0, shown).map((step, i) => (
        <ToolCall
          key={step.target}
          kind={step.kind}
          label={step.label}
          target={step.target}
          meta={settled || i < tick ? step.meta : undefined}
          status={settled || i < tick ? "success" : "running"}
        />
      ))}
    </ToolCalls>
  )
}

/* -------------------------------- 07 tasks -------------------------------- */

type TaskScene = "working" | "complete" | "failure"

function TasksDemo() {
  const [scene, setScene] = React.useState<TaskScene>("working")

  return (
    <Demo
      controls={
        <Segmented
          label="Scene"
          value={scene}
          onChange={setScene}
          options={[
            { value: "working", label: "Working" },
            { value: "complete", label: "Complete" },
            { value: "failure", label: "Failure" },
          ]}
        />
      }
    >
      <div className="mx-auto max-h-[22rem] max-w-[68ch] overflow-y-auto pr-2">
        <div className="flex flex-col gap-3 pb-2">
          <Reasoning streaming={scene === "working"} duration={scene === "working" ? undefined : 55} defaultOpen={false}>
            <ReasoningTrigger>
              {scene === "working" ? "Working" : "Worked for 55s"}
            </ReasoningTrigger>
            <ReasoningContent>
              <ReasoningRow label="Read">Summer sales and freezer capacity</ReasoningRow>
              <ReasoningRow label="Plan">Saturday churn order</ReasoningRow>
            </ReasoningContent>
          </Reasoning>

          {scene === "working" ? <TasksWorking /> : null}
          {scene === "complete" ? <TasksComplete /> : null}
          {scene === "failure" ? <TasksFailure /> : null}

          <Response>
            <ResponseContent>
              {scene === "working"
                ? "I’m checking freezer capacity before I lock the Saturday batch order."
                : scene === "complete"
                  ? "Pistachio should churn first on Saturday. It has the strongest weekend lift, and the early freezer window gives the batch enough time to firm before the afternoon rush."
                  : "I kept the completed sales analysis, but the churn plan needs a corrected batch record before I can finish the order."}
            </ResponseContent>
          </Response>
        </div>
      </div>
    </Demo>
  )
}

function TasksWorking() {
  return (
    <Tasks
      title="Build the Saturday churn plan"
      status="running"
      completed={1}
      total={4}
      sticky
      defaultOpen
    >
      <Task title="Inspect summer sales" status="completed" />
      <Task title="Confirm freezer capacity" status="running" />
      <Task title="Draft the batch order" status="pending" />
      <Task title="Prepare the cone reorder" status="pending" />
    </Tasks>
  )
}

function TasksComplete() {
  return (
    <Tasks
      title="Finished the Saturday churn plan"
      status="completed"
      completed={4}
      total={4}
      sticky
    >
      <Task title="Inspect summer sales" status="completed" />
      <Task title="Confirm freezer capacity" status="completed" />
      <Task title="Draft the batch order" status="completed" />
      <Task title="Prepare the cone reorder" status="completed" />
    </Tasks>
  )
}

function TasksFailure() {
  return (
    <Tasks
      title="Churn plan needs attention"
      status="error"
      completed={1}
      total={4}
      sticky
    >
      <Task title="Inspect summer sales" status="completed" />
      <Task title="Confirm freezer capacity" status="error" meta="schema mismatch" />
      <Task title="Draft the batch order" status="pending" />
      <Task title="Prepare the cone reorder" status="pending" />
    </Tasks>
  )
}

/* ------------------------------- 08 artifact ------------------------------ */

type ArtifactScene = "app" | "slides" | "document" | "unavailable"

function ArtifactDemo() {
  const [scene, setScene] = React.useState<ArtifactScene>("app")
  const [opened, setOpened] = React.useState("")

  React.useEffect(() => setOpened(""), [scene])

  return (
    <Demo
      controls={
        <Segmented
          label="Artifact"
          value={scene}
          onChange={setScene}
          options={[
            { value: "app", label: "Live app" },
            { value: "slides", label: "Slides" },
            { value: "document", label: "Document" },
            { value: "unavailable", label: "Unavailable" },
          ]}
        />
      }
    >
      <div className="mx-auto flex max-w-[68ch] flex-col gap-3">
        <Response>
          <ResponseContent>
            {scene === "app"
              ? "The inventory dashboard is ready to explore."
              : scene === "slides"
                ? "I turned the summer analysis into a presentation."
                : scene === "document"
                  ? "The supplier brief is ready."
                  : "The original artifact is still part of this conversation, but its file is no longer available."}
          </ResponseContent>
        </Response>

        {scene === "app" ? (
          <Artifact
            kind="app"
            onOpen={() => setOpened("Opened in app preview")}
            openLabel="Open inventory dashboard"
          >
            <ArtifactPreview>
              <AppArtifactPreview />
            </ArtifactPreview>
            <ArtifactContent>
              <ArtifactTitle>Inventory dashboard</ArtifactTitle>
              <ArtifactDescription>Running on localhost:4317</ArtifactDescription>
            </ArtifactContent>
            <ArtifactActions>
              <ArtifactAction aria-label="More artifact actions">
                <MoreIcon />
              </ArtifactAction>
            </ArtifactActions>
            <ArtifactOpenMark />
          </Artifact>
        ) : null}

        {scene === "slides" ? (
          <Artifact
            kind="presentation"
            onOpen={() => setOpened("Opened in presentation viewer")}
            openLabel="Open summer flavor review presentation"
          >
            <ArtifactPreview>
              <SlideArtifactPreview />
            </ArtifactPreview>
            <ArtifactContent>
              <ArtifactTitle>Summer flavor review.pptx</ArtifactTitle>
              <ArtifactDescription>12 slides · ready to present</ArtifactDescription>
              <ArtifactMeta>PPTX · 4.8 MB</ArtifactMeta>
            </ArtifactContent>
            <ArtifactActions>
              <ArtifactAction aria-label="Download presentation">
                <DownloadIcon />
              </ArtifactAction>
            </ArtifactActions>
            <ArtifactOpenMark />
          </Artifact>
        ) : null}

        {scene === "document" ? (
          <Artifact
            kind="document"
            onOpen={() => setOpened("Opened in document viewer")}
            openLabel="Open supplier brief document"
          >
            <ArtifactPreview>
              <DocumentArtifactPreview />
            </ArtifactPreview>
            <ArtifactContent>
              <ArtifactTitle>Supplier brief.docx</ArtifactTitle>
              <ArtifactDescription>
                Vendor shortlist, lead times and next steps
              </ArtifactDescription>
              <ArtifactMeta>DOCX · 184 KB</ArtifactMeta>
            </ArtifactContent>
            <ArtifactOpenMark />
          </Artifact>
        ) : null}

        {scene === "unavailable" ? (
          <Artifact
            kind="spreadsheet"
            status="error"
            onOpen={() => {}}
            openLabel="Sales forecast is unavailable"
          >
            <ArtifactPreview>
              <SheetArtifactPreview />
            </ArtifactPreview>
            <ArtifactContent>
              <ArtifactTitle>Sales forecast.xlsx</ArtifactTitle>
              <ArtifactDescription>File unavailable · it may have been moved</ArtifactDescription>
              <ArtifactMeta>XLSX · created 2 days ago</ArtifactMeta>
            </ArtifactContent>
            <ArtifactActions>
              <ArtifactAction aria-label="Regenerate spreadsheet">
                <RetryIcon />
              </ArtifactAction>
            </ArtifactActions>
            <ArtifactOpenMark />
          </Artifact>
        ) : null}

        <div aria-live="polite" className="h-4 text-[11px] text-muted-foreground">
          {opened}
        </div>
      </div>
    </Demo>
  )
}

function AppArtifactPreview() {
  return (
    <div className="size-full bg-background p-1.5">
      <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card shadow-(--shadow-hairline)">
        <div className="flex h-3 items-center gap-1 border-b border-border px-1.5">
          <span className="size-1 rounded-full bg-muted-foreground/35" />
          <span className="size-1 rounded-full bg-muted-foreground/25" />
          <span className="size-1 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="grid flex-1 grid-cols-[1fr_1.4fr] gap-1 p-1">
          <div className="rounded-sm bg-muted" />
          <div className="flex items-end gap-0.5 rounded-sm bg-muted px-1 pb-1">
            {[35, 58, 43, 76, 64].map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-[1px] bg-brand/65"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideArtifactPreview() {
  return (
    <div className="size-full bg-muted p-1.5">
      <div className="flex h-full flex-col justify-between rounded-sm bg-background p-1.5 shadow-(--shadow-hairline)">
        <div>
          <div className="h-1.5 w-3/4 rounded-full bg-foreground/80" />
          <div className="mt-1 h-1 w-1/2 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="flex h-8 items-end gap-1">
          {[52, 76, 43, 65].map((height, index) => (
            <span
              key={index}
              className="flex-1 rounded-t-[2px] bg-brand/70"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DocumentArtifactPreview() {
  return (
    <div className="size-full bg-muted p-1.5">
      <div className="flex h-full flex-col rounded-sm bg-background p-2 shadow-(--shadow-hairline)">
        <div className="h-1.5 w-5 rounded-full bg-brand/75" />
        <div className="mt-2 flex flex-col gap-1">
          <div className="h-1 w-full rounded-full bg-foreground/70" />
          <div className="h-1 w-4/5 rounded-full bg-muted-foreground/25" />
          <div className="h-1 w-full rounded-full bg-muted-foreground/25" />
          <div className="h-1 w-3/5 rounded-full bg-muted-foreground/25" />
        </div>
      </div>
    </div>
  )
}

function SheetArtifactPreview() {
  return (
    <div className="size-full bg-muted p-1.5">
      <div className="grid h-full grid-cols-3 grid-rows-4 gap-px overflow-hidden rounded-sm bg-border p-px shadow-(--shadow-hairline)">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "bg-background",
              index < 3 && "bg-brand/18",
              index % 3 === 0 && index >= 3 && "bg-success/12"
            )}
          />
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ 09 subagents ------------------------------ */

function SubagentDemo() {
  const [opened, setOpened] = React.useState("")

  return (
    <Demo>
      <div className="mx-auto flex max-w-[34rem] flex-col gap-2">
        <Subagents>
          <Subagent
            name="Source checker"
            description="Waiting for the research brief"
            status="pending"
            duration={0}
          />
          <Subagent
            name="Interface builder"
            description="Building the dashboard preview"
            status="running"
            duration={9}
            onOpen={() => setOpened("Opened interface-builder thread")}
          />
          <Subagent
            name="Data researcher"
            description="Found three useful demand signals"
            status="completed"
            duration={24}
            onOpen={() => setOpened("Opened completed research thread")}
          />
          <Subagent
            name="QA auditor"
            description="Responsive check failed at 390px"
            status="failed"
            duration={16}
            onOpen={() => setOpened("Opened QA failure thread")}
          />
          <Subagent
            name="Copy editor"
            description="Stopped when the brief changed"
            status="cancelled"
            duration={7}
          />
        </Subagents>
        <div aria-live="polite" className="h-4 text-[11px] text-muted-foreground">
          {opened}
        </div>
      </div>
    </Demo>
  )
}

/* -------------------------- 10 working mark lab -------------------------- */

const WORKING_MARKS: {
  variant: AgentWorkingMarkVariant
  label: string
  description: string
}[] = [
  {
    variant: "mobius",
    label: "Möbius weave",
    description: "A bright thread passes over and under one continuous loop.",
  },
  {
    variant: "tesseract",
    label: "Tesseract fold",
    description: "Nested frames trade depth like a four-dimensional hinge.",
  },
  {
    variant: "circuit",
    label: "Inward circuit",
    description: "Two signals run toward the center of an endless square path.",
  },
  {
    variant: "blocks",
    label: "Block wave",
    description: "A straight row of shaded blocks bumps in a continuous wave.",
  },
]

function WorkingMarkDemo({ workingMark }: { workingMark: AgentWorkingMarkVariant }) {
  return (
    <Demo>
      <div className="mx-auto grid w-full max-w-[42rem] gap-2 sm:grid-cols-2">
        {WORKING_MARKS.map((mark) => (
          <div key={mark.variant} className="flex min-w-0 flex-col gap-3 rounded-lg bg-muted/45 p-3">
            <div className="flex h-16 items-center justify-center">
              <AgentWorkingMark
                variant={mark.variant}
                size={42}
                paused={mark.variant !== workingMark}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                {mark.label}
                {mark.variant === workingMark ? (
                  <span className="rounded-sm bg-brand/10 px-1.5 py-0.5 text-[9px] font-medium text-brand">
                    Selected
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {mark.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <AgentWorkingMark
                variant={mark.variant}
                size={16}
                paused={mark.variant !== workingMark}
              />
              <span>Working</span>
            </div>
          </div>
        ))}
      </div>
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

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />
    </svg>
  )
}

/* ---------------------------------- view ---------------------------------- */

export function AgentView({
  displayStyle,
  workingMark,
}: {
  displayStyle: React.CSSProperties
  workingMark: AgentWorkingMarkVariant
}) {
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

      <Section index="06" title="Tool calls">
        <ToolCallsDemo />
      </Section>

      <Section index="07" title="Tasks">
        <TasksDemo />
      </Section>

      <Section index="08" title="Artifact">
        <ArtifactDemo />
      </Section>

      <Section index="09" title="Subagents">
        <SubagentDemo />
      </Section>

      <Section index="10" title="Working mark studies">
        <WorkingMarkDemo workingMark={workingMark} />
      </Section>
    </div>
  )
}
