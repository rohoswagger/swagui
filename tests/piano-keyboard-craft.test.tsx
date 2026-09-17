import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { PianoKeyboard } from '../registry/ui/piano-keyboard'
import { PianoRoll } from '../registry/ui/piano-roll'
import { Progress } from '../registry/ui/progress'

describe('piano keyboard craft contract', () => {
  test('keys render in chromatic MIDI order for chronological tabbing', () => {
    const html = renderToStaticMarkup(<PianoKeyboard startMidi={60} endMidi={64} />)
    const labels = [...html.matchAll(/aria-label="([^"]+)"/g)].map((match) => match[1])

    expect(labels.join(',')).toBe('Piano keyboard,C4,C#4,D4,D#4,E4')
  })

  test('letter hints stay opt-in while note labels and focus affordance remain visible', () => {
    const html = renderToStaticMarkup(<PianoKeyboard startMidi={60} endMidi={61} />)

    expect(html).not.toContain('absolute top-2')
    expect(html).toContain('focus-visible:ring-inset')
    expect(html).toContain('focus-visible:ring-neutral-800')
    expect(html).toContain('focus-visible:ring-brand')
    expect(html).toContain('motion-reduce:transform-none')
    expect(html).toContain('>C4</span>')
  })

  test('progress root exposes determinate value to assistive technology', () => {
    const html = renderToStaticMarkup(<Progress value={42} />)

    expect(html).toContain('aria-valuenow="42"')
  })

  test('piano roll keeps labels in fixed-size HTML outside the scaled SVG', () => {
    const html = renderToStaticMarkup(<PianoRoll />)
    const svgStart = html.indexOf('<svg')
    const firstBeatLabel = html.indexOf('data-slot="piano-roll-beat-label"')
    const firstPitchLabel = html.indexOf('data-slot="piano-roll-pitch-label"')

    expect(firstBeatLabel > -1).toBe(true)
    expect(firstPitchLabel > -1).toBe(true)
    expect(firstBeatLabel < svgStart).toBe(true)
    expect(firstPitchLabel < svgStart).toBe(true)
    expect(html).not.toContain('<text x="32')
    expect((html.match(/data-slot="piano-roll-beat-label"/g) ?? []).length).toBe(8)
    expect(html).toContain('role="img"')
    expect(html).toContain('Piano roll: 0 notes, 0.00 beats')
  })

  test('published registry sources match the reviewed components', () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

    for (const name of ['piano-keyboard', 'piano-roll', 'progress']) {
      const published = JSON.parse(readFileSync(resolve(root, `public/r/${name}.json`), 'utf8'))
      const source = readFileSync(resolve(root, `registry/ui/${name}.tsx`), 'utf8')

      expect(published.files[0].content.trim()).toBe(source.trim())
    }
  })
})
