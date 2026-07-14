import * as exifr from 'exifr'
import type {
  ColorSample,
  MemoryPhoto,
  MemorySignal,
  PhotoAnalysis,
  PlaceAnchor,
} from '../types'
import {
  averageHex,
  clamp,
  hexToRgb,
  luminance,
  mixHex,
  quantizePalette,
  warmthScore,
} from './color'
import { calculateMetadataConfidence } from './confidence'

export const EMPTY_ANALYSIS: PhotoAnalysis = {
  palette: ['#f3a35c', '#5aa9bd', '#ffe3a3'],
  dominantColor: '#f3a35c',
  brightness: 0.64,
  warmth: 0.72,
  skyRatio: 0.28,
  waterRatio: 0.26,
  sandRatio: 0.24,
  status: 'ready',
}

export const MAX_MEMORY_PHOTOS = 64
export const MAX_MEMORY_FILE_BYTES = 25 * 1024 * 1024
export const MAX_MEMORY_TOTAL_BYTES = 256 * 1024 * 1024
const MEMORY_ANALYSIS_BATCH_SIZE = 4
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])
const SUPPORTED_IMAGE_EXTENSION = /\.(png|jpe?g|webp|heic|heif)$/i

export const isHeicLike = (file: File) =>
  file.type.includes('heic') ||
  file.type.includes('heif') ||
  /\.(heic|heif)$/i.test(file.name)

export const selectMemoryImageFiles = (files: File[]) => {
  const images = files.filter(
    (file) =>
      SUPPORTED_IMAGE_TYPES.has(file.type.toLowerCase()) ||
      SUPPORTED_IMAGE_EXTENSION.test(file.name),
  )

  if (images.length === 0) {
    throw new Error('No supported photos found. Choose JPEG, PNG, WebP, HEIC, or HEIF files.')
  }

  if (images.length > MAX_MEMORY_PHOTOS) {
    throw new Error(`Choose up to ${MAX_MEMORY_PHOTOS} photos at a time.`)
  }

  if (images.some((file) => file.size > MAX_MEMORY_FILE_BYTES)) {
    throw new Error('Each photo must be 25 MB or smaller.')
  }

  const totalBytes = images.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes > MAX_MEMORY_TOTAL_BYTES) {
    throw new Error('Selected photos must total 256 MB or less.')
  }

  return images
}

export const revokeMemoryPreviewUrls = (photos: MemoryPhoto[]) => {
  for (const photo of photos) {
    if (photo.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photo.previewUrl)
    }
  }
}

export const classifySceneRatios = (samples: ColorSample[]) => {
  if (samples.length === 0) {
    return {
      skyRatio: 0,
      waterRatio: 0,
      sandRatio: 0,
    }
  }

  const counts = samples.reduce(
    (acc, sample) => {
      const topBias = sample.y === undefined ? 1 : sample.y < 0.45 ? 1.2 : 0.75
      const blueLean = sample.b - sample.r
      const tealLean = sample.g + sample.b - sample.r * 1.45
      const bright = luminance(sample)
      const warm = warmthScore(sample)

      return {
        sky:
          acc.sky +
          (sample.b > 130 && sample.g > 100 && blueLean > 18 && bright > 0.42
            ? topBias
            : 0),
        water:
          acc.water +
          (tealLean > 185 && sample.b > 90 && bright > 0.2 && bright < 0.82
            ? 1
            : 0),
        sand:
          acc.sand +
          (warm > 0.56 && bright > 0.42 && sample.r > sample.b * 0.95 ? 1 : 0),
      }
    },
    { sky: 0, water: 0, sand: 0 },
  )

  return {
    skyRatio: clamp(counts.sky / samples.length),
    waterRatio: clamp(counts.water / samples.length),
    sandRatio: clamp(counts.sand / samples.length),
  }
}

export const analyzePixelSamples = (samples: ColorSample[]): PhotoAnalysis => {
  if (samples.length === 0) {
    return EMPTY_ANALYSIS
  }

  const brightness =
    samples.reduce((sum, sample) => sum + luminance(sample), 0) / samples.length
  const warmth =
    samples.reduce((sum, sample) => sum + warmthScore(sample), 0) /
    samples.length
  const ratios = classifySceneRatios(samples)
  const palette = quantizePalette(samples, 6)

  return {
    palette,
    dominantColor: palette[0] ?? averageHex(palette),
    brightness: clamp(brightness),
    warmth: clamp(warmth),
    ...ratios,
    status: 'ready',
  }
}

