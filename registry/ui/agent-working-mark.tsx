import * as React from "react"

import { cn } from "@/lib/utils"

type AgentWorkingMarkVariant = "mobius" | "tesseract" | "circuit" | "blocks"

const AGENT_WORKING_MARK_OPTIONS: readonly {
  id: AgentWorkingMarkVariant
  label: string
}[] = [
  { id: "mobius", label: "Möbius" },
  { id: "tesseract", label: "Tesseract" },
  { id: "circuit", label: "Circuit" },
  { id: "blocks", label: "Blocks" },
]

function AgentWorkingMark({
  className,
  variant = "mobius",
  size = 16,
  label = "Working",
  paused = false,
  ...props
}: Omit<React.ComponentProps<"svg">, "children"> & {
  variant?: AgentWorkingMarkVariant
  size?: number
  label?: string
  paused?: boolean
}) {
  return (
    <svg
      data-slot="agent-working-mark"
      data-variant={variant}
      data-paused={paused || undefined}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
      className={cn(
        "shrink-0 overflow-visible text-brand",
        paused && "agent-working-mark-paused",
        className
      )}
      {...props}
    >
      {variant === "mobius" ? (
        <MobiusWeave />
      ) : variant === "tesseract" ? (
        <TesseractFold />
      ) : variant === "circuit" ? (
        <InwardCircuit />
      ) : (
        <BumpingBlocks />
      )}
    </svg>
  )
}

const MOBIUS_PATH = "M3.5 12C3.5 5.6 8.8 5.5 12 12c3.2 6.5 8.5 6.4 8.5 0S15.2 5.5 12 12 3.5 18.4 3.5 12"

function MobiusWeave() {
  return (
    <g className="agent-mobius-weave" fill="none" strokeLinecap="round">
      <path d={MOBIUS_PATH} stroke="currentColor" strokeWidth="2.4" opacity="0.15" />
      <path
        d={MOBIUS_PATH}
        pathLength="100"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeDasharray="22 78"
        className="agent-mobius-runner"
      />
      <path
        d="M9.7 15.3c.9-.8 1.6-1.9 2.3-3.3.7-1.4 1.4-2.5 2.3-3.3"
        stroke="currentColor"
        strokeWidth="3.4"
        opacity="0.32"
      />
      <path
        d="M10.2 8.1c.7.8 1.3 1.8 1.8 3.1"
        stroke="currentColor"
        strokeWidth="2.4"
        opacity="0.78"
      />
    </g>
  )
}

function TesseractFold() {
  return (
    <g className="agent-tesseract-fold" fill="none" stroke="currentColor" strokeLinejoin="round">
      <path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" strokeWidth="1.4" opacity="0.22" />
      <g className="agent-tesseract-connectors" strokeWidth="1" opacity="0.38">
        <path d="m12 2.5-5 4.5M21.5 12 17 7M12 21.5 17 17M2.5 12 7 17" />
      </g>
      <g className="agent-tesseract-inner">
        <rect x="7" y="7" width="10" height="10" rx="1.2" strokeWidth="1.8" />
        <rect x="9.2" y="9.2" width="5.6" height="5.6" rx="0.8" strokeWidth="1" opacity="0.32" />
      </g>
    </g>
  )
}

const CIRCUIT_PATH = "M4 4h16v16H4V8h12v8H8v-4h4"

function InwardCircuit() {
  return (
    <g className="agent-inward-circuit" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d={CIRCUIT_PATH} strokeWidth="1.8" opacity="0.14" />
      <path
        d={CIRCUIT_PATH}
        pathLength="100"
        strokeWidth="2"
        strokeDasharray="16 84"
        className="agent-inward-circuit-runner"
      />
      <path
        d={CIRCUIT_PATH}
        pathLength="100"
        strokeWidth="1.2"
        strokeDasharray="7 93"
        className="agent-inward-circuit-runner agent-inward-circuit-runner-secondary"
      />
    </g>
  )
}

const BLOCK_POSITIONS = [4, 8, 12, 16, 20] as const

function BumpingBlocks() {
  return (
    <g className="agent-bumping-blocks">
      {BLOCK_POSITIONS.map((x, index) => (
        <g key={x} transform={`translate(${x} 10.5)`}>
          <g
            className="agent-bumping-block"
            style={{ animationDelay: `${index * -0.22}s` }}
          >
            <path d="M-1.6 0 0-.95 1.6 0 0 .95Z" fill="currentColor" opacity="0.94" />
            <path d="M-1.6 0 0 .95v2.25l-1.6-.95Z" fill="currentColor" opacity="0.36" />
            <path d="M0 .95 1.6 0v2.25L0 3.2Z" fill="currentColor" opacity="0.62" />
          </g>
        </g>
      ))}
    </g>
  )
}

export {
  AGENT_WORKING_MARK_OPTIONS,
  AgentWorkingMark,
  type AgentWorkingMarkVariant,
}
