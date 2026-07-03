import type { MemorySignal, SceneState } from '../types'

interface TransformationPanelProps {
  signal: MemorySignal
  scene: SceneState
}

const percent = (value: number) => `${Math.round(value * 100)}%`

const recipeSwatches = (signal: MemorySignal) => [
  { label: 'Sky', value: signal.artRecipe.skyTone },
  { label: 'Water', value: signal.artRecipe.waterTone },
  { label: 'Sand', value: signal.artRecipe.sandTone },
  { label: 'Glow', value: signal.artRecipe.horizonGlow },
]

const formatEvidence = (signal: MemorySignal) => {
  if (signal.photoCount === 0) {
    return 'No folder loaded'
  }

  const gps = signal.gpsMatches > 0 ? `${signal.gpsMatches} GPS` : 'manual place'
  const time = signal.timeSpan ? 'timestamps' : 'no timestamps'
  return `${signal.photoCount} photos / ${gps} / ${time}`
}

const formatOutputEvidence = (signal: MemorySignal, scene: SceneState) => {
  if (signal.photoCount === 0) {
    return 'Waiting for photo signals'
  }

  const place = signal.gpsMatches > 0 ? `${signal.gpsMatches} GPS` : 'manual anchor'
  const motion = scene.strokes.length > 0 ? 'brush motion' : 'live canvas'
  return `${signal.photoCount} photos -> ${place} -> ${motion}`
}

const formatMotionDelta = (scene: SceneState) => {
  if (scene.strokes.length === 0) {
    return 'Awaiting brush input'
  }

  const strokeCopy = `${scene.strokes.length} stroke${scene.strokes.length === 1 ? '' : 's'}`
  return scene.autoComposed
    ? `${strokeCopy} -> auto-composed motion field`
    : `${strokeCopy} -> residue changes brush phase`
}

export function TransformationPanel({ signal, scene }: TransformationPanelProps) {
  const strokeCopy =
    scene.strokes.length === 0
      ? 'no residue yet'
      : `${scene.strokes.length} residue stroke${scene.strokes.length === 1 ? '' : 's'}`
  const compositionCopy = scene.autoComposed ? 'evolving composed horizon' : 'live brush physics'

  return (
    <section className="transformation-panel" aria-label="Transformation engine">
      <div className="panel-heading">
        <span className="eyebrow">Transformation engine</span>
        <h2>
          {signal.photoCount > 0
            ? 'Photo signals are driving the scene'
            : 'Awaiting memory input'}
        </h2>
      </div>
      <ol className="engine-flow" aria-label="Computed transformation path">
        <li>
          <span>Evidence</span>
          <strong>{formatEvidence(signal)}</strong>
        </li>
        <li>
          <span>Scene model</span>
          <strong>
            {percent(signal.skyRatio)} sky / {percent(signal.waterRatio)} water /{' '}
            {percent(signal.sandRatio)} sand
          </strong>
        </li>
        <li>
          <span>Living layer</span>
          <strong>
            {strokeCopy} / {compositionCopy}
          </strong>
        </li>
      </ol>
      <div className="recipe-swatches" aria-label="Computed art recipe colors">
        {recipeSwatches(signal).map((swatch) => (
          <div className="recipe-swatch" key={swatch.label}>
            <span style={{ backgroundColor: swatch.value }} />
            <small>{swatch.label}</small>
          </div>
        ))}
      </div>
      <div className="signal-bars" aria-label="Scene rendering parameters">
        {[
          ['Warmth', signal.warmth],
          ['Haze', signal.haze],
          ['Brush', signal.artRecipe.brushSoftness],
          ['Figures', signal.artRecipe.silhouetteDensity],
        ].map(([label, value]) => (
          <div className="signal-bar" key={label as string}>
            <span>{label as string}</span>
            <meter min="0" max="1" value={value as number} />
            <strong>{percent(value as number)}</strong>
          </div>
        ))}
      </div>
      <section className="computation-receipt" aria-label="Computation receipt">
        <span className="eyebrow">Computation receipt</span>
        <ol>
          <li>
            <span>Photo evidence</span>
            <strong>{formatEvidence(signal)}</strong>
          </li>
          <li>
            <span>Pixel sampling</span>
            <strong>
              {percent(signal.skyRatio)} sky / {percent(signal.waterRatio)} water /{' '}
              {percent(signal.sandRatio)} sand
            </strong>
          </li>
          <li>
            <span>Render recipe</span>
            <strong>
              {percent(signal.warmth)} warmth / {percent(signal.haze)} haze / motion-phase canvas
            </strong>
          </li>
          <li>
            <span>Motion delta</span>
            <strong>{formatMotionDelta(scene)}</strong>
          </li>
          <li>
            <span>Evolving output</span>
            <strong>{formatOutputEvidence(signal, scene)}</strong>
          </li>
        </ol>
      </section>
    </section>
  )
}
