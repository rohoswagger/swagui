import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"

import { AgentWorkspace } from "@/registry/ui/agent-workspace"
import {
  ComputerFrame,
  ComputerFrameAddress,
  ComputerFrameContent,
  ComputerFrameFooter,
  ComputerFrameTab,
  ComputerFrameTabs,
  ComputerFrameToolbar,
} from "@/registry/ui/computer-frame"
import {
  AgentWorkingMark,
  AgentWorkingMarkProvider,
} from "@/registry/ui/agent-working-mark"
import { ConversationSidebarItem } from "@/registry/ui/conversation-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs"
import { AgentWorkspaceDemo } from "@/registry/blocks/agent-workspace-demo/agent-workspace-demo"

describe("agent workspace contracts", () => {
  test("renders the compact conversation rail before the browser stage", () => {
    const html = renderToStaticMarkup(
      <AgentWorkspace
        navigation={<nav>Threads</nav>}
        header={<h1>Workspace</h1>}
        computer={<div>Browser</div>}
        conversation={<div>Conversation</div>}
      />
    )

    expect(html).toContain('data-slot="agent-workspace"')
    expect(html).toContain('data-slot="agent-workspace-navigation"')
    expect(html).toContain('data-slot="agent-workspace-header"')
    expect(html).toContain('data-slot="agent-workspace-desktop"')
    expect(html).toContain("flex-basis:75%")
    expect(html).toContain("flex-basis:25%")
    const conversationIndex = html.indexOf(">Conversation</div>")
    const browserIndex = html.indexOf(">Browser</div>")
    expect(conversationIndex > -1 && conversationIndex < browserIndex).toBe(true)
    expect(readFileSync("registry/ui/agent-workspace.tsx", "utf8")).toContain(
      'minSize="45%"'
    )
    expect(readFileSync("registry/ui/agent-workspace.tsx", "utf8")).toContain(
      "minSize={280}"
    )
    expect(readFileSync("registry/ui/agent-workspace.tsx", "utf8")).toContain(
      "maxSize={420}"
    )
    expect(html).not.toContain('data-slot="agent-workspace-mobile"')
  })

  test("keeps computer frame slots host-owned", () => {
    const html = renderToStaticMarkup(
      <Tabs value="tracker">
        <ComputerFrame>
          <ComputerFrameTabs aria-label="Workspace views">
            <ComputerFrameTab value="tracker">Tracker</ComputerFrameTab>
            <ComputerFrameTab value="sources">Sources</ComputerFrameTab>
          </ComputerFrameTabs>
          <ComputerFrameToolbar>Controls</ComputerFrameToolbar>
          <ComputerFrameAddress>workspace.local/notes</ComputerFrameAddress>
          <ComputerFrameContent>Page</ComputerFrameContent>
          <ComputerFrameFooter>Status</ComputerFrameFooter>
        </ComputerFrame>
      </Tabs>
    )

    expect(html).toContain('data-slot="computer-frame"')
    expect(html).toContain('data-slot="computer-frame-toolbar"')
    expect(html).toContain('data-slot="computer-frame-tabs"')
    expect(html).toContain('data-slot="computer-frame-tab"')
    expect(html).toContain('data-slot="computer-frame-address"')
    expect(html).toContain('data-slot="computer-frame-content"')
    expect(html).toContain('data-slot="computer-frame-footer"')
    expect(html).toContain("h-12")
    expect(html).toContain("min-w-0 flex-1 truncate")
    expect(html).toContain("min-h-0 flex-1 overflow-auto")
  })

  test("working mark defaults, provider defaults and explicit variants stay distinct", () => {
    const absent = renderToStaticMarkup(<AgentWorkingMark />)
    const inherited = renderToStaticMarkup(
      <AgentWorkingMarkProvider defaultVariant="tesseract">
        <AgentWorkingMark />
      </AgentWorkingMarkProvider>
    )
    const explicit = renderToStaticMarkup(
      <AgentWorkingMarkProvider defaultVariant="tesseract">
        <AgentWorkingMark variant="circuit" />
      </AgentWorkingMarkProvider>
    )

    expect(absent).toContain('data-variant="mobius"')
    expect(inherited).toContain('data-variant="tesseract"')
    expect(explicit).toContain('data-variant="circuit"')
  })

  test("sidebar working marks inherit the provider unless explicitly overridden", () => {
    const inherited = renderToStaticMarkup(
      <AgentWorkingMarkProvider defaultVariant="tesseract">
        <ConversationSidebarItem title="Build" status="working" />
      </AgentWorkingMarkProvider>
    )
    const explicit = renderToStaticMarkup(
      <AgentWorkingMarkProvider defaultVariant="tesseract">
        <ConversationSidebarItem
          title="Build"
          status="working"
          workingMark="circuit"
        />
      </AgentWorkingMarkProvider>
    )

    expect(inherited).toContain('data-variant="tesseract"')
    expect(explicit).toContain('data-variant="circuit"')
  })

  test("force-mounted inactive tabs carry the hiding contract and tab labels", () => {
    const html = renderToStaticMarkup(
      <Tabs value="computer">
        <TabsList aria-label="Workspace view">
          <TabsTrigger value="computer">Computer</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
        </TabsList>
        <TabsContent
          value="computer"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          Computer
        </TabsContent>
        <TabsContent
          value="conversation"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          Conversation
        </TabsContent>
      </Tabs>
    )
    const inactivePanelStart = html.indexOf(
      'data-state="inactive" data-orientation="horizontal" role="tabpanel"'
    )
    const inactivePanelEnd = html.indexOf(">", inactivePanelStart)
    const inactivePanel = html.slice(inactivePanelStart, inactivePanelEnd)

    expect(html).toContain('aria-labelledby="')
    expect(inactivePanel).toContain("data-[state=inactive]:hidden")
  })

  test("demo stays source-controlled and does not imply a network browser", () => {
    const html = renderToStaticMarkup(<AgentWorkspaceDemo />)
    const source = readFileSync("registry/blocks/agent-workspace-demo/agent-workspace-demo.tsx", "utf8")

    expect(html).toContain('data-slot="agent-workspace-demo"')
    expect(html).toContain("workspace.local/overview")
    expect(html).toContain("Which part of the workspace should we inspect?")
    expect(source).not.toContain("<iframe")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("window.location")
  })

  test("registry items expose canonical dependencies without duplicate entries", () => {
    const registry = JSON.parse(readFileSync("registry.json", "utf8")) as {
      items: Array<{
        name: string
        type: string
        registryDependencies?: string[]
        dependencies?: string[]
      }>
    }
    const byName = new Map(registry.items.map((item) => [item.name, item]))
    const dependencies = (name: string) => byName.get(name)?.registryDependencies ?? []

    expect(JSON.stringify(dependencies("agent-workspace"))).toBe(JSON.stringify([
      "https://swagui.rohoswagger.com/r/resizable.json",
      "https://swagui.rohoswagger.com/r/tabs.json",
      "https://swagui.rohoswagger.com/r/theme.json",
    ]))
    expect(JSON.stringify(dependencies("computer-frame"))).toBe(JSON.stringify([
      "https://swagui.rohoswagger.com/r/tabs.json",
      "https://swagui.rohoswagger.com/r/theme.json",
    ]))
    expect(new Set(dependencies("agent-workspace-demo")).size).toBe(
      dependencies("agent-workspace-demo").length
    )
    expect(JSON.stringify(byName.get("agent-workspace-demo")?.dependencies ?? [])).toBe(
      JSON.stringify(["lucide-react"])
    )
    expect(JSON.stringify(byName.get("computer-frame")?.dependencies ?? [])).toBe(
      JSON.stringify([])
    )
  })
})
