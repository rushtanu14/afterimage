import { Brush, FileImage, Maximize2, SlidersHorizontal, X } from 'lucide-react'
import { type KeyboardEvent, type PointerEvent, useMemo, useRef, useState } from 'react'
import type { BrushPoint, MemoryPhoto, SceneState } from '../types'

type RevealStep = 'source' | 'signals' | 'canvas'

interface GuidedRevealProps {
  photos: MemoryPhoto[]
  scene: SceneState
  onEnterExhibit: (trigger?: HTMLElement) => void
  onImprint: (points: BrushPoint[]) => void
  onSkip: () => void
}

const percent = (value: number) => `${Math.round(value * 100)}%`

const formatBrushMotion = (count: number) =>
  `${count} brush motion stroke${count === 1 ? '' : 's'}`

const formatPhotoProof = (photos: MemoryPhoto[], scene: SceneState) => {
  if (photos.length === 0) {
    return 'Waiting for photo evidence'
  }

  const confidence = scene.signal.confidence.toLowerCase()
  const photoCopy = `${photos.length} ${confidence} photo${photos.length === 1 ? '' : 's'}`
  const gpsCopy =
    scene.signal.gpsMatches > 0
      ? `${scene.signal.gpsMatches} GPS match${scene.signal.gpsMatches === 1 ? '' : 'es'}`
      : 'manual place anchor'
  const timeCopy = scene.signal.timeSpan ? 'timestamps preserved' : 'no timestamps'

  return `${photoCopy} / ${gpsCopy} / ${timeCopy}`
}

