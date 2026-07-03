import type {
  PlaceAnchor,
  ProviderAdapter,
  ProviderName,
  ProviderResult,
} from '../types'

const openStreetAttribution =
  'Procedural Santa Cruz base. Open street-image sources supported where coverage exists.'

export const manualProvider: ProviderAdapter = {
  name: 'Manual',
  searchPlace: async (anchor) => ({
    provider: 'Manual',
    attribution: openStreetAttribution,
    confidence: 'Manual',
    coordinates: anchor.coordinates,
    available: true,
  }),
}

export const mapillaryProvider: ProviderAdapter = {
  name: 'Mapillary',
  searchPlace: async () => null,
}

export const panoramaxProvider: ProviderAdapter = {
  name: 'Panoramax',
  searchPlace: async () => null,
}

export const kartaViewProvider: ProviderAdapter = {
  name: 'KartaView',
  searchPlace: async () => null,
}

export const providerAdapters: ProviderAdapter[] = [
  mapillaryProvider,
  panoramaxProvider,
  kartaViewProvider,
  manualProvider,
]

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<null>((resolve) => {
    timeout = setTimeout(() => resolve(null), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

export const findProviderResult = async (
  anchor: PlaceAnchor,
  adapters: ProviderAdapter[] = providerAdapters,
  timeoutMs = 900,
): Promise<ProviderResult> => {
  for (const adapter of adapters) {
    const result = await withTimeout(adapter.searchPlace(anchor), timeoutMs)

    if (result?.available) {
      return result
    }
  }

  const fallback = await manualProvider.searchPlace(anchor)
  return fallback as ProviderResult
}

export const providerCopy = (provider: ProviderName) => {
  if (provider === 'Manual') {
    return 'Manual procedural base is active for the Santa Cruz demo.'
  }

  return `${provider} is supported where open street-image coverage exists.`
}
