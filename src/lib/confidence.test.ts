import { describe, expect, it } from 'vitest'
import type { MemoryPhoto, PlaceAnchor } from '../types'
import { EMPTY_ANALYSIS } from './analysis'
import { calculateMetadataConfidence } from './confidence'

const anchor: PlaceAnchor = {
  name: 'Santa Cruz Beach Boardwalk / Main Beach',
  coordinates: { lat: 36.9641, lng: -122.0244 },
  provider: 'Manual',
  confidence: 'Verified',
  attribution: 'test',
}

const photo = (overrides: Partial<MemoryPhoto>): MemoryPhoto => ({
  id: 'photo',
  fileName: 'photo.jpg',
  previewUrl: '/photo.jpg',
  metadataSource: 'exif',
  analysis: EMPTY_ANALYSIS,
  ...overrides,
})

describe('calculateMetadataConfidence', () => {
  it('marks near GPS plus timestamps as verified', () => {
    const result = calculateMetadataConfidence(
      [
        photo({
          id: 'a',
          gps: { lat: 36.9642, lng: -122.0245 },
          takenAt: '2026-07-01T02:00:00.000Z',
        }),
        photo({
          id: 'b',
          gps: { lat: 36.9639, lng: -122.0242 },
          takenAt: '2026-07-01T02:05:00.000Z',
        }),
      ],
      anchor,
    )

    expect(result.state).toBe('Verified')
    expect(result.gpsMatches).toBe(2)
    expect(result.score).toBeGreaterThan(0.8)
  })

  it('marks timestamp-only imports as partial', () => {
    const result = calculateMetadataConfidence(
      [
        photo({
          metadataSource: 'none',
          takenAt: '2026-07-01T02:00:00.000Z',
        }),
      ],
      anchor,
    )

    expect(result.state).toBe('Partial')
    expect(result.reasons.join(' ')).toMatch(/timestamp/i)
  })

  it('keeps missing metadata manual instead of blocking', () => {
    const result = calculateMetadataConfidence([photo({ metadataSource: 'none' })], anchor)

    expect(result.state).toBe('Manual')
    expect(result.score).toBeGreaterThan(0)
  })

  it('requires manual confirmation for mismatched GPS', () => {
    const result = calculateMetadataConfidence(
      [
        photo({
          gps: { lat: 40.7128, lng: -74.006 },
          takenAt: '2026-07-01T02:00:00.000Z',
        }),
      ],
      anchor,
    )

    expect(result.state).toBe('Manual')
    expect(result.gpsMatches).toBe(0)
    expect(result.reasons.join(' ')).toMatch(/does not match/i)
  })
})
