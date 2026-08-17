import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/registry/ui/avatar"
import {
  Section,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
  SectionContent,
} from "@/registry/blocks/section/section"
import { RevealGroup, RevealItem } from "@/registry/blocks/reveal/reveal"

type Testimonial = {
  quote: React.ReactNode
  name: string
  role?: React.ReactNode
  initials?: string
}

function TestimonialGrid({
  eyebrow,
  title,
  items,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  items: Testimonial[]
}) {
  return (
    <Section data-slot="testimonial-grid" className={cn(className)} {...props}>
      {title ? (
        <SectionHeader>
          {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
          <SectionTitle className="max-w-[18ch]">{title}</SectionTitle>
        </SectionHeader>
      ) : null}

      <SectionContent>
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <RevealItem
              key={i}
              className="bg-card flex flex-col rounded-xl border p-7 shadow-[var(--shadow-raised),var(--inset-highlight)]"
            >
              <blockquote className="text-[0.9375rem] leading-[1.7] text-pretty">
                {t.quote}
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-[0.6875rem]">
                    {t.initials ?? t.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-[0.875rem] font-medium">{t.name}</p>
                  {t.role ? (
                    <p className="text-muted-foreground text-[0.8125rem]">{t.role}</p>
                  ) : null}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </SectionContent>
    </Section>
  )
}

export { TestimonialGrid }
