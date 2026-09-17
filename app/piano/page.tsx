"use client"

import * as React from "react"
import Link from "next/link"
import { PianoKeyboard } from "@/registry/ui/piano-keyboard"
import { PianoRoll } from "@/registry/ui/piano-roll"
import { Button } from "@/registry/ui/button"

const notes = Array.from({ length: 16 }, (_, i) => ({
  midi: [60, 64, 67, 72, 71, 67, 64, 62][i % 8],
  beat: i * 0.5,
  duration: 0.4,
  velocity: 0.7,
  hand: "right" as const,
}))

export default function PianoPreview() {
  const [active, setActive] = React.useState<number[]>([])
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <Button asChild variant="ghost" className="self-start"><Link href="/">Back to swagui</Link></Button>
      <header>
        <h1 className="text-3xl font-medium tracking-tight">Piano instruments</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">A controlled keyboard and a score driven by note data. This preview demonstrates key interactions without audio. Connect note callbacks to your own sound engine.</p>
      </header>
      <PianoRoll notes={notes} beats={8} currentBeat={2} startMidi={48} endMidi={84} className="h-64" />
      <PianoKeyboard activeNotes={active} onNoteOn={(midi) => setActive((keys) => [...new Set([...keys, midi])])} onNoteOff={(midi) => setActive((keys) => keys.filter((key) => key !== midi))} />
      <p className="text-sm text-muted-foreground">Press a key with a pointer, or focus a key and hold Enter or Space. The consuming application owns audio, computer-key mappings and playback.</p>
    </main>
  )
}
