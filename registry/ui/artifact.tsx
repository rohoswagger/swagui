"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/ui/button"

type ArtifactKind =
  | "file"
  | "app"
  | "document"
  | "presentation"
  | "spreadsheet"
  | "image"
  | "code"
  | "archive"

type ArtifactStatus = "ready" | "error"

type ArtifactContextValue = {
  kind: ArtifactKind
  status: ArtifactStatus
}

const ArtifactContext = React.createContext<ArtifactContextValue>({
  kind: "file",
  status: "ready",
})

function Artifacts({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="artifacts"
      className={cn("grid w-full grid-cols-1 items-start gap-2 sm:grid-cols-2", className)}
      {...props}
    />
  )
}

function Artifact({
  className,
  kind = "file",
  status = "ready",
  onOpen,
  openLabel,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onClick"> & {
  kind?: ArtifactKind
  status?: ArtifactStatus
  onOpen: () => void
  openLabel: string
}) {
  const value = React.useMemo(() => ({ kind, status }), [kind, status])
  const unavailable = status === "error"

  return (
    <ArtifactContext.Provider value={value}>
      <div
        data-slot="artifact"
        data-kind={kind}
        data-status={status}
        className={cn(
          "group/artifact relative grid w-full max-w-[23rem] self-start grid-cols-[5.25rem_minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
          "transition-[border-color,background-color,transform] duration-(--duration-fast) ease-(--ease-swagui)",
          unavailable
            ? "border-destructive/25"
            : "hover:border-muted-foreground/40 hover:bg-accent/20 active:scale-[0.995]",
          className
        )}
        {...props}
      >
        <button
          type="button"
          data-slot="artifact-trigger"
          aria-label={openLabel}
          disabled={unavailable}
          onClick={onOpen}
          className={cn(
            "absolute inset-0 z-10 rounded-[inherit] outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset",
            unavailable ? "cursor-not-allowed" : "cursor-pointer"
          )}
        />
        {children}
      </div>
    </ArtifactContext.Provider>
  )
}

function ArtifactPreview({
  className,
  src,
  alt = "",
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  src?: string
  alt?: string
  children?: React.ReactNode
}) {
  const { kind, status } = React.useContext(ArtifactContext)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => setFailed(false), [src])

  const custom = React.Children.count(children) > 0
  const hasImage = !!src && !failed

  return (
    <div
      data-slot="artifact-preview"
      data-visual={custom ? "custom" : hasImage ? "image" : "icon"}
      className={cn(
        "relative flex min-h-[5.25rem] items-center justify-center overflow-hidden border-r border-border bg-muted",
        status === "error" && "opacity-60 saturate-0",
        className
      )}
      {...props}
    >
      {custom ? (
        children
      ) : hasImage ? (
        // A registry primitive cannot assume Next.js. Hosts may replace this
        // with their image component through the custom preview slot.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-(--duration-base) ease-(--ease-swagui) group-hover/artifact:scale-[1.025] motion-reduce:transition-none"
        />
      ) : (
        <ArtifactKindMark kind={kind} />
      )}
    </div>
  )
}

function ArtifactContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="artifact-content"
      className={cn(
        "flex min-w-0 flex-col justify-center gap-0.5 px-2.5 py-2.5 pr-8",
        className
      )}
      {...props}
    />
  )
}

function ArtifactTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="artifact-title"
      className={cn("truncate text-[13px] font-medium text-foreground", className)}
      {...props}
    />
  )
}

function ArtifactDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { status } = React.useContext(ArtifactContext)

  return (
    <p
      data-slot="artifact-description"
      className={cn(
        "line-clamp-2 text-[12px] leading-snug text-muted-foreground",
        status === "error" && "text-destructive/80",
        className
      )}
      {...props}
    />
  )
}

