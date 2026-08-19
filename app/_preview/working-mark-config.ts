import {
  AGENT_WORKING_MARK_OPTIONS,
  type AgentWorkingMarkVariant,
} from "@/registry/ui/agent-working-mark"

const DEFAULT_WORKING_MARK: AgentWorkingMarkVariant = "mobius"

function readWorkingMarkParam(params: Pick<URLSearchParams, "get">) {
  return (
    AGENT_WORKING_MARK_OPTIONS.find(
      (option) => option.id === params.get("workingMark")
    )?.id ?? DEFAULT_WORKING_MARK
  )
}

export { DEFAULT_WORKING_MARK, readWorkingMarkParam }
