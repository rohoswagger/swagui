import * as React from "react"

import { cn } from "@/lib/utils"
import { RevealGroup, RevealItem } from "@/registry/blocks/reveal/reveal"

type Stat = { value: React.ReactNode; label: React.ReactNode }

function StatBand({
  stats,
  className,
  ...props
}: React.ComponentProps<"section"> & { stats: Stat[] }) {
  return (
    <section
      data-slot="stat-band"
      className={cn("w-full px-6 py-20 sm:px-8", className)}
      {...props}
    >
      <RevealGroup className="border-border/60 mx-auto grid w-full max-w-[75rem] gap-px overflow-hidden rounded-xl border bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <RevealItem key={i} className="bg-card px-7 py-9 text-center">
            <p className="font-[family-name:var(--font-display)] text-[clamp(1.875rem,3vw,2.5rem)] leading-none">
              {s.value}
            </p>
            <p className="text-muted-foreground mt-2.5 font-mono text-[0.6875rem] tracking-[0.2em] uppercase">
              {s.label}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

export { StatBand }
