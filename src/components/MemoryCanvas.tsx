import {
  forwardRef,
  type MutableRefObject,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Pause, Play } from 'lucide-react'
import type {
  BrushPoint,
  BrushStroke,
  MemoryPhoto,
  MemorySignal,
  SceneState,
} from '../types'
import { hexToRgb, mixHex } from '../lib/color'
import { createBrushStroke, updateParallax } from '../lib/scene'

interface MemoryCanvasProps {
  scene: SceneState
  photos: MemoryPhoto[]
  readyToPaint: boolean
  motionPaused: boolean
  motionPhaseRef: MutableRefObject<number>
  onStroke: (stroke: BrushStroke) => void
  onParallaxChange: (parallax: SceneState['parallax']) => void
  onMotionPausedChange: (paused: boolean) => void
}

export interface MemoryCanvasHandle {
  downloadPng: (fileName?: string) => Promise<boolean>
}

interface DragState {
  pointerId: number
  lastX: number
  lastY: number
  points: BrushPoint[]
}

const KEYBOARD_STROKE_POINTS: BrushPoint[] = [
  { x: 0.2, y: 0.54, pressure: 0.72 },
  { x: 0.42, y: 0.46, pressure: 0.8 },
  { x: 0.64, y: 0.5, pressure: 0.76 },
  { x: 0.82, y: 0.44, pressure: 0.68 },
]

const drawSmoothStroke = (
  context: CanvasRenderingContext2D,
  stroke: BrushStroke,
  width: number,
  height: number,
) => {
  if (stroke.points.length < 2) {
    return
  }

  context.save()
  context.globalAlpha = stroke.opacity
  context.globalCompositeOperation = stroke.composed ? 'screen' : 'lighter'
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = stroke.color
  context.lineWidth = stroke.width
  context.shadowColor = stroke.color
  context.shadowBlur = stroke.composed ? 28 : 12
  context.beginPath()

  const [first, ...rest] = stroke.points
  context.moveTo(first.x * width, first.y * height)

  for (let index = 0; index < rest.length - 1; index += 1) {
    const current = rest[index]
    const next = rest[index + 1]
    const midX = ((current.x + next.x) / 2) * width
    const midY = ((current.y + next.y) / 2) * height
    context.quadraticCurveTo(current.x * width, current.y * height, midX, midY)
  }

  const last = rest[rest.length - 1]
  if (last) {
    context.lineTo(last.x * width, last.y * height)
  }

  context.stroke()
  context.restore()
}

const makeGradient = (
  context: CanvasRenderingContext2D,
  height: number,
  signal: MemorySignal,
) => {
  const gradient = context.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, mixHex(signal.artRecipe.skyTone, '#203a5c', 0.16))
  gradient.addColorStop(0.36, signal.artRecipe.skyTone)
  gradient.addColorStop(0.56, signal.artRecipe.horizonGlow)
  gradient.addColorStop(1, signal.artRecipe.sandTone)
  return gradient
}

