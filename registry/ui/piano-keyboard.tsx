"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const WHITE_KEY_WIDTH = 40
const WHITE_KEY_HEIGHT = 190
const BLACK_KEY_WIDTH = WHITE_KEY_WIDTH * 0.58
const BLACK_KEY_HEIGHT = WHITE_KEY_HEIGHT * 0.62

const WHITE_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11])
const BLACK_OFFSET_IN_OCTAVE: Record<number, number> = {
  1: 0.9,
  3: 2.1,
  6: 3.85,
  8: 5,
  10: 6.15,
}
const WHITE_INDEX_IN_OCTAVE: Record<number, number> = {
  0: 0,
  2: 1,
  4: 2,
  5: 3,
  7: 4,
  9: 5,
  11: 6,
}
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
]

function pitchClass(midi: number) {
  return ((midi % 12) + 12) % 12
}

function isWhiteKey(midi: number) {
  return WHITE_PITCH_CLASSES.has(pitchClass(midi))
}

function noteName(midi: number) {
  const octave = Math.floor(midi / 12) - 1
  return `${NOTE_NAMES[pitchClass(midi)]}${octave}`
}
function keyPositionUnits(midi: number) {
  const octave = Math.floor(midi / 12)
  const pc = pitchClass(midi)
  const octaveStart = octave * 7
  return isWhiteKey(midi)
    ? octaveStart + WHITE_INDEX_IN_OCTAVE[pc]
    : octaveStart + BLACK_OFFSET_IN_OCTAVE[pc]
}

interface PianoKey {
  midi: number
  white: boolean
  left: number
  width: number
}

function layoutKeys(startMidi: number, endMidi: number): PianoKey[] {
  if (!Number.isInteger(startMidi) || !Number.isInteger(endMidi) || startMidi < 0 || endMidi > 127 || endMidi < startMidi) return []

  const origin = keyPositionUnits(startMidi)
  const raw = []
  for (let midi = startMidi; midi <= endMidi; midi++) {
    const white = isWhiteKey(midi)
    const width = white ? WHITE_KEY_WIDTH : BLACK_KEY_WIDTH
    const centered = (keyPositionUnits(midi) - origin) * WHITE_KEY_WIDTH
    const left = white ? centered : centered - width / 2
    raw.push({ midi, white, left, width })
  }
  const minLeft = Math.min(0, ...raw.map((key) => key.left))
  return raw.map((key) => ({ ...key, left: key.left - minLeft }))
}

interface PianoKeyboardProps {
  startMidi?: number
  endMidi?: number
  activeNotes?: number[]
  onNoteOn?: (midi: number) => void
  onNoteOff?: (midi: number) => void
  showLabels?: boolean
  keyHints?: Record<number, string>
  className?: string
  disabled?: boolean
}

function PianoKeyboard({
  startMidi = 48,
  endMidi = 84,
  activeNotes,
  onNoteOn,
  onNoteOff,
  showLabels = true,
  keyHints,
  className,
  disabled = false,
}: PianoKeyboardProps) {
  const keys = React.useMemo(
    () => layoutKeys(startMidi, endMidi),
    [startMidi, endMidi]
  )
  const containerWidth = React.useMemo(
    () => Math.max(WHITE_KEY_WIDTH, ...keys.map((key) => key.left + key.width)),
    [keys]
  )
  const activeSet = React.useMemo(
    () => new Set(activeNotes ?? []),
    [activeNotes]
  )
  const onNoteOnRef = React.useRef(onNoteOn)
  const onNoteOffRef = React.useRef(onNoteOff)
  React.useEffect(() => {
    onNoteOnRef.current = onNoteOn
  }, [onNoteOn])
  React.useEffect(() => {
    onNoteOffRef.current = onNoteOff
  }, [onNoteOff])

  const pressedRef = React.useRef<Set<number>>(new Set())

  const press = React.useCallback((midi: number) => {
    if (pressedRef.current.has(midi)) return
    pressedRef.current.add(midi)
    onNoteOnRef.current?.(midi)
  }, [])

  const release = React.useCallback((midi: number) => {
    if (!pressedRef.current.delete(midi)) return
    onNoteOffRef.current?.(midi)
  }, [])

  const releaseAll = React.useCallback(() => {
    pressedRef.current.forEach((midi) => onNoteOffRef.current?.(midi))
    pressedRef.current.clear()
  }, [])
  React.useEffect(() => {
    window.addEventListener("blur", releaseAll)
    return () => {
      window.removeEventListener("blur", releaseAll)
      releaseAll()
    }
  }, [releaseAll])

  React.useEffect(() => {
    if (disabled) releaseAll()
  }, [disabled, releaseAll])

  return (
    <div
      role="group"
      aria-label="Piano keyboard"
      data-slot="piano-keyboard"
      className={cn("w-full overflow-x-auto", className)}
    >
      <div
        className="relative pb-1"
        style={{ width: "100%", height: WHITE_KEY_HEIGHT, minWidth: Math.min(720, containerWidth) }}
      >
        {keys
          .filter((key) => key.white)
          .map((key) => (
            <PianoKeyButton
              key={key.midi}
              keyLayout={key}
              containerWidth={containerWidth}
              active={activeSet.has(key.midi)}
              disabled={disabled}
              label={showLabels ? noteName(key.midi) : undefined}
              hint={keyHints?.[key.midi]}
              onPress={press}
              onRelease={release}
            />
          ))}
        {keys
          .filter((key) => !key.white)
          .map((key) => (
            <PianoKeyButton
              key={key.midi}
              keyLayout={key}
              containerWidth={containerWidth}
              active={activeSet.has(key.midi)}
              disabled={disabled}
              label={undefined}
              hint={keyHints?.[key.midi]}
              onPress={press}
              onRelease={release}
            />
          ))}
      </div>
    </div>
  )
}

