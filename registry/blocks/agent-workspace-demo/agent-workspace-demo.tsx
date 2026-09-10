"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CircleAlertIcon,
  PlusIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { AgentWorkspace } from "@/registry/ui/agent-workspace"
import { Bubble, BubbleContent } from "@/registry/ui/bubble"
import { Button } from "@/registry/ui/button"
import {
  ComputerFrame,
  ComputerFrameAddress,
  ComputerFrameContent,
  ComputerFrameTab,
  ComputerFrameTabAction,
  ComputerFrameTabItem,
  ComputerFrameTabs,
  ComputerFrameToolbar,
} from "@/registry/ui/computer-frame"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/ui/empty"
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

type DemoPage = {
  id: string
  label: string
  address: string
  title: string
  description: string
  items: readonly (readonly [string, string])[]
  kind: "sample" | "new" | "external"
}

const SAMPLE_PAGES: readonly DemoPage[] = [
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
    kind: "sample",
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
    kind: "sample",
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
    kind: "sample",
  },
]

const NEW_TAB_PAGE: DemoPage = {
  id: "new",
  label: "New tab",
  address: "",
  title: "New tab",
  description: "Open a page from this workflow.",
  items: [],
  kind: "new",
}

type DemoTab = {
  id: string
  history: DemoPage[]
  historyIndex: number
  revision: number
  draft: string
}

function createDemoTab(id: string, page: DemoPage): DemoTab {
  return { id, history: [page], historyIndex: 0, revision: 0, draft: page.address }
}

function currentPage(tab: DemoTab): DemoPage {
  return tab.history[tab.historyIndex] ?? NEW_TAB_PAGE
}

function normalizeDemoAddress(address: string): string {
  return address.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "")
}

const INITIAL_TABS = [
  createDemoTab("tab-1", SAMPLE_PAGES[0]),
  createDemoTab("tab-2", SAMPLE_PAGES[1]),
]

type SampleMessage = { role: "assistant" | "user"; text: string }

const INITIAL_MESSAGES: SampleMessage[] = [
  { role: "assistant", text: "Which part of the workspace should we inspect?" },
]

