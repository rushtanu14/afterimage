import type { ConfidenceState, MemoryPhoto, PlaceAnchor } from '../types'

export const distanceMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) => {
  const earthRadius = 6_371_000
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const latA = toRadians(a.lat)
  const latB = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) ** 2

  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export const calculateMetadataConfidence = (
  photos: MemoryPhoto[],
  anchor: PlaceAnchor,
): {
  state: ConfidenceState
  score: number
  reasons: string[]
  gpsMatches: number
} => {
  if (photos.length === 0) {
    return {
      state: 'Manual',
      score: 0.18,
      reasons: ['No photos loaded yet'],
      gpsMatches: 0,
    }
  }

  const gpsPhotos = photos.filter((photo) => photo.gps)
  const timestamped = photos.filter((photo) => photo.takenAt)
  const matchingGps = gpsPhotos.filter(
    (photo) =>
      photo.gps &&
      distanceMeters(photo.gps, anchor.coordinates) <= 1_500,
  )
  const nearGps = gpsPhotos.filter(
    (photo) =>
      photo.gps &&
      distanceMeters(photo.gps, anchor.coordinates) <= 8_000,
  )
  const farGps = gpsPhotos.filter(
    (photo) =>
      photo.gps &&
      distanceMeters(photo.gps, anchor.coordinates) > 25_000,
  )
  const scoreFromGps =
    gpsPhotos.length === 0 ? 0 : matchingGps.length / Math.max(gpsPhotos.length, 1)
  const scoreFromTime = timestamped.length / photos.length
  const score = Math.min(
    0.98,
    Math.max(0.12, scoreFromGps * 0.72 + scoreFromTime * 0.2 + 0.08),
  )

  if (
    gpsPhotos.length > 0 &&
    matchingGps.length / gpsPhotos.length >= 0.75 &&
    timestamped.length / photos.length >= 0.5
  ) {
    return {
      state: 'Verified',
      score,
      reasons: [
        `${matchingGps.length} GPS match${matchingGps.length === 1 ? '' : 'es'} near Santa Cruz`,
        `${timestamped.length} timestamp${timestamped.length === 1 ? '' : 's'} found`,
      ],
      gpsMatches: matchingGps.length,
    }
  }

  if (farGps.length === gpsPhotos.length && gpsPhotos.length > 0) {
    return {
      state: 'Manual',
      score: Math.min(score, 0.38),
      reasons: [
        'Photo GPS does not match the Santa Cruz anchor',
        'Manual confirmation keeps the demo usable without pretending certainty',
      ],
      gpsMatches: 0,
    }
  }

  if (nearGps.length > 0 || timestamped.length > 0 || gpsPhotos.length > 0) {
    return {
      state: 'Partial',
      score: Math.max(score, 0.45),
      reasons: [
        nearGps.length > 0
          ? `${nearGps.length} location hint${nearGps.length === 1 ? '' : 's'} near the coast`
          : 'No exact GPS match',
        timestamped.length > 0
          ? `${timestamped.length} timestamp${timestamped.length === 1 ? '' : 's'} available`
          : 'Missing timestamps',
      ],
      gpsMatches: matchingGps.length,
    }
  }

  return {
    state: 'Manual',
    score: 0.28,
    reasons: [
      'No GPS or timestamp metadata found',
      'Manual confirmation will make the scene hazier and dreamier',
    ],
    gpsMatches: 0,
  }
}
