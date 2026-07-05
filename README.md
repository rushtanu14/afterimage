# Afterimage

Turn a folder of photos into a living memory-space anchored to a real place.

Artist statement: verified photos become an evolving place-memory; code turns GPS, color, time, and brush motion into the artwork.

The current build is a demo-first Santa Cruz Beach Boardwalk / Main Beach experience for hackathon judging. It works without any AI provider or paid map API:

- Folder import with JPEG/PNG/WebP analysis and HEIC best-effort messaging.
- Metadata confidence states: Verified, Partial, Manual.
- Local color, brightness, warmth, sky, water, and sand signal extraction.
- Interactive Canvas 2D memory-space with parallax drag and permanent low-opacity residue.
- Evolving composed canvas state after the final artwork appears.
- Exhibit mode that lets judges hide the proof dashboard and view the living artwork as an immersive gallery piece.
- Undo, Reset, and Auto-compose controls.
- Transformation Engine panel that makes the photo -> signal -> living-scene computation visible.
- Live computation receipt showing photo evidence -> pixel sampling -> render recipe -> motion delta -> evolving output.
- Tabbed submission pack with scorecard, proof, source, and script views for Devpost review.
- Live medium proof showing how the artwork responds, evolves, and engages users.
- Prize fit section targeting Best Interactive Experience, Most Unique, and Best Overall Project.
- Devpost requirements checklist for demo, public source, written description, and attribution readiness.
- Build-period proof reminder for the public repo and Devpost submission.
- MCP launch plan for GitHub source verification, Vercel deployment, demo-video, and Devpost submission ops.
- Copyable live demo URL for the production judge path at `https://afterimage-omega.vercel.app/?judge=1`.
- Always-visible judge evidence strip for live demo, proof reel, source, and Devpost copy.
- Hosted proof reel video at `https://afterimage-omega.vercel.app/submission/afterimage-proof-reel.webm`.
- Copyable judge link that turns the current deployment origin into `/?judge=1`.
- Skippable Guided reveal on the judge path that shows source photos, extracted signals, and a first-viewport Leave an afterimage gesture on the living Canvas before the dashboard.
- Desktop judge layout keeps the living artwork in frame while reviewers scan the submission pack.
- Copyable attribution block for the required third-party assets, libraries, and optional APIs.
- Copyable implementation receipt that explains the computation pipeline behind the art.
- Copyable source handoff for the public repository submission step.
- Copyable demo recording script and Proof Reel brief for a tight sub-50-second judge video.
- Copyable submission media kit for cover screenshot, proof/source screenshots, PNG artifact, and proof reel video.
- Final exhibit label after Auto-compose, naming the generated artwork and its evidence trail.
- One-click judge demo that runs the full transformation path without requiring manual brush input.
- PNG export with title, evidence trail, artist statement, computation note, and motion delta for the submission gallery.
- Prepared Santa Cruz sample folder at `public/demo/santa-cruz-demo-photos`.
- Hidden developer source picker for Mapillary, Panoramax, KartaView, and Manual fallback.

## Judge path

1. Open `https://afterimage-omega.vercel.app/?judge=1`, or press `Run judge demo` locally for the one-click finished artwork.
2. Use the Guided reveal to move from source photos to extracted signals, then tap or drag the imprint pad to Leave an afterimage before the dashboard.
3. Read the generated exhibit label and evidence trail.
4. Press `Enter exhibit mode` to view the living artwork without the proof dashboard taking over the experience.
5. Read the Transformation Engine computation receipt to see how photo evidence and brush motion become the rendered artwork.
6. Open the Script tab in the submission panel.
7. Open the Source tab to review the Devpost requirements checklist.
8. On desktop, keep the living artwork visible while scrolling the submission pack.
9. Copy the Proof Reel brief, judge link, contextual PNG artifact, and Devpost package.

For the slower proof path, load the Santa Cruz demo folder, enter the memory-space, drag across the canvas, and Auto-compose the residue into one scene.

