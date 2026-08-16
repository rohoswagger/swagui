import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Trust bar. Pure CSS — no motion dependency, no JS. The 40s duration is
 * deliberate: an ambient drift rather than something asking for attention.
 * Edges are masked so items enter and leave rather than popping.
 */
function LogoMarquee({
  label,
  children,
  speed = 40,
  className,
  ...props
}: React.ComponentProps<"section"> & { label?: React.ReactNode; speed?: number }) {
  const items = React.Children.toArray(children)

  return (
    <section
      data-slot="logo-marquee"
      className={cn("w-full overflow-hidden px-6 py-16 sm:px-8", className)}
      {...props}
    >
      {label ? (
        <p className="text-muted-foreground mb-9 text-center font-mono text-[0.6875rem] tracking-[0.24em] uppercase">
          {label}
        </p>
      ) : null}

      <div
        className="relative flex w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
      >
        {/* Duplicated once so the -50% translate loops seamlessly. */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-16 pr-16 [animation:swagui-marquee_var(--marquee-duration)_linear_infinite] motion-reduce:[animation:none]"
            style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="text-muted-foreground flex shrink-0 items-center opacity-70 transition-opacity duration-(--duration-base) ease-(--ease-swagui) hover:opacity-100"
              >
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`@keyframes swagui-marquee { to { transform: translateX(-100%) } }`}</style>
    </section>
  )
}

export { LogoMarquee }
