import { Copy } from 'lucide-react'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'

const SOURCE_REPOSITORY_URL = 'https://github.com/rushtanu14/afterimage'
const SOURCE_COMMIT_PROOF = 'public history from 1f2e060 onward'
const LIVE_DEMO_URL = 'https://afterimage-omega.vercel.app/?judge=1'
const LIVE_DEMO_ROOT_URL = 'https://afterimage-omega.vercel.app'
const PROOF_REEL_ASSET_PATH = '/submission/afterimage-proof-reel.webm'
const PROOF_REEL_PUBLIC_URL = `${LIVE_DEMO_ROOT_URL}${PROOF_REEL_ASSET_PATH}`

const DEVPOST_PACKAGE = `Title: Afterimage
Tagline: Turn verified place photos into an evolving memory-space.

Description:
Afterimage is a computational artwork for Hack the Arts. It transforms a folder of Santa Cruz beach photos into a living place-memory by extracting metadata confidence, GPS proximity, timestamps, color palettes, sky/water/sand ratios, and brush motion. The result is not a filter or a static gallery: the canvas keeps evolving after composition, and the final exhibit label preserves the evidence trail behind the artwork.

Built with:
React, TypeScript, Canvas 2D, EXIF parsing, local image color sampling, procedural demo assets, and optional Mapillary / Panoramax / KartaView place-source lookups.

Implementation:
EXIF, GPS, and timestamps become confidence and place evidence. Browser pixel sampling becomes sky, water, sand, warmth, haze, and palette ratios. Brush motion and time phase keep the Canvas scene evolving after composition.

Guided reveal:
The judge path opens with a skippable source-to-canvas reveal that shows verified photos, extracted visual signals, and a first-viewport Leave an afterimage gesture on the living Canvas before the proof dashboard.

Computation receipt:
The Transformation Engine shows the live chain from photo evidence to pixel sampling, render recipe, motion delta, and evolving output, so judges can see the algorithm that makes the artwork.

Live medium proof:
Responds: brush motion and parallax reshape the scene.
Evolves: the composed Canvas keeps changing after the final exhibit appears.
Engages: the judge path produces a named exhibit, proof trail, and exportable PNG artifact.
Exhibit mode: judges can hide the proof dashboard and view the living artwork as an immersive gallery piece.

Demo link:
Use ${LIVE_DEMO_URL} to open directly on the final Santa Cruz Afterimage exhibit.

Proof reel:
Use ${PROOF_REEL_PUBLIC_URL} for the hosted sub-50-second proof reel that shows the live URL, cursor input, computation receipt, Exhibit mode, evolving canvas, source proof, and final artifact.

Source handoff:
Source URL: ${SOURCE_REPOSITORY_URL}
Source proof: ${SOURCE_COMMIT_PROOF} preserves the July 1 to August 1, 2026 build window.
Public repo includes src/, public/demo/, scripts/, tests/, README.md, package.json, package-lock.json, and config files. Excludes node_modules, dist, and local screenshots. Run npm run test, npm run build, npm run test:e2e, and npm audit --json before submitting.

MCP launch plan:
Composio MCP belongs in submission ops, not the browser runtime.
GitHub MCP: verify the public source repo and build-history proof.
Vercel connector: production demo is live at ${LIVE_DEMO_URL}.
Devpost package: paste the copied description, source URL, attribution, and demo video.

Judging fit:
Creativity & Originality (30%): place evidence becomes an evolving memory-space, not a conventional filter.
Use of Technology (25%): EXIF/GPS, image sampling, and Canvas rendering create the art system.
Interactivity & Experience (20%): users import photos, confirm place anchors, paint residue, and auto-compose the final artwork.
Execution (15%): one-click judge demo, PNG export, responsive layout, and automated cross-browser coverage.
Theme Alignment (10%): the artwork depends on code, metadata, computation, and motion.

Attribution:
Demo photos are procedural generated assets in public/demo/santa-cruz-demo-photos. Runtime libraries include React, TypeScript, Canvas 2D browser APIs, exifr, and lucide-react. Optional street-image provider lookups reference Mapillary, Panoramax, and KartaView only where coverage exists.`

