"use client"

import * as React from "react"

import {
  Reasoning,
  ReasoningContent,
  ReasoningRow,
  ReasoningSource,
  ReasoningText,
  ReasoningTrigger,
} from "@/registry/ui/reasoning"

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

const THOUGHTS = [
  "Summer demand spikes for stone-fruit flavors — peach and apricot lead.",
  "I should check cone inventory before promoting a waffle-bowl special.",
  "Pistachio is the outlier: up 23% while the rest of the case is flat.",
]

/** Replays a trace on a loop so the streaming state is visible without a backend. */
function LiveReasoning() {
  const [shown, setShown] = React.useState(1)

  React.useEffect(() => {
    const id = window.setInterval(
      () => setShown((n) => (n >= THOUGHTS.length + 2 ? 1 : n + 1)),
      1800
    )
    return () => window.clearInterval(id)
  }, [])

  const streaming = shown <= THOUGHTS.length

  return (
    <Reasoning streaming={streaming} duration={streaming ? undefined : 6.4}>
      <ReasoningTrigger />
      <ReasoningContent>
        {THOUGHTS.slice(0, shown).map((t) => (
          <ReasoningText key={t}>{t}</ReasoningText>
        ))}
      </ReasoningContent>
    </Reasoning>
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
                  ChurnSchedule.tsx{" "}
                  <span className="text-success">+74</span>{" "}
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
                  <ReasoningSource key={s.host} name={s.name} host={s.host} />
                ))}
                <span className="text-sm text-muted-foreground/70">+7 more</span>
              </ReasoningContent>
            </Reasoning>
          </Case>
        </div>
      </Row>
    </div>
  )
}
