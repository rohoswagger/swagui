"use client"

import * as React from "react"

import { SwaguiMark } from "@/components/swagui-mark"
import {
  ChatHeader,
  ChatHeaderAction,
  ChatHeaderActions,
  ChatHeaderBreadcrumb,
  ChatHeaderBreadcrumbs,
  ChatHeaderBreadcrumbSeparator,
  ChatHeaderTitle,
} from "@/registry/ui/chat-header"
import {
  ConversationSidebar,
  ConversationSidebarAction,
  ConversationSidebarActions,
  ConversationSidebarFooter,
  ConversationSidebarGroup,
  ConversationSidebarGroupLabel,
  ConversationSidebarItem,
  ConversationSidebarList,
  ConversationSidebarPanel,
  ConversationSidebarToggle,
} from "@/registry/ui/conversation-sidebar"
import { type AgentWorkingMarkVariant } from "@/registry/ui/agent-working-mark"
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
  ReasoningTrigger,
} from "@/registry/ui/reasoning"
import { Task, Tasks } from "@/registry/ui/tasks"
import { Subagent, Subagents } from "@/registry/ui/subagent"
import {
  ToolCall,
  ToolCallOutput,
  ToolCalls,
} from "@/registry/ui/tool-call"
import {
  Response,
  ResponseAction,
  ResponseActions,
  ResponseContent,
  ResponseSources,
  ResponseUsage,
} from "@/registry/ui/response"
import { Source } from "@/registry/ui/source"
import {
  Artifacts,
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
  PromptInputContextIndicator,
  PromptInputEditor,
  PromptInputMenu,
  PromptInputModelSelect,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
} from "@/registry/ui/prompt-input"

type ChatScene = "working" | "complete"
type ThreadId = "main" | "data-researcher" | "interface-builder" | "visual-reviewer" | "qa-auditor"

const THREAD_LABEL: Record<ThreadId, string> = {
  main: "Main agent",
  "data-researcher": "Data researcher",
  "interface-builder": "Interface builder",
  "visual-reviewer": "Visual reviewer",
  "qa-auditor": "QA auditor",
}

