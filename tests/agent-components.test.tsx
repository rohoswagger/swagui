import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"

import { Artifact, ArtifactContent, ArtifactTitle, Artifacts } from "@/registry/ui/artifact"
import { SiteFooter } from "@/registry/blocks/site-footer/site-footer"
import {
  ConversationSidebar,
  ConversationSidebarAction,
  ConversationSidebarFooter,
  ConversationSidebarItem,
  ConversationSidebarList,
  ConversationSidebarPanel,
  ConversationSidebarToggle,
} from "@/registry/ui/conversation-sidebar"
import {
  AGENT_WORKING_MARK_OPTIONS,
  AgentWorkingMark,
} from "@/registry/ui/agent-working-mark"
import { ChatHeader, ChatHeaderBreadcrumb } from "@/registry/ui/chat-header"
import { PromptInputContextIndicator, PromptInputModelSelect } from "@/registry/ui/prompt-input"
import { Response, ResponseContent, ResponseUsage } from "@/registry/ui/response"
import { Subagent, Subagents } from "@/registry/ui/subagent"
import { ToolCall, ToolCalls } from "@/registry/ui/tool-call"
import { readWorkingMarkParam } from "@/app/_preview/working-mark-config"

describe("agent component contracts", () => {
  test("conversation sidebar keeps working state visible and items navigable", () => {
    const html = renderToStaticMarkup(
      <ConversationSidebar open onOpenChange={() => {}}>
        <ConversationSidebarList>
          <ConversationSidebarItem
            title="Build Agent Chat Components"
            status="working"
            duration={68}
            workingMark="circuit"
            active
          />
          <ConversationSidebarItem title="Approval flow" status="needs-input" />
        </ConversationSidebarList>
      </ConversationSidebar>
    )

    expect(html).toContain('data-slot="conversation-sidebar"')
    expect(html).toContain('data-state="open"')
    expect(html).toContain('data-variant="circuit"')
    expect(html).toContain('data-status="working"')
    expect(html).toContain('data-status="needs-input"')
    expect(html).toContain('aria-current="page"')
    expect(html.match(/<button/g)).toHaveLength(3)
  })

  test("conversation sidebar expands without changing the chat layout rail", () => {
    const open = renderToStaticMarkup(
      <ConversationSidebar open onOpenChange={() => {}}>
        <ConversationSidebarToggle
          open
          icon={<svg />}
          label="swagui"
        />
        <ConversationSidebarAction icon={<svg />}>New chat</ConversationSidebarAction>
        <ConversationSidebarPanel><button type="button">Thread</button></ConversationSidebarPanel>
        <ConversationSidebarFooter><button type="button">Settings</button></ConversationSidebarFooter>
      </ConversationSidebar>
    )
    const closed = renderToStaticMarkup(
      <ConversationSidebar open={false} onOpenChange={() => {}}>
        <ConversationSidebarToggle
          open={false}
          icon={<svg />}
          hoverIcon={<svg />}
          label="swagui"
        />
        <ConversationSidebarAction icon={<svg />}>New chat</ConversationSidebarAction>
        <ConversationSidebarPanel><button type="button">Thread</button></ConversationSidebarPanel>
        <ConversationSidebarFooter><button type="button">Settings</button></ConversationSidebarFooter>
      </ConversationSidebar>
    )
    const openRail = open.match(/<aside[^>]*>/)?.[0] ?? ""
    const closedRail = closed.match(/<aside[^>]*>/)?.[0] ?? ""
    const header = renderToStaticMarkup(<ChatHeader />)

    expect(openRail).toContain("md:w-11")
    expect(closedRail).toContain("md:w-11")
    expect(openRail).toContain("md:z-40")
    expect(openRail).not.toContain("md:z-auto")
    expect(openRail).not.toContain("md:w-64")
    expect(open).toContain('data-slot="conversation-sidebar-surface"')
    expect(open).toContain("md:w-64")
    expect(open.match(/data-slot="conversation-sidebar-logo"/g)).toHaveLength(1)
    expect(closed.match(/data-slot="conversation-sidebar-logo"/g)).toHaveLength(1)
    expect(closed).not.toContain("peer-hover/toggle")
    expect(closed).toContain('aria-label="New chat"')
    expect(closed.match(/group-data-\[state=closed\]\/conversation-sidebar:invisible/g)).toHaveLength(2)
    expect(open.match(/left-\[5\.5px\]/g)).toHaveLength(2)
    expect(closed.match(/left-\[5\.5px\]/g)).toHaveLength(2)
    expect(header).toContain("h-11")
  })

  test("site footer ends with an overridable decorative wordmark", () => {
    const defaultWordmark = renderToStaticMarkup(<SiteFooter brand="swagui" />)
    const hiddenWordmark = renderToStaticMarkup(
      <SiteFooter brand="swagui" wordmark={false} />
    )
    const linkedBrand = renderToStaticMarkup(
      <SiteFooter brand={<a href="/">swagui</a>} />
    )
    const customWordmark = renderToStaticMarkup(
      <SiteFooter brand={<a href="/">swagui</a>} wordmark="swagui studio" />
    )

    expect(defaultWordmark).toContain('data-slot="site-footer-wordmark"')
    expect(defaultWordmark).toContain(">swagui</div>")
    expect(defaultWordmark).toContain("justify-center")
    expect(defaultWordmark).toContain("font-family:var(--font-display)")
    expect(defaultWordmark).toContain("font-style:normal")
    expect(defaultWordmark).toContain("font-weight:400")
    expect(defaultWordmark).toContain("text-foreground")
    expect(hiddenWordmark).not.toContain('data-slot="site-footer-wordmark"')
    expect(linkedBrand).not.toContain('data-slot="site-footer-wordmark"')
    expect(customWordmark).toContain(">swagui studio</div>")
  })

  test("working mark variants expose a stable accessible status", () => {
    const html = renderToStaticMarkup(
      <>
        <AgentWorkingMark variant="mobius" />
        <AgentWorkingMark variant="tesseract" />
        <AgentWorkingMark variant="circuit" />
        <AgentWorkingMark variant="blocks" />
      </>
    )

    expect(html.match(/data-slot="agent-working-mark"/g)).toHaveLength(4)
    expect(html).toContain('data-variant="mobius"')
    expect(html).toContain('data-variant="tesseract"')
    expect(html).toContain('data-variant="circuit"')
    expect(html).toContain('data-variant="blocks"')
    expect(html.match(/aria-label="Working"/g)).toHaveLength(4)
    expect(html.match(/role="status"/g)).toHaveLength(4)
    expect(AGENT_WORKING_MARK_OPTIONS.map((option) => option.id)).toHaveLength(4)
    expect(AGENT_WORKING_MARK_OPTIONS.map((option) => option.id).join(",")).toBe(
      "mobius,tesseract,circuit,blocks"
    )
    expect(html).toContain("agent-mobius-weave")
    expect(html).toContain("agent-tesseract-fold")
    expect(html).toContain("agent-inward-circuit")
    expect(html).toContain("agent-bumping-blocks")
    expect(renderToStaticMarkup(<AgentWorkingMark paused />)).toContain(
      "agent-working-mark-paused"
    )
  })

  test("working mark query selection validates known and unknown values", () => {
    expect(readWorkingMarkParam(new URLSearchParams("workingMark=circuit"))).toBe("circuit")
    expect(readWorkingMarkParam(new URLSearchParams("workingMark=unknown"))).toBe("mobius")
    expect(readWorkingMarkParam(new URLSearchParams())).toBe("mobius")
  })

  test("working mark motion has a reduced-motion fallback", () => {
    const css = readFileSync(
      new URL("../registry/theme/swagui.css", import.meta.url),
      "utf8"
    )
    const reducedMotion = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))

    expect(reducedMotion).toContain(".agent-mobius-runner")
    expect(reducedMotion).toContain(".agent-tesseract-inner")
    expect(reducedMotion).toContain(".agent-inward-circuit-runner")
    expect(reducedMotion).toContain(".agent-bumping-block")
    expect(reducedMotion).toContain("animation: none")
  })

  test("navigable subagents retain native button semantics inside the list", () => {
    const html = renderToStaticMarkup(
      <Subagents>
        <Subagent name="Researcher" status="completed" duration={4} onOpen={() => {}} />
      </Subagents>
    )

    expect(html).toContain('role="listitem"')
    expect(html).toContain('<button')
    expect(html).not.toContain('<button type="button" data-slot="subagent" data-status="completed" role="listitem"')
  })

  test("running subagent trails stay inset without clipping the row", () => {
    const html = renderToStaticMarkup(
      <Subagent name="Builder" status="running" duration={4} onOpen={() => {}} />
    )

    expect(html).toContain('class="subagent-trail')
    expect(html).toContain('x="1"')
    expect(html).not.toContain("overflow-hidden rounded-md")
  })

  test("subagent identity color is stable while lifecycle moves to the trailing mark", () => {
    const completed = renderToStaticMarkup(
      <Subagent name="Builder" status="completed" duration={8} onOpen={() => {}} />
    )
    const failed = renderToStaticMarkup(
      <Subagent name="Builder" status="failed" duration={8} onOpen={() => {}} />
    )

    expect(completed.match(/data-color-index="(\d+)"/)?.[1]).toBe(
      failed.match(/data-color-index="(\d+)"/)?.[1]
    )
    expect(completed).toContain('data-slot="subagent-state-mark" data-status="completed"')
    expect(failed).toContain('data-slot="subagent-state-mark" data-status="failed"')
  })

  test("response usage is formatted only after streaming finishes", () => {
    const settled = renderToStaticMarkup(
      <Response>
        <ResponseContent>Done.</ResponseContent>
        <ResponseUsage duration={18} tokens={2840} />
      </Response>
    )
    const streaming = renderToStaticMarkup(
      <Response streaming>
        <ResponseContent>Working…</ResponseContent>
        <ResponseUsage duration={18} tokens={2840} />
      </Response>
    )

    expect(settled).toContain("18s")
    expect(settled).toContain("2,840 tokens")
    expect(streaming).not.toContain("2,840 tokens")
  })

  test("context usage is exposed as a meter rather than a dead button", () => {
    const html = renderToStaticMarkup(
      <PromptInputContextIndicator used={32000} total={128000} />
    )

    expect(html).toContain('role="meter"')
    expect(html).toContain('aria-valuenow="32000"')
    expect(html).not.toContain('data-slot="prompt-input-context" type="button"')
  })

  test("legacy model-select props retain the native form control", () => {
    const html = renderToStaticMarkup(
      <PromptInputModelSelect
        models={[{ value: "one", label: "One" }]}
        value="one"
        onValueChange={() => {}}
        name="model"
        disabled
      />
    )

    expect(html).toContain('<select data-slot="prompt-input-model"')
    expect(html).toContain('name="model"')
    expect(html).toContain("disabled")
  })

  test("current breadcrumbs preserve host attributes", () => {
    const html = renderToStaticMarkup(
      <ChatHeaderBreadcrumb current data-testid="current-thread" aria-label="Current agent">
        Builder
      </ChatHeaderBreadcrumb>
    )

    expect(html).toContain('data-testid="current-thread"')
    expect(html).toContain('aria-label="Current agent"')
  })

  test("artifact groups keep each output as its own open target", () => {
    const html = renderToStaticMarkup(
      <Artifacts>
        <Artifact kind="app" openLabel="Open app" onOpen={() => {}}>
          <ArtifactContent><ArtifactTitle>App</ArtifactTitle></ArtifactContent>
        </Artifact>
        <Artifact kind="spreadsheet" openLabel="Open sheet" onOpen={() => {}}>
          <ArtifactContent><ArtifactTitle>Sheet</ArtifactTitle></ArtifactContent>
        </Artifact>
      </Artifacts>
    )

    expect(html.match(/data-slot="artifact"/g)).toHaveLength(2)
    expect(html).toContain('aria-label="Open app"')
    expect(html).toContain('aria-label="Open sheet"')
  })

  test("tool call legacy disclosure props remain compatible", () => {
    const html = renderToStaticMarkup(
      <ToolCalls label="Previous tool calls" defaultOpen>
        <ToolCall kind="task" target="Research inventory" />
      </ToolCalls>
    )

    expect(html).toContain("Previous tool calls")
    expect(html).toContain("Research inventory")
  })
})
