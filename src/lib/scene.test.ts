import { describe, expect, it } from 'vitest'
import { SANTA_CRUZ_ANCHOR } from '../data/demo'
import type { BrushStroke } from '../types'
import {
  addBrushStroke,
  autoComposeStrokes,
  createBrushStroke,
  createEmptySignal,
  createInitialScene,
  resetStrokes,
  undoStroke,
  updateParallax,
} from './scene'

const signal = createEmptySignal()

const stroke = (index: number): BrushStroke =>
  createBrushStroke(
    [
      { x: 0.1 + index * 0.01, y: 0.2, pressure: 0.6 },
      { x: 0.2 + index * 0.01, y: 0.3, pressure: 0.7 },
      { x: 0.3 + index * 0.01, y: 0.34, pressure: 0.8 },
    ],
    signal,
    index,
  )

describe('scene brush behavior', () => {
  it('adds strokes and caps buildup', () => {
    const strokes = Array.from({ length: 5 }, (_, index) => stroke(index)).reduce(
      (current, next) => addBrushStroke(current, next, 3),
      [] as BrushStroke[],
    )

    expect(strokes).toHaveLength(3)
    expect(strokes[0].id).toContain('stroke')
  })

  it('undoes and resets brush strokes without mutation', () => {
    const strokes = [stroke(1), stroke(2)]

    expect(undoStroke(strokes)).toHaveLength(1)
    expect(strokes).toHaveLength(2)
    expect(resetStrokes()).toEqual([])
  })

  it('auto-compose preserves the scene while reducing messy strokes', () => {
    const messy = Array.from({ length: 8 }, (_, index) => stroke(index))
    const composed = autoComposeStrokes(messy, signal)

    expect(composed.length).toBeLessThan(messy.length)
    expect(composed.length).toBeGreaterThan(0)
    expect(composed.every((item) => item.composed)).toBe(true)
  })

  it('updates parallax within spatial bounds', () => {
    const scene = createInitialScene(SANTA_CRUZ_ANCHOR)
    const parallax = updateParallax(scene.parallax, 10_000, -10_000)

    expect(parallax.x).toBe(1)
    expect(parallax.y).toBe(-1)
  })
})