const MODELS = [
  { value: "vanilla-1", label: "Vanilla 1", hint: "Fast", detail: "128k context" },
  { value: "sprinkles-5", label: "Sprinkles 5", hint: "Flagship", detail: "256k context" },
  { value: "freezer-burn", label: "Freezer Burn", hint: "Code", detail: "192k context" },
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

export function ChatView({ workingMark = "mobius" }: { workingMark?: AgentWorkingMarkVariant }) {
  const [scene, setScene] = React.useState<ChatScene>("working")
  const [model, setModel] = React.useState("vanilla-1")
  const [reasoningEffort, setReasoningEffort] = React.useState("high")
  const [submitted, setSubmitted] = React.useState<string[]>([])
  const [threadPath, setThreadPath] = React.useState<ThreadId[]>(["main"])
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [selectedConversation, setSelectedConversation] = React.useState("inventory-dashboard")
  const activeThread = threadPath[threadPath.length - 1]

  if (activeThread !== "main") {
    return (
      <SubagentThreadView
        path={threadPath}
        scene={scene}
        sidebarOpen={sidebarOpen}
        selectedConversation={selectedConversation}
        workingMark={workingMark}
        onSidebarOpenChange={setSidebarOpen}
        onSelectConversation={setSelectedConversation}
        onNewChat={() => {
          setSubmitted([])
          setScene("working")
          setThreadPath(["main"])
        }}
        onNavigate={(index) => setThreadPath(threadPath.slice(0, index + 1))}
        onOpenNested={(thread) => setThreadPath((path) => [...path, thread])}
      />
    )
  }

  return (
    <div className="h-full min-h-[32rem]">
      <section className="relative flex size-full min-h-0 min-w-0 overflow-hidden bg-background text-foreground">
        <ConversationSidebarDemo
          open={sidebarOpen}
          scene={scene}
          selectedConversation={selectedConversation}
          workingMark={workingMark}
          onOpenChange={setSidebarOpen}
          onSelectConversation={setSelectedConversation}
          onNewChat={() => {
            setSubmitted([])
            setScene("working")
            setThreadPath(["main"])
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatHeader>
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
                <span>{scene === "working" ? "Working" : "Completed"}</span>
              </ChatHeaderAction>
              <ChatHeaderAction
                label="New chat"
                size="icon-sm"
                onClick={() => {
                  setSubmitted([])
                  setScene("working")
                  setThreadPath(["main"])
                }}
              >
                <PlusIcon />
              </ChatHeaderAction>
              <ChatHeaderAction
                label="Open artifacts"
                size="icon-sm"
                onClick={() => setScene("complete")}
              >
                <FolderIcon />
              </ChatHeaderAction>
              <ChatHeaderAction label="Open side panel" size="icon-sm" disabled>
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
                            <ResponseUsage duration={3} tokens={428} />
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
                              Can Saturday’s freezer window handle a larger batch?
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>

                    <MessageScrollerItem>
                      <Message>
                        <MessageContent className="gap-2">
                          <Reasoning duration={4} defaultOpen={false}>
                            <ReasoningTrigger>Worked for 4s</ReasoningTrigger>
                            <ReasoningContent>
                              <ToolCalls>
                                <ToolCall kind="read" target="freezer-capacity.json" meta="8 kB" />
                                <ToolCall kind="code" label="Calculate" target="capacity-check.ts" meta="0.3s">
                                  <ToolCallOutput>{"available_gallons = 42\nplanned_gallons = 36"}</ToolCallOutput>
                                </ToolCall>
                              </ToolCalls>
                            </ReasoningContent>
                          </Reasoning>
                          <Response>
                            <ResponseContent>
                              Yes. The early freezer window has six gallons of headroom after the larger pistachio batch.
                            </ResponseContent>
                            <ResponseUsage duration={4} tokens={612} />
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
                        <MessageContent className="gap-2">
                          <Reasoning
                            key={scene}
                            streaming={scene === "working"}
                            duration={scene === "complete" ? 18 : undefined}
                            defaultOpen={scene === "working"}
                          >
                            <ReasoningTrigger>
                              {scene === "working" ? "Working" : "Worked for 18s"}
                            </ReasoningTrigger>
                            <ReasoningContent>
                              <Subagents>
                                <Subagent
                                  name="Data researcher"
                                  description="Demand and margin signals"
                                  status="completed"
                                  duration={14}
                                  onOpen={() => setThreadPath(["main", "data-researcher"])}
                                />
                                <Subagent
                                  name="Interface builder"
                                  description="Dashboard implementation"
                                  status={scene === "working" ? "running" : "completed"}
                                  duration={18}
                                  onOpen={() => setThreadPath(["main", "interface-builder"])}
                                />
                                <Subagent
                                  name="QA auditor"
                                  description="Responsive preview checks"
                                  status="failed"
                                  duration={12}
                                  onOpen={() => setThreadPath(["main", "qa-auditor"])}
                                />
                              </Subagents>
                              <ToolCalls>
                                <ToolCall kind="search" target="summer flavor demand trends" meta="8 results" />
                                <ToolCall kind="read" target="sales-q3.csv" meta="24 kB" />
                                <ToolCall kind="read" target="freezer-capacity.json" meta="8 kB" />
                                <ToolCall kind="mcp" label="Query" target="scoop_data.weekly_sales" meta="200" />
                                <ToolCall
                                  kind="write"
                                  label="Build dashboard"
                                  target="inventory-dashboard"
                                  status={scene === "working" ? "running" : "success"}
                                />
                                <ToolCall
                                  kind="bash"
                                  label="Verify"
                                  target="bun run build"
                                  status={scene === "working" ? "pending" : "success"}
                                  meta={scene === "complete" ? "1.4s" : undefined}
                                />
                              </ToolCalls>
                            </ReasoningContent>
                          </Reasoning>

                          {scene === "working" ? <WorkingTasks /> : <CompleteTasks />}

                          {scene === "complete" ? (
                            <Response>
                              <ResponseContent>
                                Pistachio should churn first on Saturday. I also built a live dashboard so you can explore sales and freezer windows together.
                              </ResponseContent>
                              <Artifacts>
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
                                <Artifact
                                  kind="spreadsheet"
                                  onOpen={() => {}}
                                  openLabel="Open Saturday churn plan"
                                >
                                  <ArtifactPreview />
                                  <ArtifactContent>
                                    <ArtifactTitle>Saturday churn plan</ArtifactTitle>
                                    <ArtifactDescription>Excel workbook · 18 KB</ArtifactDescription>
                                  </ArtifactContent>
                                  <ArtifactOpenMark />
                                </Artifact>
                              </Artifacts>
                              <ResponseSources count={3}>
                                {SOURCES.map((source) => (
                                  <Source key={source.host} name={source.name} host={source.host} />
                                ))}
                              </ResponseSources>
                              <ResponseUsage duration={18} tokens={2840} />
                              <ResponseActions>
                                <ResponseAction label="Copy"><CopyIcon /></ResponseAction>
                                <ResponseAction label="Retry"><RetryIcon /></ResponseAction>
                              </ResponseActions>
                            </Response>
                          ) : null}
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
                  <PromptInputContextIndicator used={42680} total={128000} />
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
          </footer>
        </div>
      </section>
    </div>
  )
}

function SubagentThreadView({
  path,
  scene,
  sidebarOpen,
  selectedConversation,
  workingMark,
  onSidebarOpenChange,
  onSelectConversation,
  onNewChat,
  onNavigate,
  onOpenNested,
}: {
  path: ThreadId[]
  scene: ChatScene
  sidebarOpen: boolean
  selectedConversation: string
  workingMark: AgentWorkingMarkVariant
  onSidebarOpenChange: (open: boolean) => void
  onSelectConversation: (conversation: string) => void
  onNewChat: () => void
  onNavigate: (index: number) => void
  onOpenNested: (thread: ThreadId) => void
}) {
  const thread = path[path.length - 1]
  const failed = thread === "qa-auditor"
  const completed = thread === "data-researcher" || scene === "complete"
  const running = !failed && !completed
  const threadDuration = failed
    ? 12
    : thread === "data-researcher"
      ? 14
      : thread === "interface-builder"
        ? 18
        : 9
  const assignment =
    thread === "data-researcher"
      ? "Research demand, margins, and capacity constraints for the Saturday churn plan."
      : thread === "interface-builder"
      ? "Build and polish the inventory dashboard, then verify the interaction states."
      : thread === "visual-reviewer"
        ? "Review the dashboard at desktop and mobile widths and report material issues."
        : "Audit the responsive preview and identify why the narrow layout failed."

  return (
    <div className="h-full min-h-[32rem]">
      <section className="relative flex size-full min-h-0 min-w-0 overflow-hidden bg-background text-foreground">
        <ConversationSidebarDemo
          open={sidebarOpen}
          scene={scene}
          selectedConversation={selectedConversation}
          workingMark={workingMark}
          onOpenChange={onSidebarOpenChange}
          onSelectConversation={onSelectConversation}
          onNewChat={onNewChat}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatHeader>
            <ChatHeaderBreadcrumbs>
              {path.map((item, index) => (
                <React.Fragment key={item}>
                  {index ? <ChatHeaderBreadcrumbSeparator /> : null}
                  <ChatHeaderBreadcrumb
                    current={index === path.length - 1}
                    onClick={index === path.length - 1 ? undefined : () => onNavigate(index)}
                  >
                    {THREAD_LABEL[item]}
                  </ChatHeaderBreadcrumb>
                </React.Fragment>
              ))}
            </ChatHeaderBreadcrumbs>
            <ChatHeaderActions>
              <ChatHeaderAction
                label={failed ? "Subagent failed" : completed ? "Subagent completed" : "Subagent running"}
                size="sm"
                disabled
                className={failed ? "text-destructive" : "text-brand"}
              >
                <span className={failed ? "size-1.5 rounded-full bg-destructive" : completed ? "size-1.5 rounded-full bg-brand" : "size-1.5 animate-pulse rounded-full bg-brand motion-reduce:animate-none"} />
                <span className="hidden sm:inline">{failed ? "Failed" : completed ? "Completed" : "Running"}</span>
              </ChatHeaderAction>
            </ChatHeaderActions>
          </ChatHeader>

          <div className="relative min-h-0 flex-1">
            <MessageScrollerProvider>
              <MessageScroller key={thread}>
                <MessageScrollerViewport>
                  <MessageScrollerContent className="mx-auto w-full max-w-[44rem] gap-6 px-4 py-6 sm:px-6">
                    <MessageScrollerItem>
                      <Message align="end">
                        <MessageContent>
                          <Bubble align="end" variant="secondary">
                            <BubbleContent>{assignment}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                    <MessageScrollerItem scrollAnchor>
                      <Message>
                        <MessageContent className="gap-2">
                          <Reasoning
                            streaming={running}
                            duration={failed || completed ? threadDuration : undefined}
                            defaultOpen
                          >
                            <ReasoningTrigger>
                              {failed || completed ? `Worked for ${threadDuration}s` : "Working"}
                            </ReasoningTrigger>
                            <ReasoningContent>
                              {thread === "data-researcher" ? (
                                <ToolCalls>
                                  <ToolCall kind="search" target="summer flavor demand trends" meta="8 results" />
                                  <ToolCall kind="read" target="sales-q3.csv" meta="24 kB" />
                                  <ToolCall kind="mcp" label="Query" target="scoop_data.weekly_sales" status="success" meta="200" />
                                </ToolCalls>
                              ) : thread === "interface-builder" ? (
                                <>
                                  <ToolCalls>
                                    <ToolCall kind="read" target="app/dashboard/page.tsx" meta="6 kB" />
                                    <ToolCall kind="edit" label="Build layout" target="dashboard-shell.tsx" status="success" />
                                    <ToolCall kind="code" label="Render preview" target="localhost:4200" status={completed ? "success" : "running"} />
                                  </ToolCalls>
                                  <Subagents>
                                    <Subagent
                                      name="Visual reviewer"
                                      description="Desktop and mobile design pass"
                                      status={completed ? "completed" : "running"}
                                      duration={completed ? 9 : 6}
                                      onOpen={() => onOpenNested("visual-reviewer")}
                                    />
                                  </Subagents>
                                </>
                              ) : thread === "visual-reviewer" ? (
                                <ToolCalls>
                                  <ToolCall kind="image" label="Capture" target="desktop.png" meta="1440×900" />
                                  <ToolCall kind="image" label="Capture" target="mobile.png" meta="390×844" />
                                  <ToolCall kind="read" label="Inspect contrast" target="dashboard cards" status={completed ? "success" : "running"} />
                                </ToolCalls>
                              ) : (
                                <ToolCalls>
                                  <ToolCall kind="read" target="dashboard-shell.tsx" meta="4 kB" />
                                  <ToolCall kind="bash" label="Run responsive checks" target="bun run build" status="error" meta="exit 1">
                                    <ToolCallOutput>{"dashboard-shell.tsx:74\nSidebar overlaps content below 640px."}</ToolCallOutput>
                                  </ToolCall>
                                </ToolCalls>
                              )}
                            </ReasoningContent>
                          </Reasoning>
                          {failed || completed ? (
                            <Response>
                              <ResponseContent>
                                {failed
                                  ? "The narrow layout failed because the reserved panel width never collapses below 640px."
                                  : thread === "data-researcher"
                                    ? "Pistachio leads summer growth, while Saturday capacity leaves six gallons of headroom."
                                    : thread === "interface-builder"
                                      ? "The dashboard implementation is complete and the live preview is ready."
                                      : "The desktop and mobile review is complete with no blocking visual issues."}
                              </ResponseContent>
                              <ResponseUsage
                                duration={threadDuration}
                                tokens={failed ? 890 : thread === "data-researcher" ? 1650 : thread === "interface-builder" ? 2210 : 760}
                              />
                            </Response>
                          ) : null}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton className="bottom-3" />
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

        </div>
      </section>
    </div>
  )
}

function WorkingTasks() {
  return (
    <Tasks title="Build the inventory dashboard" status="running" completed={3} total={6} defaultOpen>
      <Task title="Inspect summer sales" status="completed" />
      <Task title="Confirm freezer capacity" status="completed" />
      <Task title="Delegate data research" status="completed" />
      <Task title="Build the dashboard" status="running" />
      <Task title="Verify the preview" status="pending" />
      <Task title="Review responsive behavior" status="pending" />
    </Tasks>
  )
}

function CompleteTasks() {
  return (
    <Tasks title="Built the inventory dashboard" status="completed" completed={6} total={6}>
      <Task title="Inspect summer sales" status="completed" />
      <Task title="Confirm freezer capacity" status="completed" />
      <Task title="Delegate data research" status="completed" />
      <Task title="Build the dashboard" status="completed" />
      <Task title="Verify the preview" status="completed" />
      <Task title="Review responsive behavior" status="completed" />
    </Tasks>
  )
}

function ConversationSidebarDemo({
  open,
  scene,
  selectedConversation,
  workingMark,
  onOpenChange,
  onSelectConversation,
  onNewChat,
}: {
  open: boolean
  scene: ChatScene
  selectedConversation: string
  workingMark: AgentWorkingMarkVariant
  onOpenChange: (open: boolean) => void
  onSelectConversation: (conversation: string) => void
  onNewChat: () => void
}) {
  const conversations = [
    {
      id: "inventory-dashboard",
      title: "Build Agent Chat Components",
      status: scene === "working" ? "working" as const : "done" as const,
      duration: scene === "working" ? 68 : 92,
    },
    { id: "approval-flow", title: "Tighten the approval flow", status: "needs-input" as const },
    { id: "design-audit", title: "Audit dashboard spacing", status: "done" as const, duration: 214 },
    { id: "mobile-shell", title: "Repair the mobile shell", status: "failed" as const, duration: 47 },
    { id: "release-notes", title: "Draft release notes", status: "cancelled" as const, duration: 16 },
  ]

  return (
    <ConversationSidebar open={open} onOpenChange={onOpenChange}>
      <ConversationSidebarToggle
        icon={<SwaguiMark size={22} />}
        hoverIcon={<PanelIcon />}
        label="swagui"
        open={open}
        closeIcon={<PanelCloseIcon />}
        onClose={() => onOpenChange(false)}
        aria-label={open ? "Close conversation sidebar" : "Open conversation sidebar"}
        onClick={() => onOpenChange(!open)}
      />
      <ConversationSidebarActions aria-label="Chat actions">
        <ConversationSidebarAction icon={<ComposeIcon />} onClick={onNewChat}>
          New chat
        </ConversationSidebarAction>
        <ConversationSidebarAction icon={<SearchIcon />}>
          Search chats
        </ConversationSidebarAction>
        <ConversationSidebarAction icon={<FolderIcon />}>
          Artifacts
        </ConversationSidebarAction>
      </ConversationSidebarActions>
      <ConversationSidebarPanel>
        <ConversationSidebarGroup className="min-h-0 flex-1 overflow-y-auto">
          <ConversationSidebarGroupLabel>Recent</ConversationSidebarGroupLabel>
          <ConversationSidebarList>
            {conversations.map((conversation) => (
              <ConversationSidebarItem
                key={conversation.id}
                title={conversation.title}
                status={conversation.status}
                duration={conversation.duration}
                active={conversation.id === selectedConversation}
                workingMark={workingMark}
                onClick={() => {
                  onSelectConversation(conversation.id)
                  if (window.matchMedia("(max-width: 767px)").matches) onOpenChange(false)
                }}
              />
            ))}
          </ConversationSidebarList>
        </ConversationSidebarGroup>
      </ConversationSidebarPanel>
      <ConversationSidebarFooter>
        <ConversationSidebarAction icon={<SettingsIcon />}>Settings</ConversationSidebarAction>
      </ConversationSidebarFooter>
    </ConversationSidebar>
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
function PanelCloseIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M9 4v16M17 12h-4" /></svg> }
function ComposeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7M16.5 3.5a2.1 2.1 0 0 1 3 3L11 15l-4 1 1-4Z" /></svg> }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg> }
function SettingsIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></svg> }
function CopyIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg> }
function RetryIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" /></svg> }
