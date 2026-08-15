"use client"

import * as React from "react"
import {
  ArrowRight as LArrowRight,
  Check as LCheck,
  ChevronDown as LChevronDown,
  Copy as LCopy,
  ChevronRight as LChevronRight,
  Loader2 as LLoader,
  Plus as LPlus,
  Search as LSearch,
  Settings as LSettings,
  Trash2 as LTrash,
  TriangleAlert as LWarning,
  User as LUser,
} from "lucide-react"
import {
  ArrowRight as PArrowRight,
  CaretDown as PCaretDown,
  CaretRight as PCaretRight,
  Check as PCheck,
  CircleNotch as PCircleNotch,
  Copy as PCopy,
  Gear as PGear,
  MagnifyingGlass as PMagnifyingGlass,
  Plus as PPlus,
  Trash as PTrash,
  User as PUser,
  Warning as PWarning,
} from "@phosphor-icons/react"

export type IconLib = "lucide" | "phosphor"
/** One shared weight scale so the two libraries are directly comparable. */
export type IconWeight = "thin" | "light" | "regular"

const LUCIDE_STROKE: Record<IconWeight, number> = {
  thin: 1.25,
  light: 1.5,
  regular: 2,
}

const IconCtx = React.createContext<{ lib: IconLib; weight: IconWeight }>({
  lib: "lucide",
  weight: "light",
})

export const IconProvider = IconCtx.Provider

type IconProps = { className?: string; style?: React.CSSProperties }

/**
 * Sizing stays on className (Tailwind `size-*`) for both libraries — CSS
 * width/height beats Phosphor's width/height attributes, so it just works.
 */
function make(
  Lucide: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>,
  Phosphor: React.ComponentType<{ className?: string; weight?: IconWeight; style?: React.CSSProperties }>,
) {
  return function Icon({ className, style }: IconProps) {
    const { lib, weight } = React.useContext(IconCtx)
    return lib === "phosphor" ? (
      <Phosphor className={className} weight={weight} style={style} />
    ) : (
      <Lucide className={className} strokeWidth={LUCIDE_STROKE[weight]} style={style} />
    )
  }
}

export const ArrowRight = make(LArrowRight, PArrowRight)
export const Check = make(LCheck, PCheck)
export const Copy = make(LCopy, PCopy)
export const ChevronDown = make(LChevronDown, PCaretDown)
export const ChevronRight = make(LChevronRight, PCaretRight)
export const Plus = make(LPlus, PPlus)
export const Search = make(LSearch, PMagnifyingGlass)
export const Settings = make(LSettings, PGear)
export const Trash = make(LTrash, PTrash)
export const User = make(LUser, PUser)
export const Warning = make(LWarning, PWarning)
export const Spinner = make(LLoader, PCircleNotch)
