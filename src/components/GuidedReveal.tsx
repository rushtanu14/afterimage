import { Brush, FileImage, Maximize2, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { MemoryPhoto, SceneState } from '../types'

type RevealStep = 'source' | 'signals' | 'canvas'

interface GuidedRevealProps {
  photos: MemoryPhoto[]
  scene: SceneState
  onEnterExhibit: () => void
  onSkip: () => void
}

const percent = (value: number) => `${Math.round(value * 100)}%`

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
  onSkip,
}: GuidedRevealProps) {
  const [activeStep, setActiveStep] = useState<RevealStep>('source')

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
            ? `${scene.strokes.length} brush motion stroke${scene.strokes.length === 1 ? '' : 's'} + time phase -> evolving canvas`
            : 'Brush motion + time phase -> evolving canvas',
        detail:
          'The final scene keeps changing after composition, so the exhibit is a live medium rather than a static filter.',
      },
    ],
    [photos, scene],
  )

  const active = steps.find((step) => step.id === activeStep) ?? steps[0]
  const ActiveIcon = active.icon

  return (
    <section className="guided-reveal" aria-label="Guided reveal">
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

      <div className="guided-stepper" aria-label="Reveal steps">
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
        </div>
      </div>

      <div className="guided-actions">
        <button className="guided-text-button" type="button" onClick={onSkip}>
          Skip guided reveal
        </button>
        <button className="guided-exhibit-button" type="button" onClick={onEnterExhibit}>
          <Maximize2 size={16} aria-hidden="true" />
          Open exhibit
        </button>
      </div>
    </section>
  )
}
