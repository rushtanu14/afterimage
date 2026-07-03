# Afterimage

Turn a folder of photos into a living memory-space anchored to a real place.

Artist statement: verified photos become an evolving place-memory; code turns GPS, color, time, and brush motion into the artwork.

The current build is a demo-first Santa Cruz Beach Boardwalk / Main Beach experience for hackathon judging. It works without any AI provider or paid map API:

- Folder import with JPEG/PNG/WebP analysis and HEIC best-effort messaging.
- Metadata confidence states: Verified, Partial, Manual.
- Local color, brightness, warmth, sky, water, and sand signal extraction.
- Interactive Canvas 2D memory-space with parallax drag and permanent low-opacity residue.
- Evolving composed canvas state after the final artwork appears.
- Undo, Reset, and Auto-compose controls.
- Transformation Engine panel that makes the photo -> signal -> living-scene computation visible.
- Live computation receipt showing photo evidence -> pixel sampling -> render recipe -> motion delta -> evolving output.
- Tabbed submission pack with scorecard, proof, source, and script views for Devpost review.
- Live medium proof showing how the artwork responds, evolves, and engages users.
- Prize fit section targeting Best Interactive Experience, Most Unique, and Best Overall Project.
- Devpost requirements checklist for demo, public source, written description, and attribution readiness.
- Build-period proof reminder for the public repo and Devpost submission.
- MCP launch plan for GitHub, Vercel, demo-video, and Devpost submission ops.
- Copyable judge link that turns the current deployment origin into `/?judge=1`.
- Desktop judge layout keeps the living artwork in frame while reviewers scan the submission pack.
- Copyable attribution block for the required third-party assets, libraries, and optional APIs.
- Copyable implementation receipt that explains the computation pipeline behind the art.
- Copyable source handoff for the public repository submission step.
- Copyable demo recording script for a tight 45-second walkthrough.
- Copyable submission media kit for cover screenshot, proof/source screenshots, PNG artifact, and walkthrough video.
- Final exhibit label after Auto-compose, naming the generated artwork and its evidence trail.
- One-click judge demo that runs the full transformation path without requiring manual brush input.
- PNG export with title, evidence trail, artist statement, computation note, and motion delta for the submission gallery.
- Prepared Santa Cruz sample folder at `public/demo/santa-cruz-demo-photos`.
- Hidden developer source picker for Mapillary, Panoramax, KartaView, and Manual fallback.

## Judge path

1. Open `/?judge=1` on the deployed site, or press `Run judge demo` for the one-click finished artwork.
2. Read the generated exhibit label and evidence trail.
3. Read the Transformation Engine computation receipt to see how photo evidence and brush motion become the rendered artwork.
4. Open the Script tab in the submission panel.
5. Open the Source tab to review the Devpost requirements checklist.
6. On desktop, keep the living artwork visible while scrolling the submission pack.
7. Copy the judge link, save the contextual PNG artifact, and copy the Devpost package.

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

Computation receipt: The Transformation Engine shows the live chain from photo evidence to pixel sampling, render recipe, motion delta, and evolving output, so judges can see the algorithm that makes the artwork.

Live medium proof:
- Responds: brush motion and parallax reshape the scene.
- Evolves: the composed Canvas keeps changing after the final exhibit appears.
- Engages: the judge path produces a named exhibit, proof trail, and exportable PNG artifact.

Demo link: Use the deployed site with `/?judge=1` to open directly on the final Santa Cruz Afterimage exhibit.

Source handoff: Public repo should include `src/`, `public/demo/`, `scripts/`, `tests/`, `README.md`, `package.json`, `package-lock.json`, and the Vite/TypeScript/Vitest/Playwright config files. Public repo history should preserve the July 1 to August 1, 2026 build window. Exclude `node_modules`, `dist`, and local screenshots. Run `npm run test`, `npm run build`, `npm run test:e2e`, and `npm audit --json` before submitting.

MCP launch plan:
- Composio MCP belongs in submission ops, not the browser runtime.
- GitHub MCP: publish the public source repository and preserve July 1 to August 1 build history.
- Vercel connector: deploy the static build and verify `/?judge=1`.
- Canva or recording workflow: assemble screenshots and the 45-second demo video.
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

0:08 Name the artwork: Afterimage turns verified Santa Cruz photos into an evolving place-memory.

0:14 Point to the canvas proof overlay and final exhibit label.

0:20 Show the Computation receipt: photo evidence becomes pixel sampling, render recipe, motion delta, and evolving output.

0:28 Show the Live medium proof: responds, evolves, and engages.

0:35 Show the scorecard, save PNG, and copy the Devpost package.

0:42 Close with the theme: this art depends on code, metadata, computation, and motion.

## Submission media kit

- Cover screenshot: final Santa Cruz Afterimage canvas with the exhibit label visible.
- Proof screenshot: Computation receipt plus Live medium proof visible in the judge path.
- Source screenshot: Devpost requirements and MCP launch plan visible in the Source tab.
- Artifact: exported `afterimage-santa-cruz-memory-space.png` with title, evidence, computation note, and motion delta.
- Video: 45-second walkthrough following the Script tab timing.

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
npm audit --json
```

The Playwright suite covers Chromium, mobile Chromium, desktop WebKit, and mobile WebKit.
