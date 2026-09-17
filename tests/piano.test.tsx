import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { PianoKeyboard } from '../registry/ui/piano-keyboard'
import { PianoRoll } from '../registry/ui/piano-roll'

describe('piano component contracts', () => {
  test('three octaves expose every chromatic note with accessible active state', () => {
    const html = renderToStaticMarkup(<PianoKeyboard activeNotes={[60]} />)
    expect((html.match(/data-slot="piano-key"/g) ?? []).length).toBe(37)
    expect((html.match(/data-key="white"/g) ?? []).length).toBe(22)
    expect((html.match(/data-key="black"/g) ?? []).length).toBe(15)
    expect(html).toContain('aria-label="C4" aria-pressed="true"')
    expect(html).toContain('aria-label="C#4"')
    expect(html).toContain('aria-label="C6"')
  })
  test('invalid and unbounded MIDI ranges render without looping', () => {
    for (const [start, end] of [[48, Infinity], [-1, 80], [60.5, 72], [84, 48]]) {
      const html = renderToStaticMarkup(<PianoKeyboard startMidi={start} endMidi={end} />)
      expect(html).not.toContain('data-slot="piano-key"')
    }
  })
  test('a boundary sharp remains inside its keyboard', () => {
    const html = renderToStaticMarkup(<PianoKeyboard startMidi={61} endMidi={63} disabled />)
    expect((html.match(/data-slot="piano-key"/g) ?? []).length).toBe(3)
    expect(html).not.toContain('left:-')
    expect(html).toContain('disabled=""')
  })
  test('piano roll names real notes and duration, excludes off-range pitches', () => {
    const html = renderToStaticMarkup(<PianoRoll notes={[{midi:60,beat:0,duration:2,velocity:0.8},{midi:20,beat:2,duration:1,velocity:0.5}]} />)
    expect(html).toContain('Piano roll: 2 notes, 3.00 beats')
    expect((html.match(/<rect /g) ?? []).length).toBe(1)
    expect(html).toContain('role="img"')
  })
  test('paused notes use regular coloring, playback highlights the active note', () => {
    const notes = [{midi:60,beat:0,duration:2,velocity:0.8}]
    const paused = renderToStaticMarkup(<PianoRoll notes={notes} currentBeat={1} />)
    const playing = renderToStaticMarkup(<PianoRoll notes={notes} currentBeat={1} playing />)
    expect(paused).toContain('fill="var(--foreground)"')
    expect(playing).toContain('fill="var(--brand)"')
  })
})


describe('piano registry integrity', () => {
  for (const name of ['piano-keyboard', 'piano-roll']) {
    test(`${name} installs the exact reviewed source`, () => {
      const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
      const published = JSON.parse(readFileSync(resolve(root, `public/r/${name}.json`), 'utf8'))
      const source = readFileSync(resolve(root, `registry/ui/${name}.tsx`), 'utf8')
      expect(published.files[0].content.trim()).toBe(source.trim())
    })
  }
  test('out-of-range notes give an explicit range empty state', () => {
    const html = renderToStaticMarkup(<PianoRoll notes={[{midi:20,beat:0,duration:1,velocity:0.7}]} />)
    expect(html).toContain('No notes in this range')
  })
  test('invalid roll bounds stay finite', () => {
    const html = renderToStaticMarkup(<PianoRoll startMidi={-Infinity} endMidi={Infinity} currentBeat={NaN} beats={Infinity} />)
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('Infinity')
    expect(html).toContain('No notes yet')
  })
})
