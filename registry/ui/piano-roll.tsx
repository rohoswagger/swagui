import * as React from "react"

import { cn } from "@/lib/utils"

const VIEW_WIDTH = 1000
const VIEW_HEIGHT = 320
const MEASURE_LINES = 8
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

function noteName(midi: number) {
  const octave = Math.floor(midi / 12) - 1
  return `${NOTE_NAMES[pitchClass(midi)]}${octave}`
}

interface PianoRollNote {
  midi: number
  beat: number
  duration: number
  velocity: number
  hand?: "left" | "right"
}

interface PianoRollProps {
  notes?: PianoRollNote[]
  currentBeat?: number
  beats?: number
  startMidi?: number
  endMidi?: number
  playing?: boolean
  className?: string
}

function PianoRoll({
  notes = [],
  currentBeat = 0,
  beats = 32,
  startMidi = 48,
  endMidi = 84,
  playing = false,
  className,
}: PianoRollProps) {
  startMidi = Number.isInteger(startMidi) && startMidi >= 0 && startMidi <= 127 ? startMidi : 48
  endMidi = Number.isInteger(endMidi) && endMidi >= startMidi && endMidi <= 127 ? endMidi : Math.max(startMidi, 84)
  beats = Number.isFinite(beats) && beats > 0 ? Math.min(beats, 4096) : 32
  currentBeat = Number.isFinite(currentBeat) ? Math.max(0, Math.min(beats, currentBeat)) : 0
  notes = notes.slice(0, 4096).filter((note) => Number.isInteger(note.midi) && Number.isFinite(note.beat) && note.beat >= 0 && note.beat < beats && Number.isFinite(note.duration) && note.duration > 0 && Number.isFinite(note.velocity))
  const visibleNotes = notes.filter((note) => note.midi >= startMidi && note.midi <= endMidi)
  const pitchRange = Math.max(1, endMidi - startMidi)
  const rowHeight = VIEW_HEIGHT / (pitchRange + 1)
  const beatWidth = VIEW_WIDTH / Math.max(1, beats)
  const yForMidi = (midi: number) =>
    ((endMidi - midi) / (pitchRange + 1)) * VIEW_HEIGHT

  const totalDuration = notes.reduce(
    (total, note) => Math.max(total, note.beat + note.duration),
    0
  )

  const pitchLabels = React.useMemo(() => {
    const labels: number[] = []
    for (let midi = startMidi; midi <= endMidi; midi++) {
      if (pitchClass(midi) === 0) labels.push(midi)
    }
    return labels
  }, [startMidi, endMidi])
  const beatLabels = React.useMemo(
    () => Array.from({ length: MEASURE_LINES }, (_, index) => (beats / MEASURE_LINES) * index),
    [beats]
  )

  const title = `Piano roll: ${notes.length} note${notes.length === 1 ? "" : "s"}, ${totalDuration.toFixed(2)} beats`

  return (
    <div
      data-slot="piano-roll"
      className={cn("relative h-64 w-full", className)}
      data-playing={playing || undefined}
    >
      <div
        aria-hidden
        data-slot="piano-roll-beat-labels"
        className="pointer-events-none absolute top-0 right-0 left-6 h-5 text-[10px] leading-none font-medium text-muted-foreground tabular-nums"
      >
        {beatLabels.map((beatAtLine, index) => (
          <span
            key={beatAtLine}
            data-slot="piano-roll-beat-label"
            className="absolute top-1"
            style={{
              left: `${(beatAtLine / beats) * 100}%`,
              transform: index === 0 ? "none" : "translateX(-50%)",
            }}
          >
            {Math.round(beatAtLine)}
          </span>
        ))}
      </div>
      <div
        aria-hidden
        data-slot="piano-roll-pitch-labels"
        className="pointer-events-none absolute top-5 bottom-0 left-0 w-6 text-[11px] leading-none font-medium text-muted-foreground tabular-nums"
      >
        {pitchLabels.map((midi) => (
          <span
            key={midi}
            data-slot="piano-roll-pitch-label"
            className="absolute right-1 -translate-y-1/2"
            style={{
              top: `${((yForMidi(midi) + rowHeight * 0.5) / VIEW_HEIGHT) * 100}%`,
            }}
          >
            {noteName(midi)}
          </span>
        ))}
      </div>
      <div className="box-border h-full pl-6 pt-5">
        <svg
          role="img"
          aria-label={title}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <title>{title}</title>
          {Array.from({ length: MEASURE_LINES + 1 }, (_, index) => {
            const beatAtLine = (beats / MEASURE_LINES) * index
            const x = beatAtLine * beatWidth
            return (
              <line
                key={index}
                x1={x}
                y1={0}
                x2={x}
                y2={VIEW_HEIGHT}
                stroke="var(--border)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}

          {visibleNotes.length === 0 ? (
            <text
              x={VIEW_WIDTH / 2}
              y={VIEW_HEIGHT / 2}
              textAnchor="middle"
              fontSize={13}
              fill="var(--muted-foreground)"
            >
              {notes.length ? "No notes in this range" : "No notes yet"}
            </text>
          ) : (
            visibleNotes.map((note, index) => {
              const x = note.beat * beatWidth
              const y = yForMidi(note.midi) + rowHeight * 0.22
              const width = Math.max(2, Math.min(note.duration, beats - note.beat) * beatWidth - 1)
              const height = rowHeight * 0.56
              const active =
                playing && currentBeat >= note.beat && currentBeat < note.beat + note.duration
              const isLeftHand = note.hand === "left"

              return (
                <rect
                  key={index}
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={height / 2}
                  fill={
                    active
                      ? "var(--brand)"
                      : isLeftHand
                        ? "var(--brand-content)"
                        : "var(--foreground)"
                  }
                  opacity={active ? 1 : Math.max(0.55, Math.min(0.85, note.velocity))}
                />
              )
            })
          )}
          {beats > 0 ? (
            <line
              x1={currentBeat * beatWidth}
              y1={0}
              x2={currentBeat * beatWidth}
              y2={VIEW_HEIGHT}
              stroke="var(--brand)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>
      </div>
    </div>
  )
}

export { PianoRoll }
export type { PianoRollNote }