const DEMO_SCRIPT = `0:00 Run judge demo.
0:04 Use the Guided reveal: source evidence, extracted signals, and Leave an afterimage on the living canvas.
0:08 Name the artwork: Afterimage turns verified Santa Cruz photos into an evolving place-memory.
0:14 Point to the canvas proof overlay and final exhibit label.
0:20 Show the Computation receipt: photo evidence becomes pixel sampling, render recipe, motion delta, and evolving output.
0:28 Show the Live medium proof: responds, evolves, and engages.
0:35 Enter Exhibit mode so the artwork takes over the viewport.
0:42 Show the scorecard, save PNG, and copy the Devpost package.
0:45 Close with the theme: this art depends on code, metadata, computation, and motion.`

const PROOF_REEL_BRIEF = `Sub-50-second proof reel:
Hosted proof reel: ${PROOF_REEL_PUBLIC_URL}
Record the deployed judge path: ${LIVE_DEMO_URL}
Opening frame: the Santa Cruz Afterimage exhibit is already alive, with the live URL visible.
Guided reveal: scrub source evidence, extracted signals, and Leave an afterimage on the living canvas before skipping into the proof dashboard.
Interaction proof: show cursor drag, computation receipt, evolving canvas, export, and source proof.
0:00 Open the live judge path and name the project.
0:04 Use the Guided reveal to compress the transformation story.
0:08 Show the canvas proof overlay and exhibit label.
0:14 Drag the scene or run the judge demo so the art visibly responds.
0:22 Show the Computation receipt and Live medium proof.
0:32 Enter Exhibit mode, save the PNG artifact, and open the Source tab.
0:40 Show the public source URL, live demo URL, attribution, and Devpost copy.
Upload target: Devpost demo video or linked walkthrough asset.`

const SUBMISSION_MEDIA_KIT = `Cover screenshot: Exhibit mode with the final Santa Cruz Afterimage canvas and exhibit label visible.
Proof screenshot: Computation receipt plus Live medium proof visible in the judge path.
Source screenshot: Devpost requirements, live demo URL, source repository, and MCP launch plan visible in the Source tab.
Artifact: exported afterimage-santa-cruz-memory-space.png with title, evidence, computation note, and motion delta.
Video: sub-50-second proof reel following the Script tab brief, with live URL, cursor input, computation receipt, Exhibit mode, evolving canvas, export, and source proof visible.`

const ATTRIBUTION_BLOCK = `Demo photos: procedural generated assets in public/demo/santa-cruz-demo-photos.
Libraries: React, TypeScript, Canvas 2D, exifr, lucide-react.
Optional providers: Mapillary, Panoramax, and KartaView place-source lookups are referenced only where coverage exists.
No paid map, AI, or proprietary image provider is required for the judge demo.`

const IMPLEMENTATION_RECEIPT = `EXIF, GPS, and timestamps become confidence and place evidence.
Browser pixel sampling becomes sky, water, sand, and palette ratios.
Color warmth, haze, and image brightness shape the art recipe.
Brush motion and time phase keep the Canvas scene evolving after composition.
The visible computation receipt links photo evidence, pixel sampling, render recipe, motion delta, and evolving output.`

const SOURCE_HANDOFF = `Devpost requires demo, source, description, and attribution.
Live demo URL: ${LIVE_DEMO_URL}
Devpost source URL: ${SOURCE_REPOSITORY_URL}
Public repo history: ${SOURCE_COMMIT_PROOF} preserves the July 1 to August 1, 2026 build window.
Public repo should include src/, public/demo/, scripts/, tests/, README.md, package.json, package-lock.json, and config files.
Exclude node_modules, dist, and local screenshots.
Run npm run test, npm run build, npm run test:e2e, and npm audit --json before submitting.
Devpost source URL is ready for the submission form.`