Afterimage is aimed at Hack the Arts: it is not a drawing app or a static gallery. The artwork is computed from place evidence, timestamps, color ratios, metadata confidence, and user motion, then becomes a changing canvas artifact that could not exist without code.

## Attribution

- Demo photos are procedural generated assets in `public/demo/santa-cruz-demo-photos`.
- Optional place-source lookups reference Mapillary, Panoramax, and KartaView when coverage exists.
- Runtime libraries include React, TypeScript, Canvas 2D browser APIs, `exifr`, and `lucide-react`.
- No paid map, AI, or proprietary image provider is required for the judge demo.

## Devpost package

Title: Afterimage

Tagline: Turn verified place photos into an evolving memory-space.

Description: Afterimage is a computational artwork for Hack the Arts. It transforms a folder of Santa Cruz beach photos into a living place-memory by extracting metadata confidence, GPS proximity, timestamps, color palettes, sky/water/sand ratios, and brush motion. The result is not a filter or a static gallery: the canvas keeps evolving after composition, and the final exhibit label preserves the evidence trail behind the artwork.

Built with: React, TypeScript, Canvas 2D, EXIF parsing, local image color sampling, procedural demo assets, and optional Mapillary / Panoramax / KartaView place-source lookups.

Implementation: EXIF, GPS, and timestamps become confidence and place evidence. Browser pixel sampling becomes sky, water, sand, warmth, haze, and palette ratios. Brush motion and time phase keep the Canvas scene evolving after composition.

Guided reveal: The judge path opens with a skippable source-to-canvas reveal that shows verified photos, extracted visual signals, and a first-viewport Leave an afterimage gesture on the living Canvas before the proof dashboard.

Computation receipt: The Transformation Engine shows the live chain from photo evidence to pixel sampling, render recipe, motion delta, and evolving output, so judges can see the algorithm that makes the artwork.

Live medium proof:
- Responds: brush motion and parallax reshape the scene.
- Evolves: the composed Canvas keeps changing after the final exhibit appears.
- Engages: the judge path produces a named exhibit, proof trail, and exportable PNG artifact.
- Exhibit mode: judges can hide the proof dashboard and view the living artwork as an immersive gallery piece.

Demo link: Use `https://afterimage-omega.vercel.app/?judge=1` to open directly on the final Santa Cruz Afterimage exhibit.

Proof reel: Use `https://afterimage-omega.vercel.app/submission/afterimage-proof-reel.webm` for the hosted sub-50-second proof reel, or record a fresh walkthrough from `https://afterimage-omega.vercel.app/?judge=1`. Show cursor drag, computation receipt, Exhibit mode, evolving canvas, PNG export, live demo URL, public source URL, attribution, and Devpost copy in one continuous walkthrough.

Source handoff: Devpost source URL is `https://github.com/rushtanu14/afterimage`. Public repo history from `1f2e060` onward preserves the July 1 to August 1, 2026 build window. The repo includes `src/`, `public/demo/`, `scripts/`, `tests/`, `README.md`, `package.json`, `package-lock.json`, and the Vite/TypeScript/Vitest/Playwright config files. It excludes `node_modules`, `dist`, and local screenshots. Run `npm run test`, `npm run build`, `npm run test:e2e`, and `npm audit --json` before submitting.

MCP launch plan:
- Composio MCP belongs in submission ops, not the browser runtime.
- GitHub MCP: verify the public source repository and preserve July 1 to August 1 build history.
- Vercel connector: production demo is live at `https://afterimage-omega.vercel.app/?judge=1`.
- Canva or recording workflow: assemble screenshots and the sub-50-second proof reel.
- Devpost package: paste the copied description, source URL, attribution, and demo video.