export function GuidedReveal({
  photos,
  scene,
  onEnterExhibit,
  onImprint,
  onSkip,
}: GuidedRevealProps) {
  const [activeStep, setActiveStep] = useState<RevealStep>('source')
  const [imprinting, setImprinting] = useState(false)
  const imprintPointerIdRef = useRef<number | null>(null)
  const imprintPointsRef = useRef<BrushPoint[]>([])
  const suppressClickRef = useRef(false)

  const steps = useMemo(
    () => [
      {
        id: 'source' as const,
        label: 'Source evidence',
        icon: FileImage,
        title: 'Start with verified place photos',
        proof: formatPhotoProof(photos, scene),
        detail:
          'Afterimage starts from local photos, GPS, timestamps, and browser image analysis instead of a prompt.',
      },
      {
        id: 'signals' as const,
        label: 'Extracted signals',
        icon: SlidersHorizontal,
        title: 'Turn evidence into an art recipe',
        proof: `${percent(scene.signal.skyRatio)} sky / ${percent(scene.signal.waterRatio)} water / ${percent(scene.signal.sandRatio)} sand`,
        detail: `${percent(scene.signal.warmth)} warmth and ${percent(scene.signal.haze)} haze shape the palette, glow, brush softness, and horizon.`,
      },
      {
        id: 'canvas' as const,
        label: 'Living canvas',
        icon: Brush,
        title: 'Motion keeps the work alive',
        proof:
          scene.strokes.length > 0
            ? `${formatBrushMotion(scene.strokes.length)} + time phase -> evolving canvas`
            : 'Brush motion + time phase -> evolving canvas',
        detail:
          'The final scene keeps changing after composition, so the exhibit is a live medium rather than a static filter.',
      },
    ],
    [photos, scene],
  )

  const active = steps.find((step) => step.id === activeStep) ?? steps[0]
  const ActiveIcon = active.icon

  const getImprintPoint = (event: PointerEvent<HTMLDivElement>): BrushPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.width <= 0 ? 0.5 : (event.clientX - rect.left) / rect.width
    const y = rect.height <= 0 ? 0.5 : (event.clientY - rect.top) / rect.height

    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      pressure: 0.76,
    }
  }

  const finishImprint = (event: PointerEvent<HTMLDivElement>) => {
    if (imprintPointerIdRef.current !== event.pointerId) {
      return
    }

    const points = [...imprintPointsRef.current, getImprintPoint(event)]
    imprintPointerIdRef.current = null
    imprintPointsRef.current = []
    setImprinting(false)

    if (points.length >= 2) {
      onImprint(points)
      suppressClickRef.current = true
    }
  }

  const addDefaultImprint = () => {
    onImprint([
      { x: 0.18, y: 0.54, pressure: 0.74 },
      { x: 0.44, y: 0.43, pressure: 0.8 },
      { x: 0.82, y: 0.5, pressure: 0.72 },
    ])
  }

  const handleImprintKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    addDefaultImprint()
  }

  return (
    <section className="guided-reveal" aria-label="Guided reveal" data-step={activeStep}>
      <div className="guided-reveal-header">
        <div>
          <span className="eyebrow">Guided reveal</span>
          <h2>Source to signal to living canvas</h2>
        </div>
        <button
          className="guided-skip-button"
          type="button"
          onClick={onSkip}
          aria-label="Close guided reveal"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="guided-stepper" role="group" aria-label="Reveal steps">
        {steps.map((step) => {
          const StepIcon = step.icon
          return (
            <button
              key={step.id}
              className="guided-step-button"
              type="button"
              aria-pressed={activeStep === step.id}
              onClick={() => setActiveStep(step.id)}
            >
              <StepIcon size={15} aria-hidden="true" />
              {step.label}
            </button>
          )
        })}
      </div>

      <div className="guided-reveal-body">
        <div className="guided-media" aria-hidden={activeStep !== 'source'}>
          {photos.length > 0 ? (
            <div className="guided-photo-grid">
              {photos.slice(0, 4).map((photo) => (
                <img key={photo.id} src={photo.previewUrl} alt="" />
              ))}
            </div>
          ) : (
            <div className="guided-placeholder">Run judge demo to load source photos.</div>
          )}
        </div>

        <div className="guided-copy">
          <div className="guided-copy-heading">
            <ActiveIcon size={18} aria-hidden="true" />
            <strong>{active.title}</strong>
          </div>
          <p>{active.proof}</p>
          <span>{active.detail}</span>
          {activeStep === 'signals' ? (
            <dl className="guided-signal-list" aria-label="Extracted visual ratios">
              <div>
                <dt>Sky</dt>
                <dd>{percent(scene.signal.skyRatio)}</dd>
              </div>
              <div>
                <dt>Water</dt>
                <dd>{percent(scene.signal.waterRatio)}</dd>
              </div>
              <div>
                <dt>Sand</dt>
                <dd>{percent(scene.signal.sandRatio)}</dd>
              </div>
            </dl>
          ) : null}
          {activeStep === 'canvas' ? (
            <div className="guided-intervention">
              <strong>Leave an afterimage</strong>
              <span>Tap or drag this pad to become an input to the artwork.</span>
              <div
                className="guided-imprint-pad"
                role="button"
                tabIndex={0}
                aria-label="Leave an afterimage gesture pad"
                data-active={imprinting}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false
                    return
                  }

                  addDefaultImprint()
                }}
                onKeyDown={handleImprintKeyDown}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  imprintPointerIdRef.current = event.pointerId
                  imprintPointsRef.current = [getImprintPoint(event)]
                  setImprinting(true)
                }}
                onPointerMove={(event) => {
                  if (imprintPointerIdRef.current !== event.pointerId) {
                    return
                  }

                  imprintPointsRef.current = [
                    ...imprintPointsRef.current,
                    getImprintPoint(event),
                  ].slice(-18)
                }}
                onPointerUp={finishImprint}
                onPointerCancel={finishImprint}
              >
                <span aria-hidden="true" />
              </div>
              <p>Motion delta: {formatBrushMotion(scene.strokes.length)}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="guided-actions">
        <button className="guided-text-button" type="button" onClick={onSkip}>
          Skip guided reveal
        </button>
        <button
          className="guided-exhibit-button"
          type="button"
          onClick={(event) => onEnterExhibit(event.currentTarget)}
        >
          <Maximize2 size={16} aria-hidden="true" />
          Open exhibit
        </button>
      </div>
    </section>
  )
}