const LAUNCH_AUTOMATION_PLAN = `Composio MCP belongs in submission ops, not the browser runtime.
GitHub MCP: verify the public source repository and preserve July 1 to August 1 build history.
Vercel connector: production demo is live at ${LIVE_DEMO_URL}.
Canva or recording workflow: assemble screenshots and the sub-50-second proof reel.
Devpost package: paste the copied description, source URL, attribution, and demo video.`

const judgingFit = [
  {
    criterion: 'Creativity & Originality (30%)',
    proof: 'Place evidence becomes an evolving memory-space, not a conventional filter.',
  },
  {
    criterion: 'Use of Technology (25%)',
    proof: 'EXIF/GPS, image sampling, and Canvas rendering create the art system.',
  },
  {
    criterion: 'Interactivity & Experience (20%)',
    proof: 'Import photos, confirm anchors, paint residue, and auto-compose the artwork.',
  },
  {
    criterion: 'Execution (15%)',
    proof: 'One-click judge demo, PNG export, responsive layout, and tested flows.',
  },
  {
    criterion: 'Theme Alignment (10%)',
    proof: 'The artwork depends on code, metadata, computation, and motion.',
  },
]

const prizeFit = [
  {
    prize: 'Best Interactive Experience',
    proof: 'Import, confirm, paint, auto-compose, and export a living scene in one judge path.',
  },
  {
    prize: 'Most Unique',
    proof: 'Place evidence, metadata confidence, and brush motion become the art medium.',
  },
  {
    prize: 'Best Overall Project',
    proof: 'Complete demo story, source handoff, attribution, and verification are packaged together.',
  },
]

const mediumProof = [
  {
    signal: 'Responds',
    proof: 'Brush motion and parallax reshape the scene instead of replaying a static image.',
  },
  {
    signal: 'Evolves',
    proof: 'The composed Canvas keeps changing after the final Santa Cruz exhibit appears.',
  },
  {
    signal: 'Engages',
    proof: 'The judge path ends with a named exhibit, evidence trail, and exportable PNG artifact.',
  },
  {
    signal: 'Immerses',
    proof: 'Exhibit mode lets judges view the living artwork without the proof dashboard taking over the experience.',
  },
]

const demoScriptSteps = [
  '0:00 Run judge demo',
  '0:04 Use the Guided reveal: source evidence, extracted signals, and Leave an afterimage',
  '0:08 Name Afterimage as an evolving place-memory',
  '0:14 Point to the proof overlay and exhibit label',
  '0:20 Show the Computation receipt',
  '0:28 Show the Live medium proof',
  '0:35 Enter Exhibit mode so the artwork takes over the viewport',
  '0:42 Show the scorecard, save PNG, and copy the Devpost package',
  '0:45 Close with the theme: this art depends on code, metadata, computation, and motion',
]

const proofReelLines = [
  'Sub-50-second proof reel: hosted public video asset for Devpost judges.',
  `Open hosted proof reel: ${PROOF_REEL_PUBLIC_URL}`,
  `Record the deployed judge path: ${LIVE_DEMO_URL}`,
  'Opening frame: Santa Cruz Afterimage is already alive with the live URL visible.',
  'Guided reveal: scrub source evidence, extracted signals, and Leave an afterimage before the proof dashboard.',
  'Show cursor drag, computation receipt, evolving canvas, export, and source proof.',
  'Enter Exhibit mode so the artwork fills the viewport before the final source proof.',
  'Upload target: Devpost demo video or linked walkthrough asset.',
]

const mediaKitLines = [
  'Cover screenshot: Exhibit mode with the final Santa Cruz Afterimage canvas and exhibit label visible.',
  'Proof screenshot: Computation receipt plus Live medium proof visible in the judge path.',
  'Source screenshot: Devpost requirements, live demo URL, source repository, and MCP launch plan visible in the Source tab.',
  'Artifact: exported afterimage-santa-cruz-memory-space.png with title, evidence, computation note, and motion delta.',
  'Video: sub-50-second proof reel with live URL, cursor input, computation receipt, Exhibit mode, evolving canvas, export, and source proof visible.',
]

