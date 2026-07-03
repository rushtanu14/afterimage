import {
  Download,
  FolderOpen,
  Play,
  RotateCcw,
  Sparkles,
  Undo2,
  WandSparkles,
} from 'lucide-react'

interface ControlsProps {
  canUndo: boolean
  canReset: boolean
  canCompose: boolean
  canDownload: boolean
  onLoadDemo: () => void
  onRunJudgeDemo: () => void
  onImportClick: () => void
  onUndo: () => void
  onReset: () => void
  onAutoCompose: () => void
  onDownload: () => void
}

export function Controls({
  canUndo,
  canReset,
  canCompose,
  canDownload,
  onLoadDemo,
  onRunJudgeDemo,
  onImportClick,
  onUndo,
  onReset,
  onAutoCompose,
  onDownload,
}: ControlsProps) {
  return (
    <section className="control-panel" aria-label="Memory-space controls">
      <div className="control-row">
        <button className="primary-button" type="button" onClick={onRunJudgeDemo}>
          <Play size={18} aria-hidden="true" />
          Run judge demo
        </button>
        <button className="ghost-button" type="button" onClick={onLoadDemo}>
          <Sparkles size={18} aria-hidden="true" />
          Load Santa Cruz demo folder
        </button>
        <button className="ghost-button" type="button" onClick={onImportClick}>
          <FolderOpen size={18} aria-hidden="true" />
          Import folder
        </button>
      </div>
      <div className="tool-row">
        <button
          className="icon-button"
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last memory brush stroke"
          title="Undo"
        >
          <Undo2 size={19} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={onReset}
          disabled={!canReset}
          aria-label="Reset memory brush strokes"
          title="Reset"
        >
          <RotateCcw size={19} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={onDownload}
          disabled={!canDownload}
          aria-label="Save memory-space PNG"
          title="Save PNG"
        >
          <Download size={19} aria-hidden="true" />
        </button>
        <button
          className="compose-button"
          type="button"
          onClick={onAutoCompose}
          disabled={!canCompose}
        >
          <WandSparkles size={18} aria-hidden="true" />
          Auto-compose
        </button>
      </div>
    </section>
  )
}
