import { CheckCircle2, CircleAlert, MapPinned } from 'lucide-react'
import type { MemorySignal, PlaceAnchor } from '../types'

interface ConfidencePanelProps {
  anchor: PlaceAnchor
  signal: MemorySignal
  needsConfirmation: boolean
  confirmed: boolean
  onConfirm: () => void
  onEnter: () => void
}

export function ConfidencePanel({
  anchor,
  signal,
  needsConfirmation,
  confirmed,
  onConfirm,
  onEnter,
}: ConfidencePanelProps) {
  const Icon = signal.confidence === 'Verified' ? CheckCircle2 : CircleAlert

  return (
    <section className="confidence-panel" aria-label="Metadata confidence">
      <div className="panel-heading">
        <span className="eyebrow">Place anchor</span>
        <h2>{anchor.name}</h2>
      </div>
      <div className={`confidence-pill ${signal.confidence.toLowerCase()}`}>
        <Icon size={18} aria-hidden="true" />
        <strong>{signal.confidence}</strong>
        <span>{Math.round(signal.confidenceScore * 100)}%</span>
      </div>
      <dl className="signal-grid">
        <div>
          <dt>Photos</dt>
          <dd>{signal.photoCount}</dd>
        </div>
        <div>
          <dt>GPS hits</dt>
          <dd>{signal.gpsMatches}</dd>
        </div>
        <div>
          <dt>Warmth</dt>
          <dd>{Math.round(signal.warmth * 100)}</dd>
        </div>
        <div>
          <dt>Haze</dt>
          <dd>{Math.round(signal.haze * 100)}</dd>
        </div>
      </dl>
      <ul className="reason-list">
        {signal.confidenceReasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      {needsConfirmation && !confirmed ? (
        <button className="primary-button" type="button" onClick={onConfirm}>
          <MapPinned size={18} aria-hidden="true" />
          Confirm Santa Cruz anchor
        </button>
      ) : signal.photoCount > 0 ? (
        <button className="primary-button" type="button" onClick={onEnter}>
          <MapPinned size={18} aria-hidden="true" />
          Enter memory-space
        </button>
      ) : (
        <p className="confirmation-note" aria-live="polite">
          {confirmed || signal.confidence === 'Verified'
            ? 'Memory-space ready.'
            : 'Load photos to begin.'}
        </p>
      )}
    </section>
  )
}
