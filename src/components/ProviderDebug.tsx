import { EyeOff, SlidersHorizontal } from 'lucide-react'
import type { ProviderName, ProviderResult } from '../types'
import { providerCopy } from '../lib/providers'

interface ProviderDebugProps {
  open: boolean
  provider: ProviderName
  result?: ProviderResult
  onToggle: () => void
  onProviderChange: (provider: ProviderName) => void
}

const providers: ProviderName[] = ['Mapillary', 'Panoramax', 'KartaView', 'Manual']

export function ProviderDebug({
  open,
  provider,
  result,
  onToggle,
  onProviderChange,
}: ProviderDebugProps) {
  return (
    <div className="provider-debug">
      <button
        className="icon-button"
        type="button"
        onClick={onToggle}
        aria-label="Open developer source picker"
        title="Developer sources"
      >
        {open ? <EyeOff size={18} aria-hidden="true" /> : <SlidersHorizontal size={18} aria-hidden="true" />}
      </button>
      {open ? (
        <section className="provider-popover" data-testid="provider-picker">
          <span className="eyebrow">Developer sources</span>
          <div className="segmented-control" role="radiogroup" aria-label="Street image source">
            {providers.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={provider === name}
                className={provider === name ? 'selected' : ''}
                onClick={() => onProviderChange(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <p>{providerCopy(provider)}</p>
          <small>{result?.attribution ?? 'Provider lookup has not run yet.'}</small>
        </section>
      ) : null}
    </div>
  )
}