const drawScene = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneState,
  photos: MemoryPhoto[],
  motionPhase = 0,
) => {
  const { signal, parallax } = scene
  const xShift = parallax.x * width
  const yShift = parallax.y * height
  const livingPulse = scene.autoComposed ? Math.sin(motionPhase * 0.9) : 0
  const livingDrift = scene.autoComposed ? Math.cos(motionPhase * 0.7) : 0

  context.clearRect(0, 0, width, height)
  context.fillStyle = makeGradient(context, height, signal)
  context.fillRect(0, 0, width, height)

  const sunX = width * (0.58 + parallax.x * 0.03 + livingDrift * 0.006)
  const sunY = height * (0.39 + parallax.y * 0.02 + livingPulse * 0.008)
  const sunGlow = context.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    width * 0.35,
  )
  sunGlow.addColorStop(0, signal.artRecipe.horizonGlow)
  sunGlow.addColorStop(0.24, `${signal.artRecipe.horizonGlow}88`)
  sunGlow.addColorStop(1, `${signal.artRecipe.horizonGlow}00`)
  context.globalAlpha = 0.8
  context.fillStyle = sunGlow
  context.fillRect(0, 0, width, height)
  context.globalAlpha = 1

  context.save()
  context.translate(xShift * 0.02, yShift * 0.01)
  for (let index = 0; index < 8; index += 1) {
    const y =
      height * (0.18 + index * 0.035) +
      (scene.autoComposed ? Math.sin(motionPhase + index * 0.8) * 2.5 : 0)
    const alpha = 0.08 + index * 0.01
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(width * -0.1, y)
    context.bezierCurveTo(width * 0.24, y - 12, width * 0.7, y + 16, width * 1.1, y)
    context.stroke()
  }
  context.restore()

  const oceanTop = height * 0.5
  const oceanGradient = context.createLinearGradient(0, oceanTop, 0, height * 0.72)
  oceanGradient.addColorStop(0, mixHex(signal.artRecipe.waterTone, '#ffffff', 0.16))
  oceanGradient.addColorStop(1, mixHex(signal.artRecipe.waterTone, '#122f42', 0.36))
  context.fillStyle = oceanGradient
  context.beginPath()
  context.moveTo(0, oceanTop + yShift * 0.018)
  context.bezierCurveTo(
    width * 0.28,
    oceanTop - 16 + yShift * 0.018,
    width * 0.64,
    oceanTop + 20,
    width,
    oceanTop - 4,
  )
  context.lineTo(width, height * 0.72)
  context.lineTo(0, height * 0.74)
  context.closePath()
  context.fill()

  context.save()
  context.translate(xShift * 0.055, 0)
  for (let index = 0; index < 12; index += 1) {
    const y =
      height * (0.52 + index * 0.016) +
      (scene.autoComposed ? Math.sin(motionPhase * 1.5 + index * 0.6) * 2.8 : 0)
    context.strokeStyle = `rgba(255, 255, 255, ${0.13 - index * 0.006})`
    context.lineWidth = Math.max(1, height * 0.003)
    context.beginPath()
    context.moveTo(width * -0.1, y)
    context.bezierCurveTo(width * 0.18, y + 8, width * 0.42, y - 7, width * 0.7, y + 4)
    context.bezierCurveTo(width * 0.82, y + 6, width * 0.96, y - 5, width * 1.1, y + 2)
    context.stroke()
  }
  context.restore()

  const sandTop = height * 0.69
  const sandGradient = context.createLinearGradient(0, sandTop, 0, height)
  sandGradient.addColorStop(0, mixHex(signal.artRecipe.sandTone, '#fff6cf', 0.24))
  sandGradient.addColorStop(1, mixHex(signal.artRecipe.sandTone, '#a56452', 0.22))
  context.fillStyle = sandGradient
  context.beginPath()
  context.moveTo(0, sandTop)
  context.bezierCurveTo(width * 0.24, sandTop - 8, width * 0.62, sandTop + 18, width, sandTop)
  context.lineTo(width, height)
  context.lineTo(0, height)
  context.closePath()
  context.fill()

  context.save()
  context.translate(xShift * -0.06, 0)
  context.globalAlpha = 0.84
  context.fillStyle = 'rgba(34, 31, 44, 0.82)'
  context.fillRect(width * 0.05, height * 0.59, width * 0.9, height * 0.025)
  for (let index = 0; index < 11; index += 1) {
    const x = width * (0.08 + index * 0.084)
    context.fillStyle = 'rgba(36, 31, 44, 0.78)'
    context.fillRect(x, height * 0.585, width * 0.012, height * 0.09)
    context.fillStyle = signal.artRecipe.horizonGlow
    context.beginPath()
    context.arc(x + width * 0.006, height * 0.578, Math.max(2, width * 0.005), 0, Math.PI * 2)
    context.fill()
  }
  context.restore()

  const silhouetteCount = Math.round(5 + signal.artRecipe.silhouetteDensity * 16)
  for (let index = 0; index < silhouetteCount; index += 1) {
    const x = width * (0.12 + ((index * 0.071) % 0.76)) + parallax.x * index * 1.4
    const y = height * (0.64 + (index % 3) * 0.014)
    const scale = 0.8 + (index % 4) * 0.12
    context.fillStyle = 'rgba(24, 25, 34, 0.66)'
    context.beginPath()
    context.arc(x, y - 8 * scale, 3.8 * scale, 0, Math.PI * 2)
    context.fill()
    context.fillRect(x - 2.4 * scale, y - 5 * scale, 4.8 * scale, 16 * scale)
  }

  const echoColors = photos.length
    ? photos.flatMap((photo) => photo.analysis.palette.slice(0, 2))
    : signal.palette
  echoColors.slice(0, 10).forEach((color, index) => {
    const x = width * (0.08 + ((index * 0.111) % 0.84)) + xShift * 0.025
    const y = height * (0.16 + ((index * 0.067) % 0.24))
    const rgb = hexToRgb(color)
    context.save()
    context.translate(x, y)
    context.rotate((index % 2 === 0 ? -1 : 1) * 0.04)
    context.globalAlpha = 0.08 + signal.sharpness * 0.05
    context.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    context.fillRect(-width * 0.05, -height * 0.035, width * 0.1, height * 0.07)
    context.restore()
  })

  scene.strokes.forEach((stroke) => drawSmoothStroke(context, stroke, width, height))

  if (scene.autoComposed) {
    context.save()
    context.globalAlpha = 0.12 + livingPulse * 0.035
    context.globalCompositeOperation = 'soft-light'
    context.fillStyle = mixHex(signal.artRecipe.horizonGlow, signal.dominantColor, 0.32)
    context.fillRect(0, 0, width, height)
    context.restore()

    context.save()
    context.globalAlpha = 0.1 + Math.abs(livingDrift) * 0.06
    context.globalCompositeOperation = 'screen'
    context.fillStyle = signal.artRecipe.horizonGlow
    context.beginPath()
    context.ellipse(
      width * (0.52 + livingDrift * 0.035),
      height * (0.5 + livingPulse * 0.012),
      width * 0.26,
      height * 0.035,
      0,
      0,
      Math.PI * 2,
    )
    context.fill()
    context.restore()
  }

  context.save()
  context.globalAlpha = signal.artRecipe.haze
  context.fillStyle = 'rgba(255, 241, 206, 0.26)'
  context.fillRect(0, 0, width, height)
  context.restore()

  context.save()
  context.globalAlpha = 0.5
  context.fillStyle = 'rgba(8, 19, 30, 0.28)'
  context.fillRect(0, height * 0.94, width, height * 0.06)
  context.restore()
}

