"use client";

import * as React from "react";
import {
  AppWindowIcon,
  ArrowRightIcon,
  BoxIcon,
  BracesIcon,
  CheckIcon,
  MousePointer2Icon,
  PlayIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  SquircleIcon,
} from "lucide-react";

import { Button } from "@/registry/ui/button";
import { CtaBand } from "@/registry/blocks/cta-band/cta-band";
import { FaqAccordion } from "@/registry/blocks/faq-accordion/faq-accordion";
import {
  FeatureShowcase,
  FeatureShowcaseCard,
  FeatureShowcaseCaption,
  FeatureShowcaseFloat,
  FeatureShowcaseMedia,
} from "@/registry/blocks/feature-showcase/feature-showcase";
import { HeroCentered } from "@/registry/blocks/hero-centered/hero-centered";
import { LogoMarquee } from "@/registry/blocks/logo-marquee/logo-marquee";
import { PricingTiers } from "@/registry/blocks/pricing-tiers/pricing-tiers";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/blocks/section/section";
import { SiteFooter } from "@/registry/blocks/site-footer/site-footer";
import { SiteNav } from "@/registry/blocks/site-nav/site-nav";
import { StatBand } from "@/registry/blocks/stat-band/stat-band";
import { TestimonialGrid } from "@/registry/blocks/testimonial-grid/testimonial-grid";

const NAV_LINKS = [
  { label: "Components", href: "#" },
  { label: "Blocks", href: "#" },
  { label: "Theme", href: "#" },
  { label: "Docs", href: "#" },
];

const TESTIMONIALS = [
  {
    quote:
      "The density scope alone justified the switch. One attribute and the whole dashboard tightened up.",
    name: "Priya Raman",
    role: "Staff engineer",
    initials: "PR",
  },
  {
    quote:
      "Withholding the accent from buttons felt wrong for a day, then obvious forever.",
    name: "Marco Silva",
    role: "Design lead",
    initials: "MS",
  },
  {
    quote:
      "Installing a component brings the tokens with it. No setup step to forget.",
    name: "Ada Okafor",
    role: "Founder",
    initials: "AO",
  },
];

const TIERS = [
  {
    name: "Solo",
    price: "Free",
    description: "Everything, for one person.",
    features: ["All 51 components", "All 12 blocks", "Theme tokens"],
    action: { label: "Get started", href: "#" },
  },
  {
    name: "Team",
    price: "$12",
    cadence: "/mo",
    description: "Shared conventions across projects.",
    features: [
      "Everything in Solo",
      "Private registry",
      "Shared presets",
      "Priority updates",
    ],
    action: { label: "Start trial", href: "#" },
    featured: true,
  },
  {
    name: "Studio",
    price: "$48",
    cadence: "/mo",
    description: "For agencies shipping many sites.",
    features: [
      "Everything in Team",
      "Unlimited registries",
      "White-label docs",
    ],
    action: { label: "Contact", href: "#" },
  },
];

const FAQS = [
  {
    question: "Does a theme change reach projects I already installed?",
    answer:
      "No. Registry installs are copies, so a token change only affects new installs. Re-run the add command to pull updates.",
  },
  {
    question: "Why is the brand colour never on a button?",
    answer:
      "Hierarchy is carried by elevation and type. Reserving the hue for links, focus rings and status makes it mean something when it appears.",
  },
  {
    question: "Do components depend on a motion library?",
    answer:
      "Never. Only blocks may depend on motion, so application bundles stay lean.",
  },
];

const STATS = [
  { value: "51", label: "Components" },
  { value: "12", label: "Blocks" },
  { value: "0", label: "Presets" },
  { value: "18 KB", label: "Theme" },
];

/* Vignettes for the feature-showcase demo. Content, not registry code — a
   consuming site draws its own product in these slots. */

