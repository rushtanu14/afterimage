export type ConfidenceState = 'Verified' | 'Partial' | 'Manual'

export type ProviderName = 'Mapillary' | 'Panoramax' | 'KartaView' | 'Manual'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface ColorSample {
  r: number
  g: number
  b: number
  x?: number
  y?: number
}

export interface PhotoAnalysis {
  palette: string[]
  dominantColor: string
  brightness: number
  warmth: number
  skyRatio: number
  waterRatio: number
  sandRatio: number
  status: 'ready' | 'unsupported' | 'failed'
  message?: string
}

export interface MemoryPhoto {
  id: string
  fileName: string
  file?: File
  previewUrl: string
  gps?: GeoPoint
  takenAt?: string
  width?: number
  height?: number
  metadataSource: 'exif' | 'demo-sidecar' | 'manual' | 'none'
  analysis: PhotoAnalysis
}

export interface MemorySignal {
  palette: string[]
  dominantColor: string
  warmth: number
  brightness: number
  skyRatio: number
  waterRatio: number
  sandRatio: number
  confidence: ConfidenceState
  confidenceScore: number
  confidenceReasons: string[]
  timeSpan?: {
    start: string
    end: string
  }
  photoCount: number
  gpsMatches: number
  sharpness: number
  haze: number
  artRecipe: ArtRecipe
}

export interface ArtRecipe {
  skyTone: string
  waterTone: string
  sandTone: string
  horizonGlow: string
  silhouetteDensity: number
  brushSoftness: number
  haze: number
}

export interface PlaceAnchor {
  name: string
  coordinates: GeoPoint
  provider: ProviderName
  confidence: ConfidenceState
  attribution: string
}

export interface ProviderResult {
  provider: ProviderName
  imageUrl?: string
  attribution: string
  confidence: ConfidenceState
  coordinates: GeoPoint
  available: boolean
}

export interface ProviderAdapter {
  name: ProviderName
  searchPlace: (anchor: PlaceAnchor) => Promise<ProviderResult | null>
}

export interface BrushPoint {
  x: number
  y: number
  pressure: number
}

export interface BrushStroke {
  id: string
  points: BrushPoint[]
  color: string
  opacity: number
  width: number
  sourceSignal: Pick<
    MemorySignal,
    'dominantColor' | 'warmth' | 'brightness' | 'confidence'
  >
  composed: boolean
}

export interface SceneState {
  anchor: PlaceAnchor
  signal: MemorySignal
  providerResult?: ProviderResult
  strokes: BrushStroke[]
  autoComposed: boolean
  parallax: {
    x: number
    y: number
  }
}
