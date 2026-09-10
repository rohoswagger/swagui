"use client"

import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon, RefreshCwIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { AgentWorkspace } from "@/registry/ui/agent-workspace"
import { Bubble, BubbleContent } from "@/registry/ui/bubble"
import { Button } from "@/registry/ui/button"
import {
  ComputerFrame,
  ComputerFrameAddress,
  ComputerFrameContent,
  ComputerFrameTab,
  ComputerFrameTabs,
  ComputerFrameToolbar,
} from "@/registry/ui/computer-frame"
import { Input } from "@/registry/ui/input"
import { Message, MessageContent, MessageGroup } from "@/registry/ui/message"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/ui/table"
import { Tabs, TabsContent } from "@/registry/ui/tabs"

const SAMPLE_PAGES = [
  {
    id: "overview",
    label: "Overview",
    address: "workspace.local/overview",
    title: "Project overview",
    description: "A small source-controlled page for the browser stage.",
    items: [
      ["Open items", "3"],
      ["Last note", "Today"],
      ["Next review", "Friday"],
      ["Owner", "Sam Lee"],
    ],
  },
  {
    id: "files",
    label: "Files",
    address: "workspace.local/files",
    title: "Recent files",
    description: "A short list of files available in this sample workspace.",
    items: [
      ["brief.md", "Updated 09:24"],
      ["notes.txt", "Updated yesterday"],
      ["review.csv", "Updated Monday"],
      ["draft.tsx", "Updated Monday"],
    ],
  },
  {
    id: "notes",
    label: "Notes",
    address: "workspace.local/notes",
    title: "Working notes",
    description: "A quiet place for a few decisions and follow-ups.",
    items: [
      ["Keep the browser stage local", "Done"],
      ["Use the conversation rail", "In review"],
      ["Check compact spacing", "Next"],
      ["Share the draft", "Later"],
    ],
  },
] as const

type SamplePageId = (typeof SAMPLE_PAGES)[number]["id"]
type SampleMessage = { role: "assistant" | "user"; text: string }

const INITIAL_MESSAGES: SampleMessage[] = [
  { role: "assistant", text: "Which part of the workspace should we inspect?" },
]

