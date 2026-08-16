"use client"

import * as React from "react"
import { GaugeIcon, LayersIcon, PaletteIcon, ZapIcon } from "lucide-react"

import { CtaBand } from "@/registry/blocks/cta-band/cta-band"
import { FaqAccordion } from "@/registry/blocks/faq-accordion/faq-accordion"
import { FeatureGrid } from "@/registry/blocks/feature-grid/feature-grid"
import { HeroCentered } from "@/registry/blocks/hero-centered/hero-centered"
import { LogoMarquee } from "@/registry/blocks/logo-marquee/logo-marquee"
import { PricingTiers } from "@/registry/blocks/pricing-tiers/pricing-tiers"
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/blocks/section/section"
import { SiteFooter } from "@/registry/blocks/site-footer/site-footer"
import { SiteNav } from "@/registry/blocks/site-nav/site-nav"
import { StatBand } from "@/registry/blocks/stat-band/stat-band"
import { TestimonialGrid } from "@/registry/blocks/testimonial-grid/testimonial-grid"

const NAV_LINKS = [
  { label: "Components", href: "#" },
  { label: "Blocks", href: "#" },
  { label: "Theme", href: "#" },
  { label: "Docs", href: "#" },
]

const FEATURES = [
  { icon: <LayersIcon />, title: "One token layer", description: "Identity lives in variables, so every component follows a change without touching a file." },
  { icon: <GaugeIcon />, title: "Two registers", description: "A compact scope retunes spacing, radius and line-height for app interiors. Colour is untouched." },
  { icon: <PaletteIcon />, title: "No presets", description: "Every value is a knob. A project picks its permutation; the permutation is the theme." },
  { icon: <ZapIcon />, title: "Motion where it counts", description: "Sections animate on the house curve. Primitives stay pure CSS so app bundles pay nothing." },
]

const TESTIMONIALS = [
  { quote: "The density scope alone justified the switch. One attribute and the whole dashboard tightened up.", name: "Priya Raman", role: "Staff engineer", initials: "PR" },
  { quote: "Withholding the accent from buttons felt wrong for a day, then obvious forever.", name: "Marco Silva", role: "Design lead", initials: "MS" },
  { quote: "Installing a component brings the tokens with it. No setup step to forget.", name: "Ada Okafor", role: "Founder", initials: "AO" },
]

const TIERS = [
  { name: "Solo", price: "Free", description: "Everything, for one person.", features: ["All 51 components", "All 12 blocks", "Theme tokens"], action: { label: "Get started", href: "#" } },
  { name: "Team", price: "$12", cadence: "/mo", description: "Shared conventions across projects.", features: ["Everything in Solo", "Private registry", "Shared presets", "Priority updates"], action: { label: "Start trial", href: "#" }, featured: true },
  { name: "Studio", price: "$48", cadence: "/mo", description: "For agencies shipping many sites.", features: ["Everything in Team", "Unlimited registries", "White-label docs"], action: { label: "Contact", href: "#" } },
]

const FAQS = [
  { question: "Does a theme change reach projects I already installed?", answer: "No. Registry installs are copies, so a token change only affects new installs. Re-run the add command to pull updates." },
  { question: "Why is the brand colour never on a button?", answer: "Hierarchy is carried by elevation and type. Reserving the hue for links, focus rings and status makes it mean something when it appears." },
  { question: "Do components depend on a motion library?", answer: "Never. Only blocks may depend on motion, so application bundles stay lean." },
]

const STATS = [
  { value: "51", label: "Components" },
  { value: "12", label: "Blocks" },
  { value: "0", label: "Presets" },
  { value: "18 KB", label: "Theme" },
]

