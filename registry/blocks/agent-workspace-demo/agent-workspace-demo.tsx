"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { AgentWorkspace } from "@/registry/ui/agent-workspace"
import { Bubble, BubbleContent } from "@/registry/ui/bubble"
import { Button } from "@/registry/ui/button"
import {
  ComputerFrame,
  ComputerFrameAddress,
  ComputerFrameContent,
  ComputerFrameFooter,
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
        header={
          <div
            data-slot="agent-workspace-demo-header"
            className="flex h-11 items-center gap-3 border-b border-border bg-background px-3"
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              Browser workspace
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Local sample
            </span>
          </div>
        }
        computer={
          <ComputerFrame>
            <ComputerFrameToolbar>
              <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Page navigation">
                <Button
                  type="button"
                  aria-label="Previous page"
                  disabled={pageIndex <= 0}
                  onClick={() => setPageId(SAMPLE_PAGES[pageIndex - 1]?.id ?? page.id)}
                  variant="ghost"
                  size="xs"
                  className="rounded-md text-muted-foreground"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  aria-label="Next page"
                  disabled={pageIndex >= SAMPLE_PAGES.length - 1}
                  onClick={() => setPageId(SAMPLE_PAGES[pageIndex + 1]?.id ?? page.id)}
                  variant="ghost"
                  size="xs"
                  className="rounded-md text-muted-foreground"
                >
                  Next
                </Button>
              </div>
              <ComputerFrameAddress>{page.address}</ComputerFrameAddress>
            </ComputerFrameToolbar>
            <ComputerFrameContent>
              <article className="mx-auto flex max-w-2xl flex-col gap-6 p-5 sm:p-8">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Local page</p>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-(--display-tracking)">
                    {page.title}
                  </h2>
                  <p className="max-w-[65ch] text-sm leading-6 text-muted-foreground">
                    {page.description}
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
                      {page.items.map(([label, value]) => (
                        <TableRow key={label}>
                          <TableCell className="font-medium">{label}</TableCell>
                          <TableCell className="text-muted-foreground">{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </article>
            </ComputerFrameContent>
            <ComputerFrameFooter>
              <span>Source-controlled stage</span>
              <span className="ms-auto font-mono tabular-nums">{pageIndex + 1} / {SAMPLE_PAGES.length}</span>
            </ComputerFrameFooter>
          </ComputerFrame>
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