function RegistryVignette() {
  const rows = [
    { icon: <SquircleIcon />, name: "button", detail: "primitive · 2.1 KB" },
    { icon: <AppWindowIcon />, name: "dialog", detail: "overlay · 4.3 KB" },
  ];
  return (
    <FeatureShowcaseFloat
      overlay={
        <div aria-hidden className="absolute -bottom-12 left-[58%] z-10">
          <MousePointer2Icon className="fill-foreground text-foreground size-4" />
          <span className="bg-foreground text-background shadow-(--shadow-raised) mt-1 ml-3 inline-block rounded-full px-2.5 py-1 text-[0.6875rem] font-medium">
            You
          </span>
        </div>
      }
    >
      <p className="px-4 pt-3.5 pb-3 text-[0.8125rem] font-medium">Registry</p>
      <div className="border-border/60 divide-border/60 divide-y border-t">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-3 px-4 py-3">
            <span className="bg-accent text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md [&_svg]:size-4">
              {row.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[0.8125rem] leading-tight">
                {row.name}
              </span>
              <span className="text-muted-foreground block text-[0.71875rem]">
                {row.detail}
              </span>
            </span>
            <span className="border-border/70 ml-auto flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium">
              <PlusIcon className="size-3" />
              Add
            </span>
          </div>
        ))}
      </div>
    </FeatureShowcaseFloat>
  );
}

function RestyleVignette() {
  const changes = [
    { knob: "Radius", value: "1.4×" },
    { knob: "Accent", value: "250", dot: true },
    { knob: "Density", value: "compact" },
  ];
  return (
    <div className="z-10 flex w-full max-w-[19rem] flex-col">
      <FeatureShowcaseFloat className="max-w-none">
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <span className="bg-success/12 text-success flex size-6 shrink-0 items-center justify-center rounded-md [&_svg]:size-3.5">
            <CheckIcon />
          </span>
          <p className="flex-1 text-[0.8125rem] font-medium">Tokens rebuilt</p>
          <span className="text-muted-foreground font-mono text-[0.625rem]">
            0.4 s
          </span>
        </div>
      </FeatureShowcaseFloat>
      <div
        aria-hidden
        className="border-foreground/25 mx-auto h-6 w-px border-l border-dashed"
      />
      <FeatureShowcaseFloat className="max-w-none">
        <div className="flex flex-col gap-2.5 p-4">
          <p className="text-[0.8125rem] font-medium">51 components restyled</p>
          {changes.map((c) => (
            <div key={c.knob} className="flex items-center gap-2">
              <span className="text-muted-foreground text-[0.8125rem]">
                {c.knob}
              </span>
              <ArrowRightIcon className="text-muted-foreground/70 size-3" />
              <span className="border-border/70 flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[0.6875rem]">
                {c.dot ? (
                  <span className="bg-brand size-1.5 rounded-full" />
                ) : null}
                {c.value}
              </span>
            </div>
          ))}
        </div>
      </FeatureShowcaseFloat>
    </div>
  );
}

function ThemeCodeVignette() {
  return (
    <FeatureShowcaseFloat
      className="max-w-[19.5rem]"
      overlay={
        <div
          aria-hidden
          className="bg-foreground text-background shadow-(--shadow-overlay) absolute top-[42%] -right-7 z-10 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[0.6875rem]"
        >
          <span
            className="size-1.5 rounded-full"
            style={{ background: "oklch(0.62 0.19 25)" }}
          />
          oklch(0.62 0.19 25)
        </div>
      }
    >
      <div className="border-border/60 flex items-center gap-1.5 border-b px-4 py-3">
        <span className="bg-foreground/15 size-2 rounded-full" />
        <span className="bg-foreground/15 size-2 rounded-full" />
        <span className="bg-foreground/15 size-2 rounded-full" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.71875rem] leading-[1.9]">
        <code>
          <span className="text-muted-foreground">:root</span> {"{"}
          {"\n"}
          {"  "}--brand:{" "}
          <span className="bg-brand/10 text-brand-content rounded-sm px-1 py-0.5">
            oklch(0.58 0.16 250)
          </span>
          ;{"\n"}
          {"  "}--squircle-factor: 1.4;{"\n"}
          {"  "}--display-tracking: -0.03em;{"\n"}
          {"}"}
        </code>
      </pre>
    </FeatureShowcaseFloat>
  );
}

