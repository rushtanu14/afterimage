import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const width = 900
const height = 620
const outDir = join(process.cwd(), 'public/demo/santa-cruz-demo-photos')

const photos = [
  {
    name: '01-boardwalk-gold.png',
    sky: [245, 160, 93],
    water: [96, 170, 192],
    sand: [255, 210, 125],
    accent: [33, 31, 47],
  },
  {
    name: '02-main-beach-blue.png',
    sky: [136, 207, 215],
    water: [79, 162, 189],
    sand: [244, 201, 120],
    accent: [244, 127, 98],
  },
  {
    name: '03-silhouette-haze.png',
    sky: [255, 190, 115],
    water: [83, 108, 132],
    sand: [247, 226, 170],
    accent: [42, 51, 73],
  },
  {
    name: '04-neon-waterline.png',
    sky: [242, 138, 83],
    water: [38, 166, 160],
    sand: [255, 216, 117],
    accent: [24, 27, 47],
  },
]

const crcTable = new Uint32Array(256).map((_, index) => {
  let c = index
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return c >>> 0
})

const crc32 = (buffer) => {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, checksum])
}

const mix = (a, b, t) => a.map((channel, index) => Math.round(channel + (b[index] - channel) * t))

const makePng = (photo, photoIndex) => {
  const rows = []

  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4)
    row[0] = 0
    for (let x = 0; x < width; x += 1) {
      const nx = x / width
      const ny = y / height
      const wave = Math.sin(nx * Math.PI * 8 + photoIndex) * 0.5 + 0.5
      let color

      if (ny < 0.5) {
        color = mix(photo.sky, photo.accent, ny * 0.28)
      } else if (ny < 0.72) {
        color = mix(photo.water, photo.sky, wave * 0.12)
      } else {
        color = mix(photo.sand, photo.accent, (ny - 0.72) * 0.22)
      }

      const sun = Math.hypot(nx - 0.62, ny - 0.38)
      if (sun < 0.18) {
        color = mix(color, [255, 224, 140], (0.18 - sun) * 2.8)
      }

      if (ny > 0.58 && ny < 0.62 && x % 76 < 38) {
        color = mix(color, photo.accent, 0.46)
      }

      const idx = 1 + x * 4
      row[idx] = color[0]
      row[idx + 1] = color[1]
      row[idx + 2] = color[2]
      row[idx + 3] = 255
    }
    rows.push(row)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

photos.forEach((photo, index) => {
  writeFileSync(join(outDir, photo.name), makePng(photo, index))
})

console.log(`Generated ${photos.length} Santa Cruz demo PNGs`)
