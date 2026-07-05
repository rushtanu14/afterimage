import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, Loader2, Maximize2, X } from 'lucide-react'
import { ConfidencePanel } from './components/ConfidencePanel'
import { Controls } from './components/Controls'
import { Filmstrip } from './components/Filmstrip'
import { GuidedReveal } from './components/GuidedReveal'
import { MemoryCanvas, type MemoryCanvasHandle } from './components/MemoryCanvas'
import { ProviderDebug } from './components/ProviderDebug'
import { SubmissionPanel } from './components/SubmissionPanel'
import { TransformationPanel } from './components/TransformationPanel'
import { createDemoPhotos, SANTA_CRUZ_ANCHOR } from './data/demo'
import { aggregateMemorySignal, scanMemoryFiles } from './lib/analysis'
import { findProviderResult, providerAdapters } from './lib/providers'
import {
  addBrushStroke,
  autoComposeStrokes,
  createBrushStroke,
  createInitialScene,
  resetStrokes,
  undoStroke,
} from './lib/scene'
import type {
  BrushStroke,
  MemoryPhoto,
  ProviderName,
  ProviderResult,
  SceneState,
} from './types'
import './index.css'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

const JUDGE_DEMO_POINTS = [
  { x: 0.18, y: 0.5, pressure: 0.72 },
  { x: 0.31, y: 0.56, pressure: 0.8 },
  { x: 0.48, y: 0.53, pressure: 0.78 },
  { x: 0.66, y: 0.46, pressure: 0.7 },
  { x: 0.82, y: 0.5, pressure: 0.64 },
]

