import { describe, expect, it } from 'vitest'
import { createDemoPhotos, SANTA_CRUZ_ANCHOR } from '../data/demo'
import type { ColorSample } from '../types'
import {
  aggregateMemorySignal,
  analyzePixelSamples,
  classifySceneRatios,
} from './analysis'

describe('local image signal analysis', () => {
  it('extracts aggregate color warmth and brightness from demo photos', () => {
    const signal = aggregateMemorySignal(createDemoPhotos(), SANTA_CRUZ_ANCHOR)

    expect(signal.photoCount).toBe(4)
    expect(signal.confidence).toBe('Verified')
    expect(signal.palette.length).toBeGreaterThan(4)
    expect(signal.warmth).toBeGreaterThan(0.45)
    expect(signal.brightness).toBeGreaterThan(0.35)
  })

  it('detects sky water and sand heuristic signals', () => {
    const samples: ColorSample[] = [
      { r: 118, g: 190, b: 226, y: 0.1 },
      { r: 78, g: 152, b: 178, y: 0.58 },
      { r: 230, g: 190, b: 116, y: 0.82 },
      { r: 238, g: 204, b: 142, y: 0.88 },
    ]
    const ratios = classifySceneRatios(samples)

    expect(ratios.skyRatio).toBeGreaterThan(0)
    expect(ratios.waterRatio).toBeGreaterThan(0)
    expect(ratios.sandRatio).toBeGreaterThan(0)
  })

  it('returns a usable palette from sampled pixels', () => {
    const analysis = analyzePixelSamples([
      { r: 244, g: 134, b: 87 },
      { r: 49, g: 143, b: 168 },
      { r: 247, g: 209, b: 132 },
    ])

    expect(analysis.status).toBe('ready')
    expect(analysis.palette.length).toBeGreaterThanOrEqual(3)
    expect(analysis.dominantColor).toMatch(/^#/)
  })
})