const getExhibitTitle = (scene: SceneState) =>
  scene.signal.gpsMatches > 0 ? 'Santa Cruz Afterimage' : 'Manual Afterimage'

const getExhibitLine = (scene: SceneState, photos: MemoryPhoto[]) => {
  if (photos.length === 0) {
    return 'No memory evidence loaded'
  }

  const confidence =
    scene.signal.confidence === 'Verified'
      ? `${scene.signal.gpsMatches} GPS matches`
      : `${scene.signal.confidence.toLowerCase()} anchor`
  const source = scene.signal.timeSpan ? 'timestamps' : 'visual signals'
  return `${photos.length} photos / ${confidence} / ${source} / brush motion`
}

const getMotionDeltaLine = (scene: SceneState) => {
  const strokeCopy = `${scene.strokes.length} brush stroke${scene.strokes.length === 1 ? '' : 's'}`
  return scene.autoComposed
    ? `Motion delta: ${strokeCopy} -> auto-composed field.`
    : `Motion delta: ${strokeCopy} -> live brush phase.`
}

const drawExportPlaque = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneState,
  photos: MemoryPhoto[],
) => {
  if (!scene.autoComposed || photos.length === 0) {
    return
  }

  const padding = Math.max(18, width * 0.022)
  const plaqueWidth = Math.min(width - padding * 2, 520)
  const plaqueHeight = 148
  const x = padding
  const y = height - plaqueHeight - padding

  context.save()
  context.fillStyle = 'rgba(16, 24, 34, 0.68)'
  context.strokeStyle = 'rgba(255, 253, 248, 0.24)'
  context.lineWidth = 1
  context.beginPath()
  context.roundRect(x, y, plaqueWidth, plaqueHeight, 14)
  context.fill()
  context.stroke()

  context.fillStyle = '#fffdf8'
  context.font = '700 22px Inter, system-ui, sans-serif'
  context.fillText(getExhibitTitle(scene), x + 18, y + 35)
  context.fillStyle = 'rgba(255, 253, 248, 0.78)'
  context.font = '500 13px Inter, system-ui, sans-serif'
  context.fillText(getExhibitLine(scene, photos), x + 18, y + 62)
  context.fillStyle = 'rgba(255, 253, 248, 0.72)'
  context.font = '600 12px Inter, system-ui, sans-serif'
  context.fillText('Code turns GPS, color, time, and brush motion into the artwork.', x + 18, y + 86)
  context.fillStyle = 'rgba(255, 253, 248, 0.62)'
  context.font = '500 11px Inter, system-ui, sans-serif'
  context.fillText(getMotionDeltaLine(scene), x + 18, y + 108)
  context.fillText('EXIF/GPS + color ratios + motion delta -> evolving Canvas.', x + 18, y + 128)
  context.restore()
}

