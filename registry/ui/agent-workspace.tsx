"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs"

type AgentWorkspaceView = "computer" | "conversation"

type AgentWorkspaceProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Supply responsive visibility and any mobile trigger from the host. */
  navigation?: React.ReactNode
  header?: React.ReactNode
  /** The large browser stage, shown on the right on desktop. */
  computer: React.ReactNode
  /** The compact conversation rail, shown on the left on desktop. */
  conversation: React.ReactNode
  defaultView?: AgentWorkspaceView
}

const DESKTOP_QUERY = "(min-width: 768px)"

function subscribeToDesktop(callback: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY)
  mediaQuery.addEventListener("change", callback)
  return () => mediaQuery.removeEventListener("change", callback)
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches
}

function getServerDesktopSnapshot() {
  return true
}

function AgentWorkspace({
  navigation,
  header,
  computer,
  conversation,
  className,
  defaultView = "computer",
  ...props
}: AgentWorkspaceProps) {
  const [view, setView] = React.useState<AgentWorkspaceView>(defaultView)
  const isDesktop = React.useSyncExternalStore(
    subscribeToDesktop,
    getDesktopSnapshot,
    getServerDesktopSnapshot
  )

  const handleViewChange = (value: string) => {
    if (value === "computer" || value === "conversation") {
      setView(value)
    }
  }

  return (
    <div
      data-slot="agent-workspace"
      className={cn("flex h-full min-h-0 w-full min-w-0", className)}
      {...props}
    >
      {navigation ? (
        <aside
          data-slot="agent-workspace-navigation"
          className="h-full shrink-0"
        >
          {navigation}
        </aside>
      ) : null}

      <div
        data-slot="agent-workspace-content"
        className="flex min-h-0 min-w-0 flex-1 flex-col"
      >
        {header ? (
          <header
            data-slot="agent-workspace-header"
            className="shrink-0"
          >
            {header}
          </header>
        ) : null}

        <main
          data-slot="agent-workspace-main"
          className="min-h-0 min-w-0 flex-1"
        >
          {isDesktop ? (
            <div
              data-slot="agent-workspace-desktop"
              className="h-full min-h-0"
            >
              <ResizablePanelGroup orientation="horizontal" className="min-h-0">
                <ResizablePanel
                  defaultSize="25%"
                  minSize={280}
                  maxSize={420}
                  className="min-h-0 min-w-0 overflow-hidden"
                >
                  {conversation}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  defaultSize="75%"
                  minSize="45%"
                  className="min-h-0 min-w-0 overflow-hidden"
                >
                  {computer}
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          ) : (
            <div
              data-slot="agent-workspace-mobile"
              className="h-full min-h-0"
            >
              <Tabs
                value={view}
                onValueChange={handleViewChange}
                className="h-full min-h-0 gap-0 p-3"
              >
                <TabsList aria-label="Workspace view" className="w-full shrink-0">
                  <TabsTrigger value="computer">Computer</TabsTrigger>
                  <TabsTrigger value="conversation">Conversation</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="computer"
                  forceMount
                  className="mt-3 min-h-0 overflow-auto data-[state=inactive]:hidden"
                >
                  {computer}
                </TabsContent>
                <TabsContent
                  value="conversation"
                  forceMount
                  className="mt-3 min-h-0 overflow-auto data-[state=inactive]:hidden"
                >
                  {conversation}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export {
  AgentWorkspace,
  type AgentWorkspaceProps,
  type AgentWorkspaceView,
}