const attributionLines = [
  'Demo photos: procedural generated assets in public/demo/santa-cruz-demo-photos.',
  'Libraries: React, TypeScript, Canvas 2D, exifr, lucide-react.',
  'Optional providers: Mapillary, Panoramax, and KartaView.',
  'No paid map, AI, or proprietary image provider is required for the judge demo.',
]

const implementationLines = [
  'EXIF, GPS, and timestamps become confidence and place evidence.',
  'Browser pixel sampling becomes sky, water, sand, and palette ratios.',
  'Color warmth, haze, and image brightness shape the art recipe.',
  'Brush motion and time phase keep the Canvas scene evolving after composition.',
  'The visible computation receipt links photo evidence, pixel sampling, render recipe, motion delta, and evolving output.',
]

const sourceHandoffLines = [
  'Devpost requires demo, source, description, and attribution.',
  `Live demo URL: ${LIVE_DEMO_URL}`,
  `Devpost source URL: ${SOURCE_REPOSITORY_URL}`,
  `Public repo history: ${SOURCE_COMMIT_PROOF} preserves the July 1 to August 1, 2026 build window.`,
  'Public repo should include src/, public/demo/, scripts/, tests/, README.md, and package-lock.json.',
  'Include package.json plus Vite, TypeScript, Vitest, and Playwright config files.',
  'Exclude node_modules, dist, and local screenshots.',
  'Run npm run test, npm run build, npm run test:e2e, and npm audit --json before submitting.',
]

const launchAutomationLines = [
  'Composio MCP belongs in submission ops, not the browser runtime.',
  'GitHub MCP: verify the public source repository and preserve July 1 to August 1 build history.',
  `Vercel connector: production demo is live at ${LIVE_DEMO_URL}.`,
  'Canva or recording workflow: assemble screenshots and the sub-50-second proof reel.',
  'Devpost package: paste the copied description, source URL, attribution, and demo video.',
]

const evidenceStripItems = [
  {
    label: 'Run live demo',
    detail: 'Open the production judge path.',
  },
  {
    label: 'Proof reel',
    detail: 'Sub-50-second proof of interaction, computation, and source.',
  },
  {
    label: 'View source',
    detail: 'Public repo and build-period proof.',
  },
  {
    label: 'Copy package',
    detail: 'Description, attribution, and Devpost handoff.',
  },
]

const submissionRequirements = [
  {
    status: 'Ready',
    title: 'Working demo',
    proof: `${LIVE_DEMO_URL} opens the final exhibit state on the production deployment.`,
  },
  {
    status: 'External',
    title: 'Build period proof',
    proof: 'Public repo history and Devpost notes should preserve the July 1 to August 1, 2026 build window.',
  },
  {
    status: 'Ready',
    title: 'Public source',
    proof: `Publicly accessible source code repository: ${SOURCE_REPOSITORY_URL} includes app source, demo assets, tests, docs, and commit proof ${SOURCE_COMMIT_PROOF}.`,
  },
  {
    status: 'Ready',
    title: 'Written description',
    proof: 'Copy Devpost package covers concept, implementation, technologies, and judging fit.',
  },
  {
    status: 'Ready',
    title: 'Attribution',
    proof: 'Proof tab attribution covers procedural demo assets, libraries, and optional APIs.',
  },
]

const submissionTabs = [
  { id: 'scorecard', label: 'Scorecard' },
  { id: 'proof', label: 'Proof' },
  { id: 'source', label: 'Source' },
  { id: 'script', label: 'Script' },
] as const

type SubmissionTab = (typeof submissionTabs)[number]['id']

const getJudgeLink = () => new URL('/?judge=1', window.location.href).toString()

const copyText = async (text: string) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall back below for browser contexts where clipboard permission is blocked.
  }

  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    const copied = document.execCommand('copy')
    textArea.remove()
    return copied
  } catch {
    return false
  }
}