const getBrushBadge = (
  scene: SceneState,
  photos: MemoryPhoto[],
  readyToPaint: boolean,
) => {
  if (photos.length === 0) {
    return 'Load photos first'
  }

  if (!readyToPaint) {
    return 'Confirm place anchor'
  }

  if (scene.autoComposed) {
    return 'Composed memory-space'
  }

  return scene.strokes.length > 0 ? 'Residue recording' : 'Memory Brush ready'
}

const getSceneProof = (
  scene: SceneState,
  photos: MemoryPhoto[],
  readyToPaint: boolean,
) => {
  if (photos.length === 0) {
    return 'Awaiting folder / procedural base'
  }

  const locationProof =
    scene.signal.gpsMatches > 0 ? `${scene.signal.gpsMatches} GPS` : 'manual anchor'

  if (!readyToPaint) {
    return `${photos.length} photos / ${locationProof} / confirm place`
  }

  if (scene.autoComposed) {
    return `${photos.length} photos / ${locationProof} / evolving scene`
  }

  if (scene.strokes.length > 0) {
    return `${photos.length} photos / ${locationProof} / ${scene.strokes.length} stroke${scene.strokes.length === 1 ? '' : 's'}`
  }

  return `${photos.length} photos / ${locationProof} / live canvas`
}