function ArtifactMeta({ className, ...props }: React.ComponentProps<"div">) {
  const { status } = React.useContext(ArtifactContext)

  return (
    <div
      data-slot="artifact-meta"
      className={cn(
        "mono mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-[10px] text-muted-foreground/70",
        status === "error" && "text-destructive/70",
        className
      )}
      {...props}
    />
  )
}

function ArtifactActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="artifact-actions"
      className={cn("absolute top-1.5 right-1.5 z-20 flex items-center gap-1", className)}
      {...props}
    />
  )
}

function ArtifactAction({
  className,
  size = "icon-xs",
  variant = "ghost",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      data-slot="artifact-action"
      size={size}
      variant={variant}
      className={cn("bg-card/80", className)}
      {...props}
    />
  )
}

function ArtifactOpenMark({ className, ...props }: React.ComponentProps<"span">) {
  const { status } = React.useContext(ArtifactContext)

  return (
    <span
      data-slot="artifact-open-mark"
      aria-hidden
      className={cn(
        "absolute right-2.5 bottom-2.5 flex size-3.5 items-center justify-center text-muted-foreground/55",
        status === "error" && "text-destructive/65",
        className
      )}
      {...props}
    >
      {status === "error" ? <UnavailableIcon /> : <OpenIcon />}
    </span>
  )
}

function ArtifactKindMark({ kind }: { kind: ArtifactKind }) {
  const Glyph = KIND_ICON[kind]

  return (
    <div className="flex flex-col items-center gap-1 text-muted-foreground">
      <Glyph />
      <span className="mono text-[8px] font-medium tracking-[0.08em] uppercase">
        {KIND_LABEL[kind]}
      </span>
    </div>
  )
}

const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-6",
}

const KIND_LABEL: Record<ArtifactKind, string> = {
  file: "File",
  app: "App",
  document: "Doc",
  presentation: "Slides",
  spreadsheet: "Sheet",
  image: "Image",
  code: "Code",
  archive: "Archive",
}

const KIND_ICON: Record<ArtifactKind, () => React.JSX.Element> = {
  file: () => (
    <svg {...stroke}><path d="M6 3.5h8l4 4V20.5H6z" /><path d="M14 3.5v4h4" /></svg>
  ),
  app: () => (
    <svg {...stroke}><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M3.5 8h17" /><path d="M7 6h.01M10 6h.01" /></svg>
  ),
  document: () => (
    <svg {...stroke}><path d="M6 3.5h8l4 4V20.5H6z" /><path d="M14 3.5v4h4M9 12h6M9 15h6M9 18h4" /></svg>
  ),
  presentation: () => (
    <svg {...stroke}><rect x="3.5" y="4" width="17" height="13" rx="2" /><path d="M8 20l4-3 4 3M8 8h8M8 11h5" /></svg>
  ),
  spreadsheet: () => (
    <svg {...stroke}><rect x="4" y="3.5" width="16" height="17" rx="2" /><path d="M4 9h16M4 14.5h16M10 9v11.5" /></svg>
  ),
  image: () => (
    <svg {...stroke}><rect x="3.5" y="4" width="17" height="16" rx="2" /><circle cx="9" cy="9.5" r="1.5" /><path d="m4.5 17 4.5-4.5 3.5 3 2.5-2 4.5 3.5" /></svg>
  ),
  code: () => (
    <svg {...stroke}><path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M14 4l-4 16" /></svg>
  ),
  archive: () => (
    <svg {...stroke}><path d="M5 7h14v13H5zM4 3.5h16V7H4zM10 11h4" /></svg>
  ),
}

function OpenIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M7 17 17 7M9 7h8v8" /></svg>
}

function UnavailableIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><circle cx="12" cy="12" r="8" /><path d="m9 9 6 6M15 9l-6 6" /></svg>
}

export {
  Artifacts,
  Artifact,
  ArtifactPreview,
  ArtifactContent,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactMeta,
  ArtifactActions,
  ArtifactAction,
  ArtifactOpenMark,
}