export const deriveArtRecipe = (
  signal: Pick<
    MemorySignal,
    | 'palette'
    | 'dominantColor'
    | 'warmth'
    | 'brightness'
    | 'waterRatio'
    | 'sandRatio'
    | 'confidence'
    | 'haze'
    | 'photoCount'
  >,
) => {
  const base = signal.dominantColor || '#f3a35c'
  const blueBias = signal.palette.find((color) => {
    const rgb = hexToRgb(color)
    return rgb.b > rgb.r && rgb.g > 80
  })
  const warmBias = signal.palette.find((color) => {
    const rgb = hexToRgb(color)
    return rgb.r > rgb.b && rgb.g > 70
  })
  const confidenceHaze =
    signal.confidence === 'Verified' ? signal.haze : clamp(signal.haze + 0.14)

  return {
    skyTone: mixHex(blueBias ?? '#7db9ce', warmBias ?? base, signal.warmth * 0.34),
    waterTone: mixHex(blueBias ?? '#2f8fa4', '#26495c', signal.waterRatio * 0.24),
    sandTone: mixHex(warmBias ?? '#e7bc74', '#fff0b7', signal.sandRatio * 0.22),
    horizonGlow: mixHex('#ffd166', warmBias ?? base, signal.brightness * 0.32),
    silhouetteDensity: clamp(0.18 + signal.photoCount * 0.035, 0.18, 0.52),
    brushSoftness: clamp(0.45 + confidenceHaze * 0.4, 0.4, 0.92),
    haze: confidenceHaze,
  }
}

export const aggregateMemorySignal = (
  photos: MemoryPhoto[],
  anchor: PlaceAnchor,
): MemorySignal => {
  const ready = photos.filter((photo) => photo.analysis.status === 'ready')
  const analyses = ready.map((photo) => photo.analysis)
  const hasAnalysis = analyses.length > 0
  const photoCount = photos.length
  const palette = analyses
    .flatMap((analysis) => analysis.palette)
    .slice(0, 18)
  const confidence = calculateMetadataConfidence(photos, anchor)
  const timestamps = photos
    .map((photo) => photo.takenAt)
    .filter((value): value is string => Boolean(value))
    .sort()
  const brightness =
    analyses.reduce((sum, analysis) => sum + analysis.brightness, 0) /
    Math.max(analyses.length, 1)
  const warmth =
    analyses.reduce((sum, analysis) => sum + analysis.warmth, 0) /
    Math.max(analyses.length, 1)
  const skyRatio =
    analyses.reduce((sum, analysis) => sum + analysis.skyRatio, 0) /
    Math.max(analyses.length, 1)
  const waterRatio =
    analyses.reduce((sum, analysis) => sum + analysis.waterRatio, 0) /
    Math.max(analyses.length, 1)
  const sandRatio =
    analyses.reduce((sum, analysis) => sum + analysis.sandRatio, 0) /
    Math.max(analyses.length, 1)
  const signalBase = {
    palette: palette.length > 0 ? palette : EMPTY_ANALYSIS.palette,
    dominantColor:
      analyses[0]?.dominantColor ?? averageHex(palette.length ? palette : EMPTY_ANALYSIS.palette),
    warmth: clamp(hasAnalysis ? warmth : EMPTY_ANALYSIS.warmth),
    brightness: clamp(hasAnalysis ? brightness : EMPTY_ANALYSIS.brightness),
    skyRatio: clamp(hasAnalysis ? skyRatio : EMPTY_ANALYSIS.skyRatio),
    waterRatio: clamp(hasAnalysis ? waterRatio : EMPTY_ANALYSIS.waterRatio),
    sandRatio: clamp(hasAnalysis ? sandRatio : EMPTY_ANALYSIS.sandRatio),
    confidence: confidence.state,
    confidenceScore: confidence.score,
    confidenceReasons: confidence.reasons,
    photoCount,
    gpsMatches: confidence.gpsMatches,
    sharpness: confidence.state === 'Verified' ? 0.92 : confidence.state === 'Partial' ? 0.72 : 0.52,
    haze: confidence.state === 'Verified' ? 0.18 : confidence.state === 'Partial' ? 0.34 : 0.48,
  }

  return {
    ...signalBase,
    timeSpan:
      timestamps.length > 0
        ? {
            start: timestamps[0],
            end: timestamps[timestamps.length - 1],
          }
        : undefined,
    artRecipe: deriveArtRecipe(signalBase),
  }
}