interface PianoKeyButtonProps {
  keyLayout: PianoKey
  containerWidth: number
  active: boolean
  disabled: boolean
  label?: string
  hint?: string
  onPress: (midi: number) => void
  onRelease: (midi: number) => void
}

function PianoKeyButton({
  keyLayout,
  containerWidth,
  active,
  disabled,
  label,
  hint,
  onPress,
  onRelease,
}: PianoKeyButtonProps) {
  const { midi, white, left, width } = keyLayout

  const pointers = React.useRef(new Set<number>())
  const keyboardHeld = React.useRef(false)
  const clearHeld = React.useCallback(() => {
    const wasHeld = pointers.current.size > 0 || keyboardHeld.current
    pointers.current.clear()
    keyboardHeld.current = false
    if (wasHeld) onRelease(midi)
  }, [midi, onRelease])
  React.useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") clearHeld()
    }
    window.addEventListener("blur", clearHeld)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("blur", clearHeld)
      document.removeEventListener("visibilitychange", onVisibility)
      clearHeld()
    }
  }, [clearHeld])
  React.useEffect(() => {
    if (disabled) clearHeld()
  }, [disabled, clearHeld])
  const releaseIfIdle = () => {
    if (!pointers.current.size && !keyboardHeld.current) onRelease(midi)
  }
  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.add(event.pointerId)
    onPress(midi)
  }
  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    pointers.current.delete(event.pointerId)
    releaseIfIdle()
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || event.repeat) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      keyboardHeld.current = true
      onPress(midi)
    }
  }
  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      keyboardHeld.current = false
      releaseIfIdle()
    }
  }
  const handleBlur = () => {
    keyboardHeld.current = false
    releaseIfIdle()
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={noteName(midi)}
      aria-pressed={active}
      data-slot="piano-key"
      data-key={white ? "white" : "black"}
      data-active={active || undefined}
      style={{
        position: "absolute",
        left: `${left / containerWidth * 100}%`,
        width: `${width / containerWidth * 100}%`,
        height: white ? WHITE_KEY_HEIGHT : BLACK_KEY_HEIGHT,
        top: 0,
        zIndex: white ? 0 : 10,
      }}
      className={cn(
        "motion-reduce:transition-none motion-reduce:transform-none flex touch-none flex-col items-center justify-end gap-1 pb-2 text-[11px] font-medium select-none",
        "transition-[transform,filter,background-color,box-shadow] duration-(--duration-press) ease-(--ease-swagui)",
        "focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-40",
        white
          ? cn(
              "rounded-b-lg border border-neutral-300/80 bg-gradient-to-b from-white to-neutral-100 text-neutral-600 shadow-[inset_0_-8px_10px_-8px_rgba(0,0,0,0.15)]",
              "hover:brightness-95 active:translate-y-0.5",
              active &&
                "translate-y-0.5 border-brand-content/40 bg-gradient-to-b from-white to-brand/50 text-neutral-800 shadow-[inset_0_-8px_12px_-6px_var(--brand-content)]"
            )
          : cn(
              "rounded-b-md border border-black/80 bg-gradient-to-b from-neutral-700 to-neutral-950 text-neutral-300 shadow-[0_3px_4px_rgba(0,0,0,0.4),inset_0_-6px_8px_-6px_rgba(0,0,0,0.6)]",
              "hover:brightness-110 active:translate-y-0.5",
              active &&
                "translate-y-0.5 border-brand-content/60 bg-gradient-to-b from-brand/40 to-brand-content/60 text-white shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_-6px_10px_-6px_var(--brand-content)]"
            )
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
    >
      {hint ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-2 text-[11px] font-semibold tracking-wide",
            white ? "text-neutral-600" : "text-neutral-300"
          )}
        >
          {hint}
        </span>
      ) : null}
      {label ? <span aria-hidden>{label}</span> : null}
    </button>
  )
}

export { PianoKeyboard }