function App() {
  const folderInputRef = useRef<HTMLInputElement | null>(null)
  const canvasRef = useRef<MemoryCanvasHandle | null>(null)
  const judgeDemoStartedRef = useRef(false)
  const [photos, setPhotos] = useState<MemoryPhoto[]>([])
  const [scene, setScene] = useState<SceneState>(() =>
    createInitialScene(SANTA_CRUZ_ANCHOR),
  )
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [statusMessage, setStatusMessage] = useState(
    'Load the Santa Cruz demo folder or import your own beach photos.',
  )
  const [confirmed, setConfirmed] = useState(false)
  const [providerDebugOpen, setProviderDebugOpen] = useState(false)
  const [exhibitMode, setExhibitMode] = useState(false)
  const [showGuidedReveal, setShowGuidedReveal] = useState(
    () => new URLSearchParams(window.location.search).get('judge') === '1',
  )
  const [selectedProvider, setSelectedProvider] = useState<ProviderName>('Manual')
  const [providerResult, setProviderResult] = useState<ProviderResult | undefined>()

  useEffect(() => {
    const input = folderInputRef.current
    if (!input) {
      return
    }

    input.setAttribute('webkitdirectory', '')
    input.setAttribute('directory', '')
  }, [])

  useEffect(() => {
    let cancelled = false

    const adapters =
      selectedProvider === 'Manual'
        ? providerAdapters
        : [
            ...providerAdapters.filter((adapter) => adapter.name === selectedProvider),
            ...providerAdapters.filter((adapter) => adapter.name !== selectedProvider),
          ]

    findProviderResult(SANTA_CRUZ_ANCHOR, adapters, 450).then((result) => {
      if (!cancelled) {
        setProviderResult(result)
        setScene((current) => ({
          ...current,
          providerResult: result,
        }))
      }
    })

    return () => {
      cancelled = true
    }
  }, [selectedProvider])

  const needsConfirmation = useMemo(
    () =>
      photos.length > 0 &&
      scene.signal.confidence !== 'Verified' &&
      confirmed === false,
    [confirmed, photos.length, scene.signal.confidence],
  )

  const readyToPaint =
    photos.length > 0 && (scene.signal.confidence === 'Verified' || confirmed)

  const exhibitProofItems = useMemo(() => {
    if (photos.length === 0) {
      return [
        'Awaiting photo evidence',
        'EXIF/GPS + color ratios',
        'Brush motion drives the scene',
      ]
    }

    const photoProof = `${photos.length} ${scene.signal.confidence.toLowerCase()} photo${photos.length === 1 ? '' : 's'}`
    const placeProof =
      scene.signal.gpsMatches > 0
        ? `${scene.signal.gpsMatches} GPS match${scene.signal.gpsMatches === 1 ? '' : 'es'}`
        : `${scene.signal.confidence} place anchor`

    return [photoProof, placeProof, 'Brush motion drives the scene']
  }, [photos.length, scene.signal.confidence, scene.signal.gpsMatches])

  const replacePhotos = (nextPhotos: MemoryPhoto[]) => {
    const signal = aggregateMemorySignal(nextPhotos, scene.anchor)
    setPhotos(nextPhotos)
    setScene((current) => ({
      ...current,
      signal,
      strokes: [],
      autoComposed: false,
      parallax: { x: 0, y: 0 },
    }))
    setConfirmed(signal.confidence === 'Verified')
    setStatusMessage(
      signal.confidence === 'Verified'
        ? 'Verified Santa Cruz memory signals. Drag the scene to leave residue.'
        : 'Metadata needs a human confirmation before the scene sharpens.',
    )
    setLoadState('ready')
  }

  const handleLoadDemo = () => {
    setLoadState('loading')
    const demoPhotos = createDemoPhotos()
    window.setTimeout(() => replacePhotos(demoPhotos), 180)
  }

  const handleRunJudgeDemo = useCallback(() => {
    setLoadState('loading')
    setShowGuidedReveal(true)
    const demoPhotos = createDemoPhotos()
    const signal = aggregateMemorySignal(demoPhotos, scene.anchor)
    const judgeStroke = createBrushStroke(JUDGE_DEMO_POINTS, signal, 1)
    const composedStrokes = autoComposeStrokes([judgeStroke], signal)

    window.setTimeout(() => {
      setPhotos(demoPhotos)
      setScene((current) => ({
        ...current,
        signal,
        strokes: composedStrokes,
        autoComposed: true,
        parallax: { x: 0.16, y: -0.04 },
      }))
      setConfirmed(true)
      setStatusMessage('Judge demo built Santa Cruz Afterimage from four verified photos.')
      setLoadState('ready')
    }, 180)
  }, [scene.anchor])

  useEffect(() => {
    const shouldRunJudgeDemo = new URLSearchParams(window.location.search).get('judge') === '1'

    if (!shouldRunJudgeDemo || judgeDemoStartedRef.current) {
      return
    }

    judgeDemoStartedRef.current = true
    handleRunJudgeDemo()
  }, [handleRunJudgeDemo])

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return
    }

    setLoadState('loading')
    setStatusMessage('Scanning folder for GPS, timestamps, color, sky, water, and sand signals.')

    try {
      const result = await scanMemoryFiles([...fileList], scene.anchor)
      replacePhotos(result.photos)
      const unsupported = result.photos.filter(
        (photo) => photo.analysis.status === 'unsupported',
      )

      if (unsupported.length > 0) {
        setStatusMessage(
          `${result.photos.length} photos loaded. ${unsupported.length} HEIC file${unsupported.length === 1 ? '' : 's'} need conversion for full analysis.`,
        )
      }
    } catch (error) {
      setLoadState('error')
      setStatusMessage(
        error instanceof Error ? error.message : 'Folder scan failed. Try JPEG or PNG files.',
      )
    }
  }

  const handleStroke = (stroke: BrushStroke) => {
    if (!readyToPaint) {
      setStatusMessage('Confirm the place anchor first, then paint the memory-space.')
      return
    }

    setScene((current) => ({
      ...current,
      strokes: addBrushStroke(current.strokes, stroke),
      autoComposed: false,
    }))
    setStatusMessage('Residue saved. Keep dragging, or auto-compose when it feels alive.')
  }

  const handleUndo = () => {
    setScene((current) => ({
      ...current,
      strokes: undoStroke(current.strokes),
      autoComposed: false,
    }))
    setStatusMessage('Last residue stroke removed.')
  }

  const handleReset = () => {
    setScene((current) => ({
      ...current,
      strokes: resetStrokes(),
      autoComposed: false,
      parallax: { x: 0, y: 0 },
    }))
    setStatusMessage('Canvas reset to the collective memory atmosphere.')
  }

  const handleAutoCompose = () => {
    setScene((current) => ({
      ...current,
      strokes: autoComposeStrokes(current.strokes, current.signal),
      autoComposed: true,
    }))
    setStatusMessage('Auto-compose cleaned the residue into one cinematic memory-space.')
  }

  const handleEnterExhibitMode = () => {
    if (photos.length === 0) {
      handleRunJudgeDemo()
    }

    setExhibitMode(true)
  }

  const handleDownload = async () => {
    if (photos.length === 0) {
      setStatusMessage('Load photos before saving a memory-space PNG.')
      return
    }

    const saved = await canvasRef.current?.downloadPng('afterimage-santa-cruz-memory-space.png')
    setStatusMessage(
      saved
        ? 'PNG export includes title, evidence, computation note, and motion delta for the submission gallery.'
        : 'PNG export failed. Try again after the scene renders.',
    )
  }

  return (
    <main className="app-shell">
      <input
        ref={folderInputRef}
        className="hidden-input"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif"
        multiple
        aria-label="Import photo folder"
        onChange={(event) => handleFiles(event.currentTarget.files)}
      />
      <header className="app-topbar">
        <div>
          <span className="eyebrow">Afterimage</span>
          <h1>Living memory-space</h1>
          <p className="artist-statement">
            Verified photos become an evolving place-memory; code turns GPS, color, time, and brush motion into the artwork.
          </p>
        </div>
        <div className="status-line" role="status" aria-live="polite">
          {loadState === 'loading' ? (
            <Loader2 className="spin" size={17} aria-hidden="true" />
          ) : loadState === 'error' ? (
            <AlertTriangle size={17} aria-hidden="true" />
          ) : (
            <Check size={17} aria-hidden="true" />
          )}
          <span>{statusMessage}</span>
        </div>
        <ProviderDebug
          open={providerDebugOpen}
          provider={selectedProvider}
          result={providerResult}
          onToggle={() => setProviderDebugOpen((open) => !open)}
          onProviderChange={setSelectedProvider}
        />
      </header>

      <section className="workspace">
        <aside className="left-rail">
          <Controls
            canUndo={scene.strokes.length > 0}
            canReset={scene.strokes.length > 0 || scene.parallax.x !== 0 || scene.parallax.y !== 0}
            canCompose={scene.strokes.length > 0 && readyToPaint}
            canDownload={photos.length > 0}
            onLoadDemo={handleLoadDemo}
            onRunJudgeDemo={handleRunJudgeDemo}
            onImportClick={() => folderInputRef.current?.click()}
            onUndo={handleUndo}
            onReset={handleReset}
            onAutoCompose={handleAutoCompose}
            onDownload={handleDownload}
          />
          <ConfidencePanel
            anchor={scene.anchor}
            signal={scene.signal}
            needsConfirmation={needsConfirmation}
            confirmed={confirmed}
            onConfirm={() => {
              setConfirmed(true)
              setStatusMessage('Human confirmation accepted. Manual signals render dreamier.')
            }}
            onEnter={() => {
              setStatusMessage('Memory-space entered. Drag anywhere on the canvas to paint residue.')
              document.querySelector<HTMLCanvasElement>('[data-testid="memory-canvas"]')?.focus()
            }}
          />
          <TransformationPanel signal={scene.signal} scene={scene} />
          <SubmissionPanel />
        </aside>

        <section className="scene-column" aria-label="Interactive memory-space">
          <div className="scene-actions">
            {showGuidedReveal ? (
              <GuidedReveal
                photos={photos}
                scene={scene}
                onEnterExhibit={handleEnterExhibitMode}
                onSkip={() => setShowGuidedReveal(false)}
              />
            ) : null}
            <button
              className="exhibit-mode-button"
              type="button"
              onClick={handleEnterExhibitMode}
            >
              <Maximize2 size={17} aria-hidden="true" />
              Enter exhibit mode
            </button>
          </div>
          <MemoryCanvas
            ref={canvasRef}
            scene={scene}
            photos={photos}
            readyToPaint={readyToPaint}
            onStroke={handleStroke}
            onParallaxChange={(parallax) =>
              setScene((current) => ({ ...current, parallax }))
            }
          />
          <Filmstrip photos={photos} />
        </section>
      </section>
      {exhibitMode ? (
        <section className="exhibit-mode" aria-label="Immersive exhibit mode">
          <div className="exhibit-mode-copy">
            <span className="eyebrow">Immersive exhibit</span>
            <h2>Santa Cruz Afterimage</h2>
            <p>
              GPS, color, time, and brush motion become one evolving canvas.
            </p>
          </div>
          <div className="exhibit-mode-canvas">
            <MemoryCanvas
              scene={scene}
              photos={photos}
              readyToPaint={readyToPaint}
              onStroke={handleStroke}
              onParallaxChange={(parallax) =>
                setScene((current) => ({ ...current, parallax }))
              }
            />
          </div>
          <div className="exhibit-mode-proof" aria-label="Exhibit proof">
            {exhibitProofItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <button
            className="exhibit-exit-button"
            type="button"
            onClick={() => setExhibitMode(false)}
          >
            <X size={17} aria-hidden="true" />
            Exit exhibit mode
          </button>
        </section>
      ) : null}
    </main>
  )
}

export default App
