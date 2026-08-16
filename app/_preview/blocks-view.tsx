"use client"

import * as React from "react"
import { GaugeIcon, LayersIcon, PaletteIcon, ZapIcon } from "lucide-react"

import { CtaBand } from "@/registry/blocks/cta-band/cta-band"
import { FeatureGrid } from "@/registry/blocks/feature-grid/feature-grid"
import { HeroCentered } from "@/registry/blocks/hero-centered/hero-centered"
import { LogoMarquee } from "@/registry/blocks/logo-marquee/logo-marquee"

const FEATURES = [
  {
    icon: <LayersIcon />,
    title: "One token layer",
    description:
      "Identity lives in variables, so every component follows a change without touching a file.",
  },
  {
    icon: <GaugeIcon />,
    title: "Two registers",
    description:
      "A compact scope retunes spacing, radius and line-height for app interiors. Colour is untouched.",
  },
  {
    icon: <PaletteIcon />,
    title: "No presets",
    description:
      "Every value is a knob. A project picks its permutation; the permutation is the theme.",
  },
  {
    icon: <ZapIcon />,
    title: "Motion where it counts",
    description:
      "Sections animate on the house curve. Primitives stay pure CSS so app bundles pay nothing.",
  },
]

export function BlocksView() {
  return (
    <div>
      <HeroCentered
        eyebrow="Design system"
        title="Interfaces that look considered."
        description="A registry of components and sections sharing one fixed identity. Swap the accent per project — everything else stays exactly the same."
        primaryAction={{ label: "Get started", href: "#" }}
        secondaryAction={{ label: "Read the docs", href: "#" }}
        status="v1.0 shipping now"
      />

      <LogoMarquee label="Used across">
        {["relays", "leorio", "gojo", "kaito", "swaggin", "onyx"].map((n) => (
          <span
            key={n}
            className="font-[family-name:var(--font-display)] text-[1.375rem] tracking-tight"
          >
            {n}
          </span>
        ))}
      </LogoMarquee>

      <FeatureGrid
        eyebrow="What it does"
        title="Built to be shaped, not configured."
        description="The interesting divergences are the ones a config file can't express."
        features={FEATURES}
        columns={4}
      />

      <CtaBand
        title="Ship it everywhere."
        description="One registry, every project. Install a component and the tokens come with it."
        primaryAction={{ label: "Install swagui", href: "#" }}
        secondaryAction={{ label: "Browse components", href: "#" }}
      />
    </div>
  )
}