/** Each block is framed and labelled so every one is inspectable on its own. */
function BlockFrame({
  name,
  note,
  children,
}: {
  name: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border/60 border-t">
      <div className="mx-auto flex w-full max-w-[75rem] items-baseline gap-3 px-6 pt-8 sm:px-8">
        <h3 className="text-muted-foreground font-mono text-[0.625rem] tracking-[0.2em] uppercase">
          {name}
        </h3>
        {note ? (
          <p className="text-muted-foreground/70 text-[0.6875rem]">{note}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function BlocksView() {
  return (
    <div>
      <BlockFrame name="site-nav" note="sticky · responsive sheet menu">
        <SiteNav
          brand="swagui"
          links={NAV_LINKS}
          action={{ label: "Install", href: "#" }}
        />
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
            <span
              key={n}
              className="font-[family-name:var(--font-display)] text-[1.375rem] tracking-tight"
            >
              {n}
            </span>
          ))}
        </LogoMarquee>
      </BlockFrame>

      <BlockFrame name="stat-band">
        <StatBand stats={STATS} />
      </BlockFrame>

      <BlockFrame
        name="feature-showcase"
        note="brand-washed media · vignette slot"
      >
        <FeatureShowcase
          eyebrow="Features"
          title="Made to be seen working."
          description="When a feature deserves more than a sentence, give it a canvas."
          actions={
            <>
              <Button>Get started</Button>
              <Button variant="outline">
                Watch demo
                <PlayIcon />
              </Button>
            </>
          }
        >
          <FeatureShowcaseCard>
            <FeatureShowcaseMedia>
              <RegistryVignette />
            </FeatureShowcaseMedia>
            <FeatureShowcaseCaption
              icon={<BoxIcon />}
              title="Install, don't configure"
            >
              Components land in your repo as source, tokens alongside. No
              package to version, no setup step to forget.
            </FeatureShowcaseCaption>
          </FeatureShowcaseCard>

          <FeatureShowcaseCard>
            <FeatureShowcaseMedia>
              <RestyleVignette />
            </FeatureShowcaseMedia>
            <FeatureShowcaseCaption
              icon={<SlidersHorizontalIcon />}
              title="One knob, every surface"
            >
              Identity lives in the token layer. Retune a radius or a
              temperature once and all fifty-one components follow.
            </FeatureShowcaseCaption>
          </FeatureShowcaseCard>

          <FeatureShowcaseCard>
            <FeatureShowcaseMedia>
              <ThemeCodeVignette />
            </FeatureShowcaseMedia>
            <FeatureShowcaseCaption
              icon={<BracesIcon />}
              title="The accent is the theme"
            >
              Each project swaps one hot colour and keeps everything else —
              family resemblance without redesigning from zero.
            </FeatureShowcaseCaption>
          </FeatureShowcaseCard>
        </FeatureShowcase>
      </BlockFrame>

      <BlockFrame name="testimonial-grid">
        <TestimonialGrid
          eyebrow="In use"
          title="What people notice first."
          items={TESTIMONIALS}
        />
      </BlockFrame>

      <BlockFrame
        name="pricing-tiers"
        note="featured tier marked by elevation, not colour"
      >
        <PricingTiers
          eyebrow="Pricing"
          title="Simple, and mostly free."
          description="Everything is open. Paid tiers exist for teams sharing conventions."
          tiers={TIERS}
        />
      </BlockFrame>

      <BlockFrame name="faq-accordion" note="width='narrow'">
        <FaqAccordion
          eyebrow="Questions"
          title="The things people ask."
          items={FAQS}
        />
      </BlockFrame>

      <BlockFrame name="section" note="the shell the sections above compose">
        <Section>
          <SectionHeader align="start">
            <SectionEyebrow>Primitive</SectionEyebrow>
            <SectionTitle>Section, on its own.</SectionTitle>
            <SectionDescription>
              Container width, vertical rhythm, and the eyebrow / title /
              description parts. Everything else here is built on top of it.
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
            {
              title: "Product",
              links: [
                { label: "Components", href: "#" },
                { label: "Blocks", href: "#" },
                { label: "Theme", href: "#" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Docs", href: "#" },
                { label: "Registry", href: "#" },
                { label: "Changelog", href: "#" },
              ],
            },
            {
              title: "More",
              links: [
                { label: "GitHub", href: "#" },
                { label: "Contact", href: "#" },
              ],
            },
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
  );
}