function AgentWorkspaceDemo({
  className,
  ...props
}: React.ComponentProps<"section">) {
  const [pageId, setPageId] = React.useState<SamplePageId>("overview")
  const [pageRevision, setPageRevision] = React.useState(0)
  const [messages, setMessages] = React.useState(INITIAL_MESSAGES)
  const [draft, setDraft] = React.useState("")

  const pageIndex = SAMPLE_PAGES.findIndex((page) => page.id === pageId)
  const page = SAMPLE_PAGES[pageIndex] ?? SAMPLE_PAGES[0]

  const submitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    setMessages((current) => [...current, { role: "user", text }])
    setDraft("")
  }

  return (
    <section
      data-slot="agent-workspace-demo"
      className={cn(
        "h-[min(42rem,calc(100svh-2rem))] min-h-[32rem] w-full overflow-hidden rounded-xl border border-border bg-background shadow-(--shadow-overlay)",
        className
      )}
      {...props}
    >
      <AgentWorkspace
        navigation={
          <nav
            data-slot="agent-workspace-demo-navigation"
            aria-label="Workspace pages"
            className="hidden h-full w-44 flex-col gap-1 border-r border-border bg-muted/20 p-2 md:flex"
          >
            <p className="px-2 pb-2 pt-1 text-xs font-medium text-muted-foreground">
              Workspace
            </p>
            {SAMPLE_PAGES.map((samplePage) => (
              <Button
                key={samplePage.id}
                type="button"
                aria-current={samplePage.id === page.id ? "page" : undefined}
                onClick={() => setPageId(samplePage.id)}
                variant={samplePage.id === page.id ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start rounded-md px-2 text-left text-muted-foreground",
                  samplePage.id === page.id && "text-foreground"
                )}
              >
                {samplePage.label}
              </Button>
            ))}
          </nav>
        }
        computer={
          <Tabs
            value={pageId}
            onValueChange={(value) => setPageId(value as SamplePageId)}
            className="h-full min-h-0 flex-1 gap-0"
          >
            <ComputerFrame>
              <ComputerFrameTabs aria-label="Workspace pages">
                {SAMPLE_PAGES.map((samplePage) => (
                  <ComputerFrameTab key={samplePage.id} value={samplePage.id}>
                    {samplePage.label}
                  </ComputerFrameTab>
                ))}
              </ComputerFrameTabs>
              <ComputerFrameToolbar>
                <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Page navigation">
                <Button
                  type="button"
                  aria-label="Go back"
                  disabled
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-md text-muted-foreground"
                >
                  <ArrowLeftIcon />
                </Button>
                <Button
                  type="button"
                  aria-label="Go forward"
                  disabled
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-md text-muted-foreground"
                >
                  <ArrowRightIcon />
                </Button>
                <Button
                  type="button"
                  aria-label="Refresh current view"
                  onClick={() => setPageRevision((current) => current + 1)}
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-md text-muted-foreground"
                >
                  <RefreshCwIcon />
                </Button>
              </div>
                <ComputerFrameAddress className="min-w-0">
                  <Input
                    readOnly
                    value={page.address}
                    aria-label="Current page address"
                    className="h-7 font-sans text-xs shadow-none"
                  />
                </ComputerFrameAddress>
              </ComputerFrameToolbar>
              <ComputerFrameContent key={`${page.id}-${pageRevision}`}>
                {SAMPLE_PAGES.map((samplePage) => (
                  <TabsContent
                    key={samplePage.id}
                    value={samplePage.id}
                    className="h-full overflow-auto"
                  >
                    <article className="mx-auto flex max-w-2xl flex-col gap-6 p-5 sm:p-8">
                      <div className="flex flex-col gap-2">
                        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-(--display-tracking)">
                          {samplePage.title}
                        </h2>
                        <p className="max-w-[65ch] text-sm leading-6 text-muted-foreground">
                          {samplePage.description}
                        </p>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-border bg-card">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>State</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {samplePage.items.map(([label, value]) => (
                              <TableRow key={label}>
                                <TableCell className="font-medium">{label}</TableCell>
                                <TableCell className="text-muted-foreground">{value}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </article>
                  </TabsContent>
                ))}
              </ComputerFrameContent>
            </ComputerFrame>
          </Tabs>
        }
        conversation={
          <div
            data-slot="agent-workspace-demo-conversation"
            className="flex h-full min-h-0 flex-col bg-background"
          >
            <div className="flex shrink-0 flex-col gap-1 border-b border-border px-4 py-3">
              <span className="text-sm font-medium">Conversation</span>
              <span className="text-xs text-muted-foreground">Workspace notes</span>
            </div>
            <MessageGroup
              aria-live="polite"
              className="min-h-0 flex-1 overflow-auto p-4"
            >
              {messages.map((message, index) => (
                <Message
                  key={`${message.role}-${index}`}
                  align={message.role === "user" ? "end" : "start"}
                >
                  <MessageContent>
                    <Bubble
                      align={message.role === "user" ? "end" : "start"}
                      variant={message.role === "user" ? "default" : "muted"}
                      className="max-w-[32ch]"
                    >
                      <BubbleContent>{message.text}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              ))}
            </MessageGroup>
            <form
              onSubmit={submitMessage}
              className="flex shrink-0 gap-2 border-t border-border p-3"
            >
              <Input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="Message"
                placeholder="Write a note"
                className="min-w-0 flex-1"
              />
              <Button
                type="submit"
                size="sm"
              >
                Send
              </Button>
            </form>
          </div>
        }
      />
    </section>
  )
}

export { AgentWorkspaceDemo }