/** Each block is framed and labelled so every one is inspectable on its own. */
function BlockFrame({ name, note, children }: { name: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-border/60 border-t">
      <div className="mx-auto flex w-full max-w-[75rem] items-baseline gap-3 px-6 pt-8 sm:px-8">
        <h3 className="text-muted-foreground font-mono text-[0.625rem] tracking-[0.2em] uppercase">
          {name}
        </h3>
        {note ? <p className="text-muted-foreground/70 text-[0.6875rem]">{note}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function BlocksView() {
  return (
    <div>
      <BlockFrame name="site-nav" note="sticky · responsive sheet menu">
        <SiteNav brand="swagui" links={NAV_LINKS} action={{ label: "Install", href: "#" }} />
      </BlockFrame>

      <BlockFrame name="hero-centered">
        <HeroCentered
          eyebrow="Design system"
          title="Interfaces that look considered."
          description="A registry of components and sections sharing one fixed identity. Swap the accent per project — everything else stays exactly the same."
          primaryAction={{ label: "Get started", href: "#" }}
          secondaryAction={{ label: "Read the docs", href: "#" }}
          status="v1.0 shipping now"
        />
      </BlockFrame>

      <BlockFrame name="logo-marquee" note="pure CSS · no motion dependency">
        <LogoMarquee label="Used across">
          {["relays", "leorio", "gojo", "kaito", "swaggin", "onyx"].map((n) => (
            <span key={n} className="font-[family-name:var(--font-display)] text-[1.375rem] tracking-tight">
              {n}
            </span>
          ))}
        </LogoMarquee>
      </BlockFrame>

      <BlockFrame name="stat-band">
        <StatBand stats={STATS} />
      </BlockFrame>

      <BlockFrame name="feature-grid" note="columns={4}">
        <FeatureGrid
          eyebrow="What it does"
          title="Built to be shaped, not configured."
          description="The interesting divergences are the ones a config file can't express."
          features={FEATURES}
          columns={4}
        />
      </BlockFrame>

      <BlockFrame name="testimonial-grid">
        <TestimonialGrid eyebrow="In use" title="What people notice first." items={TESTIMONIALS} />
      </BlockFrame>

      <BlockFrame name="pricing-tiers" note="featured tier marked by elevation, not colour">
        <PricingTiers
          eyebrow="Pricing"
          title="Simple, and mostly free."
          description="Everything is open. Paid tiers exist for teams sharing conventions."
          tiers={TIERS}
        />
      </BlockFrame>

      <BlockFrame name="faq-accordion" note="width='narrow'">
        <FaqAccordion eyebrow="Questions" title="The things people ask." items={FAQS} />
      </BlockFrame>

      <BlockFrame name="section" note="the shell the sections above compose">
        <Section>
          <SectionHeader align="start">
            <SectionEyebrow>Primitive</SectionEyebrow>
            <SectionTitle>Section, on its own.</SectionTitle>
            <SectionDescription>
              Container width, vertical rhythm, and the eyebrow / title / description parts.
              Everything else here is built on top of it.
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <div className="bg-accent text-muted-foreground rounded-xl px-6 py-12 text-center text-[0.875rem]">
              SectionContent
            </div>
          </SectionContent>
        </Section>
      </BlockFrame>

      <BlockFrame name="cta-band">
        <CtaBand
          title="Ship it everywhere."
          description="One registry, every project. Install a component and the tokens come with it."
          primaryAction={{ label: "Install swagui", href: "#" }}
          secondaryAction={{ label: "Browse components", href: "#" }}
        />
      </BlockFrame>

      <BlockFrame name="site-footer">
        <SiteFooter
          brand="swagui"
          tagline="A personal design system. Components, blocks and one token layer."
          columns={[
            { title: "Product", links: [{ label: "Components", href: "#" }, { label: "Blocks", href: "#" }, { label: "Theme", href: "#" }] },
            { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "Registry", href: "#" }, { label: "Changelog", href: "#" }] },
            { title: "More", links: [{ label: "GitHub", href: "#" }, { label: "Contact", href: "#" }] },
          ]}
          bottom={
            <>
              <span>© {new Date().getFullYear()} swagui</span>
              <span className="font-mono text-[0.6875rem] tracking-[0.16em] uppercase">
                swagui.rohoswagger.com
              </span>
            </>
          }
        />
      </BlockFrame>
    </div>
  )
}
