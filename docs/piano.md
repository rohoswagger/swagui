# Piano components

`PianoKeyboard` and `PianoRoll` are audio-agnostic. Neither component imports
an audio API, a MIDI library, or a global keyboard listener — they only
report intent (`onNoteOn` / `onNoteOff`) or visualise state the parent
already owns (`activeNotes`, `currentBeat`). Sound, MIDI wiring, and any
document-level key bindings are the integrating app's responsibility.

## Install

```bash
bunx shadcn add https://swagui.rohoswagger.com/r/piano-keyboard.json
bunx shadcn add https://swagui.rohoswagger.com/r/piano-roll.json
```

Both are also included in the `all` bundle:

```bash
bunx shadcn add https://swagui.rohoswagger.com/r/all.json
```

## PianoKeyboard

A controlled keyboard: it never plays sound and never tracks "is this note
currently sounding" itself. `activeNotes` is the single source of truth for
which keys are lit — including keys pressed by the user, if the parent
chooses to echo them back in.

```tsx
import { useState } from "react"
import { PianoKeyboard } from "@/components/ui/piano-keyboard"

function Synth() {
  const [activeNotes, setActiveNotes] = useState<number[]>([])

  const playNote = (midi: number) => {
    // e.g. synth.triggerAttack(midiToFrequency(midi))
    setActiveNotes((notes) => [...notes, midi])
  }

  const stopNote = (midi: number) => {
    // e.g. synth.triggerRelease(midiToFrequency(midi))
    setActiveNotes((notes) => notes.filter((n) => n !== midi))
  }

  return (
    <PianoKeyboard
      startMidi={48} // C3
      endMidi={84} // C6
      activeNotes={activeNotes}
      onNoteOn={playNote}
      onNoteOff={stopNote}
    />
  )
}
```

### Audio responsibility

`onNoteOn(midi)` / `onNoteOff(midi)` fire once per physical press/release —
never repeatedly while held. Feed `midi` straight into whatever produces
sound (Web Audio oscillator, sampler, MIDI-out message); the component makes
no assumption about tuning, timbre, or transport.

### Keyboard accessibility

Every key is a native `<button>` with `aria-label` set to the note name
(e.g. `"C#4"`) and `aria-pressed` mirroring `activeNotes`. Tab moves focus
key to key; **Enter** or **Space** presses and holds the focused key exactly
like a pointer would — `onNoteOn` fires on key down (ignoring OS key-repeat),
`onNoteOff` fires on key up. Notes never get stuck: releases are also forced
on blur, on window blur (alt-tab, devtools), when `disabled` becomes `true`,
and on unmount, independently of whatever `activeNotes` is doing.

Multiple simultaneous touches are safe — each key captures its own pointer
via `setPointerCapture`, so two fingers on two different keys never cross
signals, and a cancelled/lost pointer always resolves to a release.

### Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `startMidi` | `number` | `48` (C3) | |
| `endMidi` | `number` | `84` (C6) | Inclusive. |
| `activeNotes` | `number[]` | — | Controls the lit/pressed visual state. |
| `onNoteOn` | `(midi: number) => void` | — | Fires once per press. |
| `onNoteOff` | `(midi: number) => void` | — | Fires once per release, including forced releases. |
| `showLabels` | `boolean` | `true` | Note name printed on white keys. |
| `keyHints` | `Record<number, string>` | — | Small badge per MIDI note, e.g. a computer-keyboard mapping (`{ 60: "A" }`). |
| `className` | `string` | — | Applied to the outer scroll container. |
| `disabled` | `boolean` | `false` | Also force-releases any held notes. |

The keyboard renders at a fixed 190px height with an inner track at least
720px wide (22 white keys × 40px at the default range); the outer wrapper
scrolls horizontally rather than shrinking keys on narrow viewports.

## PianoRoll

A horizontal score — time runs left to right, pitch runs top (high) to
bottom (low), the opposite of a "falling notes" game view. It is a pure,
controlled SVG: pass `currentBeat` from your own transport/animation loop
and the playhead moves; there is no internal clock or motion dependency.

```tsx
import { PianoRoll } from "@/components/ui/piano-roll"

const notes = [
  { midi: 60, beat: 0, duration: 1, velocity: 0.9, hand: "right" as const },
  { midi: 48, beat: 0, duration: 2, velocity: 0.6, hand: "left" as const },
  { midi: 64, beat: 1, duration: 0.5, velocity: 0.8, hand: "right" as const },
]

function Roll({ currentBeat }: { currentBeat: number }) {
  return (
    <PianoRoll
      notes={notes}
      currentBeat={currentBeat}
      beats={32}
      startMidi={48}
      endMidi={84}
      playing={currentBeat > 0}
    />
  )
}
```

Right-hand notes render in warm cream, left-hand notes in muted ochre; the
note currently under the playhead brightens to the brand colour. With no
notes, the roll shows a plain "No notes yet" state instead of a loading
skeleton. The `<svg>` carries `role="img"` and a `<title>` summarising the
real note count and total duration for screen readers, and uses
`preserveAspectRatio="none"` over an internal `viewBox` so it stretches to
its container instead of letterboxing.

### Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `notes` | `{ midi, beat, duration, velocity, hand? }[]` | `[]` | `hand` is `"left" \| "right"`, optional. |
| `currentBeat` | `number` | `0` | Drives the playhead; animate it from the parent. |
| `beats` | `number` | `32` | Width of the visible score, in beats. |
| `startMidi` | `number` | `48` (C3) | |
| `endMidi` | `number` | `84` (C6) | |
| `playing` | `boolean` | `false` | Exposed as `data-playing` for styling hooks. |
| `className` | `string` | — | Applied to the outer wrapper. |

## Sizing and input bounds

The keyboard fills its container with proportional key positions. The default three-octave range has a 720px minimum width and scrolls in narrower containers. Keys stay 190px tall. Short ranges may be narrower. MIDI bounds must be integers in 0–127. Invalid keyboard ranges render no keys; invalid roll ranges fall back to a bounded range. The roll displays at most 4096 finite note events and clamps the playhead to its duration.

A visual-only preview is available at `/piano`. Audio remains the consuming application's responsibility.
