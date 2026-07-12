import { describe, expect, it, vi } from 'vitest'
import { createDemoPhotos, SANTA_CRUZ_ANCHOR } from '../data/demo'
import type { ColorSample } from '../types'
import {
  aggregateMemorySignal,
  analyzePixelSamples,
  classifySceneRatios,
  MAX_MEMORY_FILE_BYTES,
  MAX_MEMORY_PHOTOS,
  MAX_MEMORY_TOTAL_BYTES,
  revokeMemoryPreviewUrls,
  selectMemoryImageFiles,
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

  it('preserves legitimate zero-valued image signals', () => {
    const [demoPhoto] = createDemoPhotos()
    const signal = aggregateMemorySignal(
      [
        {
          ...demoPhoto,
          analysis: {
            ...demoPhoto.analysis,
            brightness: 0,
            warmth: 0,
            skyRatio: 0,
            waterRatio: 0,
            sandRatio: 0,
          },
        },
      ],
      SANTA_CRUZ_ANCHOR,
    )

    expect(signal).toMatchObject({
      brightness: 0,
      warmth: 0,
      skyRatio: 0,
      waterRatio: 0,
      sandRatio: 0,
    })
  })

  it('rejects folders that exceed safe photo count or file size limits', () => {
    const file = (name: string, size = 1) =>
      ({ name, size, type: 'image/jpeg' }) as File

    expect(() =>
      selectMemoryImageFiles(
        Array.from({ length: MAX_MEMORY_PHOTOS + 1 }, (_, index) =>
          file(`photo-${index}.jpg`),
        ),
      ),
    ).toThrow(`up to ${MAX_MEMORY_PHOTOS} photos`)

    expect(() =>
      selectMemoryImageFiles([file('oversized.jpg', MAX_MEMORY_FILE_BYTES + 1)]),
    ).toThrow('25 MB or smaller')

    const aggregateOverflowCount =
      Math.floor(MAX_MEMORY_TOTAL_BYTES / MAX_MEMORY_FILE_BYTES) + 1
    expect(() =>
      selectMemoryImageFiles(
        Array.from({ length: aggregateOverflowCount }, (_, index) =>
          file(`large-${index}.jpg`, MAX_MEMORY_FILE_BYTES),
        ),
      ),
    ).toThrow('total 256 MB or less')
  })

  it('revokes only imported blob preview URLs', () => {
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const [demoPhoto] = createDemoPhotos()

    revokeMemoryPreviewUrls([
      demoPhoto,
      { ...demoPhoto, id: 'upload', previewUrl: 'blob:afterimage-upload' },
    ])

    expect(revokeObjectURL).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:afterimage-upload')
    revokeObjectURL.mockRestore()
  })
})