function AgentWorkspaceDemo({
  className,
  ...props
}: React.ComponentProps<"section">) {
  const [tabs, setTabs] = React.useState<DemoTab[]>(INITIAL_TABS)
  const [activeTabId, setActiveTabId] = React.useState(INITIAL_TABS[0].id)
  const [messages, setMessages] = React.useState(INITIAL_MESSAGES)
  const [draft, setDraft] = React.useState("")
  const nextTabId = React.useRef(3)
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const tabItemRefs = React.useRef<Record<string, HTMLDivElement | null>>({})
  const addressRef = React.useRef<HTMLInputElement>(null)
  const focusAfterChange = React.useRef<"address" | "tab" | null>(null)

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]
  const activePage = currentPage(activeTab)

  React.useEffect(() => {
    if (focusAfterChange.current === "address") {
      addressRef.current?.focus()
      addressRef.current?.select()
    } else if (focusAfterChange.current === "tab") {
      tabRefs.current[activeTabId]?.focus()
    }
    tabItemRefs.current[activeTabId]?.scrollIntoView?.({ block: "nearest", inline: "nearest" })
    focusAfterChange.current = null
  }, [activeTabId, tabs.length])

  const openNewTab = () => {
    const id = `tab-${nextTabId.current}`
    nextTabId.current += 1
    setTabs((current) => [...current, createDemoTab(id, NEW_TAB_PAGE)])
    focusAfterChange.current = "address"
    setActiveTabId(id)
  }

  const closeTab = (tabId: string) => {
    const index = tabs.findIndex((tab) => tab.id === tabId)
    if (index < 0) return

    if (tabs.length === 1) {
      const id = `tab-${nextTabId.current}`
      nextTabId.current += 1
      setTabs([createDemoTab(id, NEW_TAB_PAGE)])
      focusAfterChange.current = "address"
      setActiveTabId(id)
      return
    }

    const wasActive = tabId === activeTabId
    const fallbackId = tabs[index + 1]?.id ?? tabs[index - 1]?.id
    setTabs((current) => current.filter((tab) => tab.id !== tabId))
    if (!wasActive) {
      focusAfterChange.current = "tab"
    }
    if (wasActive && fallbackId) {
      focusAfterChange.current = "tab"
      setActiveTabId(fallbackId)
    }
  }

  const updateTab = (tabId: string, update: (tab: DemoTab) => DemoTab) => {
    setTabs((current) => current.map((tab) => (tab.id === tabId ? update(tab) : tab)))
  }

  const updateAddressDraft = (value: string) => {
    updateTab(activeTabId, (tab) => ({ ...tab, draft: value }))
  }

  const navigateTab = (tabId: string, page: DemoPage) => {
    updateTab(tabId, (tab) => {
      const current = currentPage(tab)
      if (current.address === page.address && current.kind === page.kind) {
        return { ...tab, revision: tab.revision + 1, draft: page.address }
      }
      return {
        ...tab,
        history: [...tab.history.slice(0, tab.historyIndex + 1), page],
        historyIndex: tab.historyIndex + 1,
        draft: page.address,
      }
    })
  }

  const navigateAddress = () => {
    const address = activeTab.draft.trim()
    if (!address) return
    const page = SAMPLE_PAGES.find((candidate) => normalizeDemoAddress(candidate.address) === normalizeDemoAddress(address))
    navigateTab(
      activeTabId,
      page ?? {
        ...NEW_TAB_PAGE,
        id: `external-${address}`,
        label: "Unavailable",
        address,
        title: "Navigation not executed",
        description: "This source-controlled demo does not open external websites or make network requests.",
        kind: "external",
      },
    )
  }

  const stepHistory = (direction: -1 | 1) => {
    updateTab(activeTabId, (tab) => {
      const nextIndex = tab.historyIndex + direction
      if (nextIndex < 0 || nextIndex >= tab.history.length) return tab
      return { ...tab, historyIndex: nextIndex, draft: tab.history[nextIndex]?.address ?? "" }
    })
  }

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
                aria-current={samplePage.id === activePage.id ? "page" : undefined}
                onClick={() => navigateTab(activeTabId, samplePage)}
                variant={samplePage.id === activePage.id ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start rounded-md px-2 text-left text-muted-foreground",
                  samplePage.id === activePage.id && "text-foreground"
                )}
              >
                {samplePage.label}
              </Button>
            ))}
          </nav>
        }
        computer={
          <Tabs
            value={activeTabId}
            onValueChange={setActiveTabId}
            className="h-full min-h-0 flex-1 gap-0"
          >
            <ComputerFrame>
              <ComputerFrameTabs aria-label="Workspace browser tabs" className="overflow-x-auto [scroll-padding-inline-end:34px]">
                {tabs.map((tab) => {
                  const page = currentPage(tab)
                  const tabAriaLabel = page.kind === "new" ? "New tab" : `${page.label} tab`
                  const closeLabel = page.kind === "new" ? "Close new tab" : `Close ${page.label} tab`
                  return (
                    <ComputerFrameTabItem key={tab.id} ref={(element) => { tabItemRefs.current[tab.id] = element }} className="[scroll-margin-inline-end:34px]">
                      <ComputerFrameTab
                        ref={(element) => { tabRefs.current[tab.id] = element }}
                        value={tab.id}
                        aria-label={tabAriaLabel}
                      >
                        {page.label}
                      </ComputerFrameTab>
                      <ComputerFrameTabAction
                        aria-label={closeLabel}
                        title={closeLabel}
                        onClick={(event) => {
                          event.stopPropagation()
                          closeTab(tab.id)
                        }}
                      >
                        <XIcon />
                      </ComputerFrameTabAction>
                    </ComputerFrameTabItem>
                  )
                })}
                <ComputerFrameTabAction
                  aria-label="Open new tab"
                  title="Open new tab"
                  className="sticky right-0 ml-auto bg-muted/90"
                  onClick={openNewTab}
                >
                  <PlusIcon />
                </ComputerFrameTabAction>
              </ComputerFrameTabs>
              <ComputerFrameToolbar>
                <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Page navigation">
                  <Button
                    type="button"
                    aria-label="Go back"
                    disabled={activeTab.historyIndex === 0}
                    onClick={() => stepHistory(-1)}
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-md text-muted-foreground"
                  >
                    <ArrowLeftIcon />
                  </Button>
                  <Button
                    type="button"
                    aria-label="Go forward"
                    disabled={activeTab.historyIndex >= activeTab.history.length - 1}
                    onClick={() => stepHistory(1)}
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-md text-muted-foreground"
                  >
                    <ArrowRightIcon />
                  </Button>
                  <Button
                    type="button"
                    aria-label="Refresh current view"
                    onClick={() => updateTab(activeTabId, (tab) => ({ ...tab, revision: tab.revision + 1 }))}
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-md text-muted-foreground"
                  >
                    <RefreshCwIcon />
                  </Button>
                </div>
                <ComputerFrameAddress className="min-w-0">
                  <Input
                    ref={addressRef}
                    type="text"
                    value={activeTab.draft}
                    onChange={(event) => updateAddressDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.nativeEvent.isComposing || event.key === "Process") return
                      if (event.key === "Enter") {
                        event.preventDefault()
                        navigateAddress()
                      }
                    }}
                    placeholder="Enter an address"
                    aria-label="Current page address"
                    spellCheck={false}
                    className="h-7 font-sans text-xs shadow-none"
                  />
                </ComputerFrameAddress>
              </ComputerFrameToolbar>
              <ComputerFrameContent>
                {tabs.map((tab) => {
                  const page = currentPage(tab)
                  return (
                    <TabsContent
                      key={tab.id}
                      value={tab.id}
                      forceMount
                      className="h-full overflow-auto data-[state=inactive]:hidden"
                    >
                      <div key={`${tab.id}-${tab.revision}`} className="h-full">
                        {page.kind === "new" ? (
                          <Empty className="h-full border-0">
                            <EmptyHeader>
                              <EmptyMedia variant="icon"><PlusIcon /></EmptyMedia>
                              <EmptyTitle>New tab</EmptyTitle>
                              <EmptyDescription>{page.description}</EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent className="flex-row flex-wrap justify-center">
                              {SAMPLE_PAGES.map((samplePage) => (
                                <Button key={samplePage.id} type="button" size="sm" variant="outline" onClick={() => navigateTab(tab.id, samplePage)}>
                                  {samplePage.label}
                                </Button>
                              ))}
                            </EmptyContent>
                          </Empty>
                        ) : page.kind === "external" ? (
                          <Empty className="h-full border-0">
                            <EmptyHeader>
                              <EmptyMedia variant="icon"><CircleAlertIcon /></EmptyMedia>
                              <EmptyTitle>{page.title}</EmptyTitle>
                              <EmptyDescription>{page.description}</EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        ) : (
                          <article className="mx-auto flex max-w-2xl flex-col gap-6 p-5 sm:p-8">
                            <div className="flex flex-col gap-2">
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
                        )}
                      </div>
                    </TabsContent>
                  )
                })}
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
