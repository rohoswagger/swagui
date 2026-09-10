import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

const sidebar = readFileSync(new URL("../registry/ui/conversation-sidebar.tsx", import.meta.url), "utf8")
const payload = JSON.parse(readFileSync(new URL("../public/r/conversation-sidebar.json", import.meta.url), "utf8")) as {
  files: Array<{ content: string }>
}

describe("conversation sidebar mobile boundary", () => {
  test("keeps the backdrop viewport-sized and inert boundary outside the navigation wrapper", () => {
    expect(sidebar).toContain('"fixed inset-0 z-30')
    expect(sidebar).toContain('md:absolute md:hidden')
    expect(sidebar).toContain("aside?.closest<HTMLElement>")
    expect(sidebar).toContain('data-slot=\\"agent-workspace\\"')
    expect(sidebar).toContain("!element.contains(aside)")
    expect(sidebar).toContain("!element.contains(backdropRef.current)")
  })

  test("publishes the same mobile boundary fix", () => {
    expect(payload.files[0]?.content).toContain('"fixed inset-0 z-30')
    expect(payload.files[0]?.content).toContain("!element.contains(aside)")
    expect(payload.files[0]?.content).toContain("!element.contains(backdropRef.current)")
  })
})
