"use client"

import * as React from "react"

import { SwaguiMark } from "@/components/swagui-mark"
import {
  ChatHeader,
  ChatHeaderAction,
  ChatHeaderActions,
  ChatHeaderDivider,
  ChatHeaderIdentity,
  ChatHeaderShortcut,
  ChatHeaderTitle,
} from "@/registry/ui/chat-header"
import { Message, MessageContent } from "@/registry/ui/message"
import { Bubble, BubbleContent } from "@/registry/ui/bubble"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/ui/message-scroller"
import {
  Reasoning,
  ReasoningContent,
  ReasoningRow,
  ReasoningTrigger,
} from "@/registry/ui/reasoning"
import { Task, Tasks } from "@/registry/ui/tasks"
import { ToolCall, ToolCalls } from "@/registry/ui/tool-call"
import {
  Response,
  ResponseAction,
  ResponseActions,
  ResponseContent,
  ResponseSources,
} from "@/registry/ui/response"
import { Source } from "@/registry/ui/source"
import {
  Artifact,
  ArtifactContent,
  ArtifactDescription,
  ArtifactOpenMark,
  ArtifactPreview,
  ArtifactTitle,
} from "@/registry/ui/artifact"
import {
  PromptInput,
  PromptInputButton,
  PromptInputEditor,
  PromptInputMenu,
  PromptInputModelSelect,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
} from "@/registry/ui/prompt-input"

type ChatScene = "working" | "complete"

const MODELS = [
  { value: "vanilla-1", label: "Vanilla 1" },
  { value: "sprinkles-5", label: "Sprinkles 5" },
  { value: "freezer-burn", label: "Freezer Burn" },
]

const SOURCES = [
  { name: "Scoop Data", host: "scoopdata.io" },
  { name: "Trends Index", host: "trends.google.com" },
  { name: "Market Basket", host: "marketbasket.io" },
]

const CONTEXT_ITEMS = [
  {
    value: "sales-q3.csv",
    label: "sales-q3.csv",
    hint: "Summer sales data",
    glyph: "csv",
    group: "Files",
  },
  {
    value: "freezer-capacity.json",
    label: "freezer-capacity.json",
    hint: "Store capacity windows",
    glyph: "json",
    group: "Files",
  },
  {
    value: "scoop-data",
    label: "Scoop Data",
    hint: "Sales and churn metrics",
    group: "Sources",
  },
]