export function SubmissionPanel() {
  const didMountRef = useRef(false)
  const [activeTab, setActiveTab] = useState<SubmissionTab>('scorecard')
  const [devpostCopyStatus, setDevpostCopyStatus] = useState('Ready for Devpost copy.')
  const [scriptCopyStatus, setScriptCopyStatus] = useState('Demo script ready.')
  const [proofReelCopyStatus, setProofReelCopyStatus] = useState(
    'Proof reel brief ready.',
  )
  const [mediaKitCopyStatus, setMediaKitCopyStatus] = useState('Media kit ready.')
  const [attributionCopyStatus, setAttributionCopyStatus] = useState('Attribution ready.')
  const [implementationCopyStatus, setImplementationCopyStatus] = useState(
    'Implementation receipt ready.',
  )
  const [sourceHandoffCopyStatus, setSourceHandoffCopyStatus] = useState(
    'Source handoff ready.',
  )
  const [sourceUrlCopyStatus, setSourceUrlCopyStatus] = useState(
    'Source URL ready.',
  )
  const [liveDemoCopyStatus, setLiveDemoCopyStatus] = useState(
    'Live demo URL ready.',
  )
  const [launchPlanCopyStatus, setLaunchPlanCopyStatus] = useState(
    'Launch plan ready.',
  )
  const [judgeLinkCopyStatus, setJudgeLinkCopyStatus] = useState(
    'Judge link ready: add /?judge=1 to the deployed site.',
  )

  const handleDevpostCopy = async () => {
    const copied = await copyText(DEVPOST_PACKAGE)
    setDevpostCopyStatus(copied ? 'Devpost package copied.' : 'Copy failed; use the README package.')
  }

  const handleScriptCopy = async () => {
    const copied = await copyText(DEMO_SCRIPT)
    setScriptCopyStatus(copied ? 'Demo script copied.' : 'Copy failed; use the README script.')
  }

  const handleProofReelCopy = async () => {
    const copied = await copyText(PROOF_REEL_BRIEF)
    setProofReelCopyStatus(
      copied ? 'Proof reel brief copied.' : 'Copy failed; use the README proof reel brief.',
    )
  }

  const handleMediaKitCopy = async () => {
    const copied = await copyText(SUBMISSION_MEDIA_KIT)
    setMediaKitCopyStatus(copied ? 'Media kit copied.' : 'Copy failed; use the README media kit.')
  }

  const handleAttributionCopy = async () => {
    const copied = await copyText(ATTRIBUTION_BLOCK)
    setAttributionCopyStatus(copied ? 'Attribution copied.' : 'Copy failed; use the README attribution.')
  }

  const handleImplementationCopy = async () => {
    const copied = await copyText(IMPLEMENTATION_RECEIPT)
    setImplementationCopyStatus(
      copied ? 'Implementation receipt copied.' : 'Copy failed; use the README implementation receipt.',
    )
  }

  const handleSourceHandoffCopy = async () => {
    const copied = await copyText(SOURCE_HANDOFF)
    setSourceHandoffCopyStatus(
      copied ? 'Source handoff copied.' : 'Copy failed; use the README source handoff.',
    )
  }

  const handleSourceUrlCopy = async () => {
    const copied = await copyText(SOURCE_REPOSITORY_URL)
    setSourceUrlCopyStatus(
      copied ? 'Source URL copied.' : 'Copy failed; use the README source URL.',
    )
  }

  const handleLiveDemoCopy = async () => {
    const copied = await copyText(LIVE_DEMO_URL)
    setLiveDemoCopyStatus(
      copied ? 'Live demo URL copied.' : 'Copy failed; use the README live demo URL.',
    )
  }

  const handleLaunchPlanCopy = async () => {
    const copied = await copyText(LAUNCH_AUTOMATION_PLAN)
    setLaunchPlanCopyStatus(
      copied ? 'Launch plan copied.' : 'Copy failed; use the README launch plan.',
    )
  }

  const handleJudgeLinkCopy = async () => {
    const judgeLink = getJudgeLink()
    const copied = await copyText(judgeLink)
    setJudgeLinkCopyStatus(copied ? `Judge link copied: ${judgeLink}` : 'Copy failed; use /?judge=1.')
  }

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    document.getElementById(`submission-tab-${activeTab}`)?.focus({
      preventScroll: true,
    })
  }, [activeTab])

  const selectTab = (tab: SubmissionTab) => {
    setActiveTab(tab)
  }

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    tab: SubmissionTab,
  ) => {
    const currentIndex = submissionTabs.findIndex((item) => item.id === tab)
    const lastIndex = submissionTabs.length - 1
    const nextTab =
      event.key === 'ArrowRight'
        ? submissionTabs[(currentIndex + 1) % submissionTabs.length]
        : event.key === 'ArrowLeft'
          ? submissionTabs[(currentIndex - 1 + submissionTabs.length) % submissionTabs.length]
          : event.key === 'Home'
            ? submissionTabs[0]
            : event.key === 'End'
              ? submissionTabs[lastIndex]
              : undefined

    if (!nextTab) {
      return
    }

    event.preventDefault()
    selectTab(nextTab.id)
  }

  return (
    <section className="submission-panel" aria-label="Submission brief">
      <div className="panel-heading">
        <span className="eyebrow">Submission brief</span>
        <h2>Computational art medium, not a filter</h2>
      </div>
      <dl className="submission-list">
        <div>
          <dt>Concept</dt>
          <dd>Place evidence becomes a living memory-space that keeps evolving after composition.</dd>
        </div>
        <div>
          <dt>Technology</dt>
          <dd>React + TypeScript / Canvas 2D / EXIF and color sampling</dd>
        </div>
        <div>
          <dt>Attribution</dt>
          <dd>Procedural demo photos; optional Mapillary, Panoramax, and KartaView lookups</dd>
        </div>
        <div>
          <dt>Judge link</dt>
          <dd>Use /?judge=1 on the deployed site to open directly on the final exhibit.</dd>
        </div>
      </dl>
      <button className="brief-copy-button" type="button" onClick={handleDevpostCopy}>
        <Copy size={16} aria-hidden="true" />
        Copy Devpost package
      </button>
      <p className="brief-copy-status" aria-live="polite">
        {devpostCopyStatus}
      </p>
      <button className="brief-copy-button" type="button" onClick={handleJudgeLinkCopy}>
        <Copy size={16} aria-hidden="true" />
        Copy judge link
      </button>
      <p className="brief-copy-status" aria-live="polite">
        {judgeLinkCopyStatus}
      </p>
      <section className="evidence-strip" aria-label="Judge evidence strip">
        {evidenceStripItems.map((item) => (
          <div key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </div>
        ))}
      </section>
      <div className="submission-tabs" role="tablist" aria-label="Submission pack">
        {submissionTabs.map((tab) => (
          <button
            key={tab.id}
            id={`submission-tab-${tab.id}`}
            className="submission-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`submission-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'scorecard' && (
        <div
          id="submission-panel-scorecard"
          role="tabpanel"
          aria-labelledby="submission-tab-scorecard"
        >
          <section className="medium-proof" aria-label="Live medium proof">
            <span className="eyebrow">Live medium proof</span>
            <ul>
              {mediumProof.map((item) => (
                <li key={item.signal}>
                  <strong>{item.signal}</strong>
                  <span>{item.proof}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="prize-fit" aria-label="Prize fit">
            <span className="eyebrow">Prize fit</span>
            <ul>
              {prizeFit.map((item) => (
                <li key={item.prize}>
                  <strong>{item.prize}</strong>
                  <span>{item.proof}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="judging-fit" aria-label="Judging fit">
            <span className="eyebrow">Judging fit</span>
            <ul>
              {judgingFit.map((item) => (
                <li key={item.criterion}>
                  <strong>{item.criterion}</strong>
                  <span>{item.proof}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
      {activeTab === 'proof' && (
        <div
          id="submission-panel-proof"
          className="submission-tab-panel"
          role="tabpanel"
          aria-labelledby="submission-tab-proof"
        >
          <section className="attribution-block" aria-label="Attribution block">
            <span className="eyebrow">Attribution block</span>
            <ul>
              {attributionLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button className="brief-copy-button" type="button" onClick={handleAttributionCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy attribution
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {attributionCopyStatus}
            </p>
          </section>
          <section className="implementation-receipt" aria-label="Implementation receipt">
            <span className="eyebrow">Implementation receipt</span>
            <ul>
              {implementationLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button className="brief-copy-button" type="button" onClick={handleImplementationCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy implementation receipt
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {implementationCopyStatus}
            </p>
          </section>
        </div>
      )}
      {activeTab === 'source' && (
        <div
          id="submission-panel-source"
          className="submission-tab-panel"
          role="tabpanel"
          aria-labelledby="submission-tab-source"
        >
          <section className="devpost-requirements" aria-label="Devpost requirements">
            <span className="eyebrow">Devpost requirements</span>
            <ul>
              {submissionRequirements.map((item) => (
                <li key={item.title}>
                  <div>
                    <strong>{item.title}</strong>
                    <span data-status={item.status}>{item.status}</span>
                  </div>
                  <p>{item.proof}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="source-handoff" aria-label="Source handoff">
            <span className="eyebrow">Source handoff</span>
            <ul>
              {sourceHandoffLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button className="brief-copy-button" type="button" onClick={handleSourceHandoffCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy source handoff
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {sourceHandoffCopyStatus}
            </p>
          </section>
          <section className="source-repository" aria-label="Source repository">
            <span className="eyebrow">Source repository</span>
            <ul>
              <li>{SOURCE_REPOSITORY_URL}</li>
              <li>{SOURCE_COMMIT_PROOF} is pushed to origin/main.</li>
              <li>Ready for the Devpost source-code field.</li>
            </ul>
            <button className="brief-copy-button" type="button" onClick={handleSourceUrlCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy source URL
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {sourceUrlCopyStatus}
            </p>
          </section>
          <section className="live-demo" aria-label="Live demo">
            <span className="eyebrow">Live demo</span>
            <ul>
              <li>{LIVE_DEMO_URL}</li>
              <li>{LIVE_DEMO_ROOT_URL} is the production root.</li>
              <li>Ready for the Devpost demo-link field.</li>
            </ul>
            <button className="brief-copy-button" type="button" onClick={handleLiveDemoCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy live demo URL
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {liveDemoCopyStatus}
            </p>
          </section>
          <section className="automation-plan" aria-label="MCP launch plan">
            <span className="eyebrow">MCP launch plan</span>
            <ul>
              {launchAutomationLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button className="brief-copy-button" type="button" onClick={handleLaunchPlanCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy launch plan
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {launchPlanCopyStatus}
            </p>
          </section>
        </div>
      )}
      {activeTab === 'script' && (
        <div
          id="submission-panel-script"
          role="tabpanel"
          aria-labelledby="submission-tab-script"
        >
          <section className="demo-script" aria-label="Demo script">
            <span className="eyebrow">Demo script</span>
            <ol>
              {demoScriptSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <button className="brief-copy-button" type="button" onClick={handleScriptCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy demo script
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {scriptCopyStatus}
            </p>
          </section>
          <section className="proof-reel" aria-label="Proof reel">
            <span className="eyebrow">Proof reel</span>
            <video
              className="proof-reel-video"
              controls
              muted
              playsInline
              preload="metadata"
              src={PROOF_REEL_ASSET_PATH}
            >
              The hosted proof reel shows the live Afterimage judge path.
            </video>
            <ul>
              {proofReelLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <a className="brief-link" href={PROOF_REEL_ASSET_PATH}>
              Open hosted proof reel
            </a>
            <button className="brief-copy-button" type="button" onClick={handleProofReelCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy proof reel brief
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {proofReelCopyStatus}
            </p>
          </section>
          <section className="media-kit" aria-label="Submission media kit">
            <span className="eyebrow">Submission media kit</span>
            <ul>
              {mediaKitLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button className="brief-copy-button" type="button" onClick={handleMediaKitCopy}>
              <Copy size={16} aria-hidden="true" />
              Copy media kit
            </button>
            <p className="brief-copy-status" aria-live="polite">
              {mediaKitCopyStatus}
            </p>
          </section>
        </div>
      )}
    </section>
  )
}
