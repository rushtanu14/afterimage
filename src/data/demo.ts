import type { MemoryPhoto, PlaceAnchor } from '../types'
import { demoAnalysisFromPalette } from '../lib/analysis'

export const SANTA_CRUZ_ANCHOR: PlaceAnchor = {
  name: 'Santa Cruz Beach Boardwalk / Main Beach',
  coordinates: {
    lat: 36.9641,
    lng: -122.0244,
  },
  provider: 'Manual',
  confidence: 'Verified',
  attribution:
    'Santa Cruz demo anchor. Procedural 2.5D base; provider adapter slots are inactive in this build.',
}

export const demoPhotoDescriptors = [
  {
    id: 'demo-boardwalk-gold',
    fileName: '01-boardwalk-gold.png',
    previewUrl: '/demo/santa-cruz-demo-photos/01-boardwalk-gold.png',
    gps: { lat: 36.9643, lng: -122.0239 },
    takenAt: '2026-07-01T02:36:00.000Z',
    palette: ['#f5a05d', '#ffd27d', '#34586c', '#60aac0', '#211f2f'],
    ratios: { skyRatio: 0.31, waterRatio: 0.18, sandRatio: 0.22 },
  },
  {
    id: 'demo-main-beach-blue',
    fileName: '02-main-beach-blue.png',
    previewUrl: '/demo/santa-cruz-demo-photos/02-main-beach-blue.png',
    gps: { lat: 36.9637, lng: -122.0251 },
    takenAt: '2026-07-01T02:42:00.000Z',
    palette: ['#4fa2bd', '#88cfd7', '#f4c978', '#f47f62', '#22324b'],
    ratios: { skyRatio: 0.36, waterRatio: 0.29, sandRatio: 0.18 },
  },
  {
    id: 'demo-silhouette-haze',
    fileName: '03-silhouette-haze.png',
    previewUrl: '/demo/santa-cruz-demo-photos/03-silhouette-haze.png',
    gps: { lat: 36.9639, lng: -122.0247 },
    takenAt: '2026-07-01T02:55:00.000Z',
    palette: ['#ffbe73', '#e76f62', '#536c84', '#2a3349', '#f7e2aa'],
    ratios: { skyRatio: 0.28, waterRatio: 0.24, sandRatio: 0.2 },
  },
  {
    id: 'demo-neon-waterline',
    fileName: '04-neon-waterline.png',
    previewUrl: '/demo/santa-cruz-demo-photos/04-neon-waterline.png',
    gps: { lat: 36.9646, lng: -122.0236 },
    takenAt: '2026-07-01T03:04:00.000Z',
    palette: ['#f28a53', '#26a6a0', '#264f70', '#ffd875', '#181b2f'],
    ratios: { skyRatio: 0.24, waterRatio: 0.32, sandRatio: 0.16 },
  },
]

export const createDemoPhotos = (): MemoryPhoto[] =>
  demoPhotoDescriptors.map((descriptor) => ({
    id: descriptor.id,
    fileName: descriptor.fileName,
    previewUrl: descriptor.previewUrl,
    gps: descriptor.gps,
    takenAt: descriptor.takenAt,
    width: 900,
    height: 620,
    metadataSource: 'demo-sidecar',
    analysis: demoAnalysisFromPalette(descriptor.palette, descriptor.ratios),
  }))