export function ChatView() {
  const [scene, setScene] = React.useState<ChatScene>("working")
  const [model, setModel] = React.useState("vanilla-1")
  const [submitted, setSubmitted] = React.useState<string[]>([])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.metaKey || !event.shiftKey) return
      if (event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSubmitted([])
        setScene("working")
      }
      if (event.key.toLowerCase() === "a") {
        event.preventDefault()
        setScene("complete")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="h-full min-h-[32rem]">
      <section className="flex size-full min-h-0 min-w-0 overflow-hidden bg-background text-foreground">
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatHeader>
            <ChatHeaderIdentity>
              <SwaguiMark size={20} />
              <span className="hidden sm:inline">swagui</span>
            </ChatHeaderIdentity>
            <ChatHeaderDivider />
            <ChatHeaderTitle>
              Build Agent Chat Components
            </ChatHeaderTitle>
            <ChatHeaderActions>
              <ChatHeaderAction
                label={`Show ${scene === "working" ? "complete" : "working"} state`}
                size="sm"
                onClick={() => setScene((value) => value === "working" ? "complete" : "working")}
                className="text-[12px] text-muted-foreground"
              >
                <span className={scene === "working" ? "size-1.5 rounded-full bg-brand" : "size-1.5 rounded-full bg-success"} />
                <span className="hidden md:inline">
                  {scene === "working" ? "Working" : "Complete"}
                </span>
              </ChatHeaderAction>
              <ChatHeaderAction
                label="New chat"
                size="sm"
                onClick={() => {
                  setSubmitted([])
                  setScene("working")
                }}
              >
                <PlusIcon />
                <ChatHeaderShortcut>⌘⇧K</ChatHeaderShortcut>
              </ChatHeaderAction>
              <ChatHeaderAction
                label="Open artifacts"
                size="sm"
                onClick={() => setScene("complete")}
              >
                <FolderIcon />
                <ChatHeaderShortcut>⌘⇧A</ChatHeaderShortcut>
              </ChatHeaderAction>
              <ChatHeaderAction label="Open side panel" disabled>
                <PanelIcon />
              </ChatHeaderAction>
            </ChatHeaderActions>
          </ChatHeader>

          <div className="relative min-h-0 flex-1">
            <MessageScrollerProvider>
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent className="mx-auto w-full max-w-[44rem] gap-6 px-4 py-6 sm:px-6">
                    <MessageScrollerItem>
                      <Message align="end">
                        <MessageContent>
                          <Bubble align="end" variant="secondary">
                            <BubbleContent>
                              Which flavor is growing fastest this summer?
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>

                    <MessageScrollerItem>
                      <Message>
                        <MessageContent>
                          <Response>
                            <ResponseContent>
                              Pistachio is leading summer growth, up 23% with the strongest weekend lift.
                            </ResponseContent>
                            <ResponseSources count={1}>
                              <Source name="Scoop Data" host="scoopdata.io" />
                            </ResponseSources>
                            <ResponseActions>
                              <ResponseAction label="Copy"><CopyIcon /></ResponseAction>
                            </ResponseActions>
                          </Response>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>

                    <MessageScrollerItem>
                      <Message align="end">
                        <MessageContent>
                          <Bubble align="end" variant="secondary">
                            <BubbleContent>
                              Build a Saturday churn plan and turn it into a dashboard.
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>

                    <MessageScrollerItem scrollAnchor={!submitted.length}>
                      <Message>
                        <MessageContent className="gap-3">
                          <Reasoning
                            streaming={scene === "working"}
                            duration={scene === "complete" ? 18 : undefined}
                            defaultOpen={false}
                          >
                            <ReasoningTrigger>
                              {scene === "working" ? "Working" : "Worked for 18s"}
                            </ReasoningTrigger>
                            <ReasoningContent>
                              <ReasoningRow label="Read">Summer sales and capacity</ReasoningRow>
                              <ReasoningRow label="Plan">Four implementation steps</ReasoningRow>
                            </ReasoningContent>
                          </Reasoning>

                          {scene === "working" ? <WorkingTasks /> : <CompleteTasks />}

                          <ToolCalls
                            defaultOpen={scene === "working"}
                            label={scene === "working" ? "Running tools" : "4 tool calls · 3.8s"}
                          >
                            <ToolCall kind="read" target="sales-q3.csv" meta="24 kB" />
                            <ToolCall kind="read" target="freezer-capacity.json" meta="8 kB" />
                            <ToolCall
                              kind="write"
                              label="Build dashboard"
                              target="inventory-dashboard"
                              status={scene === "working" ? "running" : "success"}
                            />
                            <ToolCall
                              kind="bash"
                              label="Verify"
                              target="npm run build"
                              status={scene === "working" ? "pending" : "success"}
                              meta={scene === "complete" ? "1.4s" : undefined}
                            />
                          </ToolCalls>

                          <Response streaming={scene === "working"} caret={false}>
                            <ResponseContent>
                              {scene === "working"
                                ? "I’m assembling the dashboard and checking the final preview."
                                : "Pistachio should churn first on Saturday. I also built a live dashboard so you can explore sales and freezer windows together."}
                            </ResponseContent>
                            {scene === "complete" ? (
                              <>
                                <Artifact
                                  kind="app"
                                  onOpen={() => {}}
                                  openLabel="Open inventory dashboard"
                                >
                                  <ArtifactPreview><AppPreview /></ArtifactPreview>
                                  <ArtifactContent>
                                    <ArtifactTitle>Inventory dashboard</ArtifactTitle>
                                    <ArtifactDescription>Running on localhost:4317</ArtifactDescription>
                                  </ArtifactContent>
                                  <ArtifactOpenMark />
                                </Artifact>
                                <ResponseSources count={3}>
                                  {SOURCES.map((source) => (
                                    <Source key={source.host} name={source.name} host={source.host} />
                                  ))}
                                </ResponseSources>
                                <ResponseActions>
                                  <ResponseAction label="Copy"><CopyIcon /></ResponseAction>
                                  <ResponseAction label="Retry"><RetryIcon /></ResponseAction>
                                </ResponseActions>
                              </>
                            ) : null}
                          </Response>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>

                    {submitted.map((message, index) => (
                      <React.Fragment key={`${index}-${message}`}>
                        <MessageScrollerItem>
                          <Message align="end">
                            <MessageContent>
                              <Bubble align="end" variant="secondary">
                                <BubbleContent>{message}</BubbleContent>
                              </Bubble>
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                        <MessageScrollerItem scrollAnchor={index === submitted.length - 1}>
                          <Message>
                            <MessageContent>
                              <Response streaming caret={false}>
                                <ResponseContent>
                                  I’m starting on that now. I’ll keep the result in this thread.
                                </ResponseContent>
                              </Response>
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      </React.Fragment>
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton className="bottom-3" />
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

          <footer className="relative z-10 shrink-0 border-t border-border bg-background px-4 py-3">
            <div className="mx-auto w-full max-w-[44rem]">
              <PromptInput
                status={scene === "working" ? "streaming" : "ready"}
                onSubmit={(value) => setSubmitted((messages) => [...messages, value])}
                onStop={() => setScene("complete")}
              >
                <PromptInputMenu
                  trigger="@"
                  items={CONTEXT_ITEMS}
                  empty="No matching file or source"
                />
                <PromptInputEditor placeholder="Message or add context with @" maxRows={5} />
                <PromptInputToolbar>
                  <PromptInputTools>
                    <PromptInputButton label="Add context" opensMenu="@"><PlusIcon /></PromptInputButton>
                    <PromptInputButton label="Dictate"><MicIcon /></PromptInputButton>
                  </PromptInputTools>
                  <PromptInputModelSelect models={MODELS} value={model} onValueChange={setModel} />
                  <PromptInputSubmit />
                </PromptInputToolbar>
              </PromptInput>
            </div>
          </footer>
        </div>
      </section>
    </div>
  )
}

function WorkingTasks() {
  return (
    <Tasks title="Build the inventory dashboard" status="running" completed={2} total={4} defaultOpen>
      <Task title="Inspect summer sales" status="completed" />
      <Task title="Confirm freezer capacity" status="completed" />
      <Task title="Build the dashboard" status="running" />
      <Task title="Verify the preview" status="pending" />
    </Tasks>
  )
}

function CompleteTasks() {
  return (
    <Tasks title="Built the inventory dashboard" status="completed" completed={4} total={4}>
      <Task title="Inspect summer sales" status="completed" />
      <Task title="Confirm freezer capacity" status="completed" />
      <Task title="Build the dashboard" status="completed" />
      <Task title="Verify the preview" status="completed" />
    </Tasks>
  )
}

function AppPreview() {
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
              <span key={index} className="flex-1 rounded-[1px] bg-brand/65" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg> }
function MicIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg> }
function FolderIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3.5 6.5h6l2 2h9v10.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></svg> }
function PanelIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M15 4v16M7 12h4" /></svg> }
function CopyIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg> }
function RetryIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" /></svg> }
