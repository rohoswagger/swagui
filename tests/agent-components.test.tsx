import { describe, expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"

import { Artifact, ArtifactContent, ArtifactTitle, Artifacts } from "@/registry/ui/artifact"
import { ChatHeaderBreadcrumb } from "@/registry/ui/chat-header"
import { PromptInputContextIndicator, PromptInputModelSelect } from "@/registry/ui/prompt-input"
import { Response, ResponseContent, ResponseUsage } from "@/registry/ui/response"
import { Subagent, Subagents } from "@/registry/ui/subagent"
import { ToolCall, ToolCalls } from "@/registry/ui/tool-call"

describe("agent component contracts", () => {
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
