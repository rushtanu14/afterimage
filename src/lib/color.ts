import type { ColorSample } from '../types'

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value))

export const rgbToHex = ({ r, g, b }: ColorSample) => {
  const toHex = (channel: number) =>
    Math.round(clamp(channel, 0, 255))
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const hexToRgb = (hex: string): ColorSample => {
  const clean = hex.replace('#', '')
  const parsed =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : clean

  const value = Number.parseInt(parsed || '000000', 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

export const mixHex = (from: string, to: string, amount: number) => {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  const t = clamp(amount)

  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  })
}

export const luminance = ({ r, g, b }: ColorSample) =>
  clamp((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255)

export const warmthScore = ({ r, g, b }: ColorSample) =>
  clamp((r * 1.12 + g * 0.28 - b * 0.9 + 120) / 255)

export const averageHex = (colors: string[]) => {
  if (colors.length === 0) {
    return '#d9916b'
  }

  const total = colors.reduce(
    (sum, color) => {
      const rgb = hexToRgb(color)
      return {
        r: sum.r + rgb.r,
        g: sum.g + rgb.g,
        b: sum.b + rgb.b,
      }
    },
    { r: 0, g: 0, b: 0 },
  )

  return rgbToHex({
    r: total.r / colors.length,
    g: total.g / colors.length,
    b: total.b / colors.length,
  })
}

export const quantizePalette = (samples: ColorSample[], limit = 6) => {
  const buckets = new Map<string, { count: number; color: ColorSample }>()

  for (const sample of samples) {
    const key = [
      Math.round(sample.r / 32),
      Math.round(sample.g / 32),
      Math.round(sample.b / 32),
    ].join(':')
    const current = buckets.get(key)

    buckets.set(key, {
      count: (current?.count ?? 0) + 1,
      color: current?.color ?? sample,
    })
  }

  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((bucket) => rgbToHex(bucket.color))
}