Attribution: Demo photos are procedural generated assets in `public/demo/santa-cruz-demo-photos`. Runtime libraries include React, TypeScript, Canvas 2D browser APIs, `exifr`, and `lucide-react`. Optional street-image provider lookups reference Mapillary, Panoramax, and KartaView only where coverage exists. No paid map, AI, or proprietary image provider is required for the judge demo.

Judging fit:
- Creativity & Originality (30%): place evidence becomes an evolving memory-space, not a conventional filter.
- Use of Technology (25%): EXIF/GPS, image sampling, and Canvas rendering create the art system.
- Interactivity & Experience (20%): users import photos, confirm place anchors, paint residue, and auto-compose the final artwork.
- Execution (15%): one-click judge demo, PNG export, responsive layout, and automated cross-browser coverage.
- Theme Alignment (10%): the artwork depends on code, metadata, computation, and motion.

Prize fit:
- Best Interactive Experience: import, confirm, paint, auto-compose, and export a living scene in one judge path.
- Most Unique: place evidence, metadata confidence, and brush motion become the art medium.
- Best Overall Project: complete demo story, source handoff, attribution, and verification are packaged together.

## Demo script

0:00 Run judge demo.

0:04 Use the Guided reveal: source evidence, extracted signals, and Leave an afterimage on the living canvas.

0:08 Name the artwork: Afterimage turns verified Santa Cruz photos into an evolving place-memory.

0:14 Point to the canvas proof overlay and final exhibit label.

0:20 Show the Computation receipt: photo evidence becomes pixel sampling, render recipe, motion delta, and evolving output.

0:28 Show the Live medium proof: responds, evolves, and engages.

0:35 Enter Exhibit mode so the artwork takes over the viewport.

0:42 Show the scorecard, save PNG, and copy the Devpost package.

0:45 Close with the theme: this art depends on code, metadata, computation, and motion.

## Proof reel brief

- Record the deployed judge path: `https://afterimage-omega.vercel.app/?judge=1`.
- Hosted asset: `https://afterimage-omega.vercel.app/submission/afterimage-proof-reel.webm`.
- Opening frame: the Santa Cruz Afterimage exhibit is already alive, with the live URL visible.
- Guided reveal: scrub source evidence, extracted signals, and Leave an afterimage before skipping into the proof dashboard.
- Interaction proof: show cursor drag, computation receipt, evolving canvas, export, and source proof.
- 0:00 Open the live judge path and name the project.
- 0:04 Use the Guided reveal to compress the transformation story and Leave an afterimage.
- 0:08 Show the canvas proof overlay and exhibit label.
- 0:14 Drag the scene or run the judge demo so the art visibly responds.
- 0:22 Show the Computation receipt and Live medium proof.
- 0:32 Enter Exhibit mode, then save the PNG artifact and open the Source tab.
- 0:40 Show the public source URL, live demo URL, attribution, and Devpost copy.
- Upload target: Devpost demo video or linked walkthrough asset.

## Submission media kit

- Cover screenshot: Exhibit mode with the final Santa Cruz Afterimage canvas and exhibit label visible.
- Proof screenshot: Computation receipt plus Live medium proof visible in the judge path.
- Source screenshot: Devpost requirements, live demo URL, source repository, and MCP launch plan visible in the Source tab.
- Artifact: exported `afterimage-santa-cruz-memory-space.png` with title, evidence, computation note, and motion delta.
- Video: hosted sub-50-second proof reel with live URL, cursor input, computation receipt, Exhibit mode, evolving canvas, export, and source proof visible.

## Run

```bash
npm install
npm run generate:demo
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Verify

```bash
npm run test
npm run build
npm run test:e2e
npm run record:proof-reel
npm audit --json
```

The Playwright suite covers Chromium, mobile Chromium, desktop WebKit, and mobile WebKit.

Run the deployed judge-path smoke with:

```bash
PLAYWRIGHT_BASE_URL=https://afterimage-omega.vercel.app npx playwright test tests/app.spec.ts -g "judge presentation URL opens directly" --project=chromium
```
