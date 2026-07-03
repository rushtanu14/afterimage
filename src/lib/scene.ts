import type {
  BrushPoint,
  BrushStroke,
  MemorySignal,
  PlaceAnchor,
  SceneState,
} from '../types'
import { clamp, mixHex } from './color'

export const createEmptySignal = (): MemorySignal => {
  const signalBase = {
    palette: ['#f18f5f', '#60b0c6', '#f8d78a', '#283f57'],
    dominantColor: '#f18f5f',
    warmth: 0.68,
    brightness: 0.62,
    skyRatio: 0.28,
    waterRatio: 0.22,
    sandRatio: 0.2,
    confidence: 'Manual' as const,
    confidenceScore: 0.18,
    confidenceReasons: ['Load a folder to extract place and color signals'],
    photoCount: 0,
    gpsMatches: 0,
    sharpness: 0.5,
    haze: 0.46,
  }

  return {
    ...signalBase,
    artRecipe: {
      skyTone: '#7db9ce',
      waterTone: '#2f8fa4',
      sandTone: '#e7bc74',
      horizonGlow: '#ffd166',
      silhouetteDensity: 0.2,
      brushSoftness: 0.74,
      haze: 0.46,
    },
  }
}

export const createInitialScene = (anchor: PlaceAnchor): SceneState => ({
  anchor,
  signal: createEmptySignal(),
  strokes: [],
  autoComposed: false,
  parallax: { x: 0, y: 0 },
})

export const createBrushStroke = (
  points: BrushPoint[],
  signal: MemorySignal,
  sequence: number,
): BrushStroke => {
  const paletteColor = signal.palette[sequence % Math.max(signal.palette.length, 1)]
  const glow = mixHex(signal.dominantColor, paletteColor ?? signal.dominantColor, 0.46)

  return {
    id: `stroke-${Date.now()}-${sequence}`,
    points,
    color: glow,
    opacity: clamp(0.08 + signal.brightness * 0.08, 0.08, 0.18),
    width: 18 + signal.artRecipe.brushSoftness * 22,
    sourceSignal: {
      dominantColor: signal.dominantColor,
      warmth: signal.warmth,
      brightness: signal.brightness,
      confidence: signal.confidence,
    },
    composed: false,
  }
}

export const addBrushStroke = (
  strokes: BrushStroke[],
  stroke: BrushStroke,
  cap = 34,
) => {
  const next = [...strokes, stroke]

  return next.length > cap ? next.slice(next.length - cap) : next
}

export const undoStroke = (strokes: BrushStroke[]) => strokes.slice(0, -1)

export const resetStrokes = () => [] as BrushStroke[]

const simplifyPoints = (points: BrushPoint[], target = 18) => {
  if (points.length <= target) {
    return points
  }

  const stride = Math.ceil(points.length / target)
  return points.filter((_, index) => index % stride === 0).slice(0, target)
}

const mergePoints = (a: BrushPoint[], b: BrushPoint[]): BrushPoint[] => {
  const points = [...a, ...b]
  if (points.length === 0) {
    return []
  }

  return simplifyPoints(points, 22).map((point, index, simplified) => {
    const previous = simplified[index - 1] ?? point
    return {
      x: (point.x + previous.x) / 2,
      y: (point.y + previous.y) / 2,
      pressure: clamp((point.pressure + previous.pressure) / 2, 0.35, 1),
    }
  })
}

export const autoComposeStrokes = (
  strokes: BrushStroke[],
  signal: MemorySignal,
): BrushStroke[] => {
  if (strokes.length <= 1) {
    return strokes.map((stroke) => ({
      ...stroke,
      composed: true,
      opacity: clamp(stroke.opacity * 0.82, 0.05, 0.14),
      width: stroke.width * 1.18,
    }))
  }

  const composed: BrushStroke[] = []

  for (let index = 0; index < strokes.length; index += 2) {
    const first = strokes[index]
    const second = strokes[index + 1]
    const mergedPoints = second
      ? mergePoints(first.points, second.points)
      : simplifyPoints(first.points)

    composed.push({
      ...first,
      id: `composed-${first.id}`,
      points: mergedPoints,
      color: mixHex(first.color, signal.artRecipe.horizonGlow, 0.22),
      opacity: clamp((first.opacity + (second?.opacity ?? first.opacity)) * 0.48, 0.045, 0.12),
      width: Math.max(first.width, second?.width ?? first.width) * 1.28,
      composed: true,
    })
  }

  const horizonStroke: BrushStroke = {
    id: `composed-horizon-${Date.now()}`,
    points: [
      { x: 0.18, y: 0.48, pressure: 0.7 },
      { x: 0.36, y: 0.45, pressure: 0.72 },
      { x: 0.64, y: 0.46, pressure: 0.7 },
      { x: 0.84, y: 0.49, pressure: 0.62 },
    ],
    color: signal.artRecipe.horizonGlow,
    opacity: 0.075,
    width: 56,
    sourceSignal: {
      dominantColor: signal.dominantColor,
      warmth: signal.warmth,
      brightness: signal.brightness,
      confidence: signal.confidence,
    },
    composed: true,
  }

  return [...composed.slice(0, Math.max(1, Math.ceil(strokes.length / 2))), horizonStroke]
}

export const updateParallax = (
  current: SceneState['parallax'],
  dx: number,
  dy: number,
) => ({
  x: clamp(current.x + dx * 0.0028, -1, 1),
  y: clamp(current.y + dy * 0.0022, -1, 1),
})
