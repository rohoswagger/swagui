import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/registry/ui/card"

function FeatureCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      data-slot="feature-card"
      className={cn(
        "gap-0 rounded-none border-0 bg-transparent p-0 shadow-none",
        className,
      )}
      {...props}
    />
  )
}

function FeatureCardMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-card-media"
      className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-2xl", className)}
      {...props}
    />
  )
}

function FeatureCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      data-slot="feature-card-content"
      className={cn("px-0 pt-6", className)}
      {...props}
    />
  )
}

function FeatureCardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="feature-card-title"
      className={cn(
        "font-[family-name:var(--font-display)] text-[1.375rem] leading-[1.15] tracking-[-0.025em]",
        className,
      )}
      {...props}
    />
  )
}

function FeatureCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="feature-card-description"
      className={cn("text-muted-foreground text-[0.9375rem] leading-[1.6] text-pretty", className)}
      {...props}
    />
  )
}

export {
  FeatureCard,
  FeatureCardMedia,
  FeatureCardContent,
  FeatureCardTitle,
  FeatureCardDescription,
}