export const MemoryCanvas = forwardRef<MemoryCanvasHandle, MemoryCanvasProps>(
  function MemoryCanvas(
    {
      scene,
      photos,
      readyToPaint,
      motionPaused,
      motionPhaseRef,
      onStroke,
      onParallaxChange,
      onMotionPausedChange,
    },
    ref,
  ) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const sequenceRef = useRef(0)
  const previousAnimationTimeRef = useRef<number | null>(null)
  const [isPainting, setIsPainting] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useImperativeHandle(ref, () => ({
    downloadPng: async (fileName = 'afterimage-memory-space.png') => {
      const canvas = canvasRef.current
      if (!canvas) {
        return false
      }

      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = canvas.width
      exportCanvas.height = canvas.height
      const context = exportCanvas.getContext('2d')
      if (!context) {
        return false
      }

      context.drawImage(canvas, 0, 0)
      drawExportPlaque(context, exportCanvas.width, exportCanvas.height, scene, photos)

      const blob = await new Promise<Blob | null>((resolve) =>
        exportCanvas.toBlob(resolve, 'image/png'),
      )
      if (!blob) {
        return false
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
      return true
    },
  }), [photos, scene])

  const render = useCallback((motionPhase = motionPhaseRef.current) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    motionPhaseRef.current = motionPhase
    canvas.dataset.motionPhase = motionPhase.toFixed(6)

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const width = Math.max(320, Math.round(rect.width))
    const height = Math.max(280, Math.round(rect.height))

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
    }

    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) {
      return
    }

    context.save()
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawScene(context, width, height, scene, photos, motionPhase)
    context.restore()
  }, [motionPhaseRef, photos, scene])

  useLayoutEffect(() => {
    let animationFrame = 0
    previousAnimationTimeRef.current = null
    render(motionPhaseRef.current)
    const onResize = () => render(motionPhaseRef.current)
    window.addEventListener('resize', onResize)

    if (scene.autoComposed && !motionPaused && !prefersReducedMotion) {
      const animate = (time: number) => {
        const previousTime = previousAnimationTimeRef.current
        previousAnimationTimeRef.current = time
        const elapsedSeconds = previousTime === null ? 0 : (time - previousTime) / 1000
        render(motionPhaseRef.current + elapsedSeconds)
        animationFrame = window.requestAnimationFrame(animate)
      }

      animationFrame = window.requestAnimationFrame(animate)
    }

    return () => {
      window.removeEventListener('resize', onResize)
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
      }
      previousAnimationTimeRef.current = null
    }
  }, [motionPaused, motionPhaseRef, prefersReducedMotion, render, scene.autoComposed])

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): BrushPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      pressure: event.pressure > 0 ? event.pressure : 0.62,
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!readyToPaint) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      points: [getPoint(event)],
    }
    setIsPainting(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    const dx = event.clientX - drag.lastX
    const dy = event.clientY - drag.lastY
    dragRef.current = {
      ...drag,
      lastX: event.clientX,
      lastY: event.clientY,
      points: [...drag.points, getPoint(event)].slice(-80),
    }
    onParallaxChange(updateParallax(scene.parallax, dx, dy))
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    const finalPoints = [...drag.points, getPoint(event)]
    if (finalPoints.length > 2) {
      sequenceRef.current += 1
      onStroke(createBrushStroke(finalPoints, scene.signal, sequenceRef.current))
    }
    dragRef.current = null
    setIsPainting(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!readyToPaint || (event.key !== 'Enter' && event.key !== ' ')) {
      return
    }

    event.preventDefault()
    sequenceRef.current += 1
    onStroke(createBrushStroke(KEYBOARD_STROKE_POINTS, scene.signal, sequenceRef.current))
  }

  return (
    <div
      className="scene-shell"
      data-has-plate={photos.length > 0 ? 'true' : 'false'}
      data-painting={isPainting ? 'true' : 'false'}
    >
      {photos.length > 0 ? (
        <img
          className="cinematic-memory-plate"
          data-testid="cinematic-memory-plate"
          src="/demo/afterimage-higgsfield-santa-cruz.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            transform: `translate3d(${-scene.parallax.x * 12}px, ${-scene.parallax.y * 9}px, 0) scale(1.045)`,
          }}
        />
      ) : null}
      <canvas
        ref={canvasRef}
        className="memory-canvas"
        data-testid="memory-canvas"
        aria-label="Interactive Santa Cruz memory-space canvas. Press Enter or Space to leave an afterimage."
        aria-disabled={!readyToPaint}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      {scene.autoComposed && !prefersReducedMotion ? (
        <button
          className="motion-toggle"
          type="button"
          aria-label={`${motionPaused ? 'Resume' : 'Pause'} canvas motion`}
          onClick={() => onMotionPausedChange(!motionPaused)}
        >
          {motionPaused ? (
            <Play size={14} aria-hidden="true" />
          ) : (
            <Pause size={14} aria-hidden="true" />
          )}
          {motionPaused ? 'Resume motion' : 'Pause motion'}
        </button>
      ) : null}
      <div className="scene-proof" aria-live="polite">
        {getSceneProof(scene, photos, readyToPaint)}
      </div>
      {scene.autoComposed && photos.length > 0 ? (
        <div className="exhibit-plaque" aria-live="polite">
          <strong>{getExhibitTitle(scene)}</strong>
          <span>{getExhibitLine(scene, photos)}</span>
        </div>
      ) : null}
      <div className="brush-badge" aria-live="polite">
        {getBrushBadge(scene, photos, readyToPaint)}
      </div>
    </div>
  )
  },
)