const getImageDimensions = async (url: string) =>
  new Promise<{ width: number; height: number; samples: ColorSample[] }>(
    (resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        const width = Math.max(1, image.naturalWidth)
        const height = Math.max(1, image.naturalHeight)
        const canvas = document.createElement('canvas')
        const sampleWidth = 48
        const sampleHeight = 36
        canvas.width = sampleWidth
        canvas.height = sampleHeight
        const context = canvas.getContext('2d', { willReadFrequently: true })

        if (!context) {
          reject(new Error('Canvas analysis unavailable'))
          return
        }

        context.drawImage(image, 0, 0, sampleWidth, sampleHeight)
        const data = context.getImageData(0, 0, sampleWidth, sampleHeight).data
        const samples: ColorSample[] = []

        for (let y = 0; y < sampleHeight; y += 2) {
          for (let x = 0; x < sampleWidth; x += 2) {
            const index = (y * sampleWidth + x) * 4
            samples.push({
              r: data[index],
              g: data[index + 1],
              b: data[index + 2],
              x: x / sampleWidth,
              y: y / sampleHeight,
            })
          }
        }

        resolve({ width, height, samples })
      }
      image.onerror = () => reject(new Error('Image could not be decoded'))
      image.src = url
    },
  )

const parseExif = async (file: File) => {
  try {
    const data = (await exifr.parse(file, {
      gps: true,
      tiff: true,
      exif: true,
    })) as
      | {
          latitude?: number
          longitude?: number
          DateTimeOriginal?: Date
          CreateDate?: Date
          ModifyDate?: Date
        }
      | undefined

    const gps =
      typeof data?.latitude === 'number' && typeof data.longitude === 'number'
        ? { lat: data.latitude, lng: data.longitude }
        : undefined
    const date =
      data?.DateTimeOriginal ?? data?.CreateDate ?? data?.ModifyDate ?? undefined

    return {
      gps,
      takenAt: date ? date.toISOString() : undefined,
    }
  } catch {
    return {
      gps: undefined,
      takenAt: undefined,
    }
  }
}

export const analyzeMemoryFile = async (
  file: File,
  id: string,
): Promise<MemoryPhoto> => {
  const previewUrl = URL.createObjectURL(file)
  const exif = await parseExif(file)

  if (isHeicLike(file)) {
    return {
      id,
      file,
      fileName: file.name,
      previewUrl,
      gps: exif.gps,
      takenAt: exif.takenAt,
      metadataSource: exif.gps || exif.takenAt ? 'exif' : 'none',
      analysis: {
        ...EMPTY_ANALYSIS,
        status: 'unsupported',
        message: 'HEIC is best-effort. Convert to JPEG or PNG for full analysis.',
      },
    }
  }

  try {
    const image = await getImageDimensions(previewUrl)
    return {
      id,
      file,
      fileName: file.name,
      previewUrl,
      gps: exif.gps,
      takenAt: exif.takenAt,
      width: image.width,
      height: image.height,
      metadataSource: exif.gps || exif.takenAt ? 'exif' : 'none',
      analysis: analyzePixelSamples(image.samples),
    }
  } catch (error) {
    return {
      id,
      file,
      fileName: file.name,
      previewUrl,
      gps: exif.gps,
      takenAt: exif.takenAt,
      metadataSource: exif.gps || exif.takenAt ? 'exif' : 'none',
      analysis: {
        ...EMPTY_ANALYSIS,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Analysis failed',
      },
    }
  }
}

export const scanMemoryFiles = async (
  files: File[],
  anchor: PlaceAnchor,
) => {
  const images = selectMemoryImageFiles(files)
  let photos: MemoryPhoto[] = []

  for (let start = 0; start < images.length; start += MEMORY_ANALYSIS_BATCH_SIZE) {
    const batch = images.slice(start, start + MEMORY_ANALYSIS_BATCH_SIZE)
    const analyzed = await Promise.all(
      batch.map((file, index) =>
        analyzeMemoryFile(file, `upload-${start + index}-${file.name}`),
      ),
    )
    photos = [...photos, ...analyzed]
  }

  return {
    photos,
    signal: aggregateMemorySignal(photos, anchor),
  }
}

export const demoAnalysisFromPalette = (
  palette: string[],
  ratios: Pick<PhotoAnalysis, 'skyRatio' | 'waterRatio' | 'sandRatio'>,
): PhotoAnalysis => {
  const samples = palette.map(hexToRgb)
  const brightness =
    samples.reduce((sum, sample) => sum + luminance(sample), 0) /
    Math.max(samples.length, 1)
  const warmth =
    samples.reduce((sum, sample) => sum + warmthScore(sample), 0) /
    Math.max(samples.length, 1)

  return {
    palette,
    dominantColor: palette[0] ?? '#f3a35c',
    brightness: clamp(brightness),
    warmth: clamp(warmth),
    ...ratios,
    status: 'ready',
  }
}
