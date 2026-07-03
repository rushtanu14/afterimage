import { describe, expect, it } from 'vitest'
import { SANTA_CRUZ_ANCHOR } from '../data/demo'
import type { ProviderAdapter } from '../types'
import { findProviderResult } from './providers'

describe('provider fallback', () => {
  it('falls through unavailable open sources to manual base', async () => {
    const result = await findProviderResult(
      SANTA_CRUZ_ANCHOR,
      [
        { name: 'Mapillary', searchPlace: async () => null },
        { name: 'Panoramax', searchPlace: async () => null },
      ] as ProviderAdapter[],
      20,
    )

    expect(result.provider).toBe('Manual')
    expect(result.available).toBe(true)
  })

  it('uses the first available provider before fallback', async () => {
    const result = await findProviderResult(
      SANTA_CRUZ_ANCHOR,
      [
        { name: 'Mapillary', searchPlace: async () => null },
        {
          name: 'Panoramax',
          searchPlace: async (anchor) => ({
            provider: 'Panoramax',
            attribution: 'test open source',
            confidence: 'Partial',
            coordinates: anchor.coordinates,
            available: true,
          }),
        },
      ] as ProviderAdapter[],
      20,
    )

    expect(result.provider).toBe('Panoramax')
    expect(result.attribution).toBe('test open source')
  })

  it('times out slow providers and still returns manual', async () => {
    const slow: ProviderAdapter = {
      name: 'KartaView',
      searchPlace: () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({
              provider: 'KartaView',
              attribution: 'late',
              confidence: 'Partial',
              coordinates: SANTA_CRUZ_ANCHOR.coordinates,
              available: true,
            })
          }, 40),
        ),
    }

    const result = await findProviderResult(SANTA_CRUZ_ANCHOR, [slow], 5)

    expect(result.provider).toBe('Manual')
  })
})
