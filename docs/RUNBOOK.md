# Runbook

This runbook covers operating and submitting Afterimage as a static Vite application.

## Deployment Procedure

<!-- AUTO-GENERATED -->
Generated from `package.json`, Vite config, Playwright config, and current project structure.

1. Install dependencies with `npm install`.
2. Regenerate prepared demo assets with `npm run generate:demo`.
3. Run unit verification with `npm run test`.
4. Run production build verification with `npm run build`.
5. Run browser verification with `npm run test:e2e`.
6. Deploy the generated `dist/` directory to the static host.
7. Open `https://afterimage-omega.vercel.app/` and `https://afterimage-omega.vercel.app/?judge=1`.
8. Use the Source tab MCP launch plan for GitHub repo verification, Vercel deployment, proof-reel capture, and Devpost handoff.
9. Copy `https://afterimage-omega.vercel.app/?judge=1` into the Devpost demo link field, use Exhibit mode for the cover/hero screenshot, then use the Script tab Proof Reel player or `https://afterimage-omega.vercel.app/submission/afterimage-proof-reel.webm` for the recorded walkthrough and `/submission/afterimage-proof-reel-poster.png` for the thumbnail/title card if Devpost asks for one.
<!-- /AUTO-GENERATED -->

## Health Checks

<!-- AUTO-GENERATED -->
Generated from app routes and test coverage.

| Check | Expected result |
|-------|-----------------|
| `/` | App shell loads with the Afterimage header and `Run judge demo` control. |
| `/?judge=1` | The judge path opens with a skippable Guided reveal and the final composed Santa Cruz Afterimage state. |
| `https://afterimage-omega.vercel.app/?judge=1` | Production judge path opens with the Guided reveal, final exhibit label, and composed canvas state. |
| Guided reveal | Source evidence, extracted signals, and Leave an afterimage steps are visible, skippable, mutate the canvas, and do not create horizontal overflow. |
| Exhibit mode | `Enter exhibit mode` hides the proof dashboard and presents the living artwork as an immersive gallery view. |
| Computation receipt | Transformation Engine shows photo evidence, pixel sampling, render recipe, motion delta, and evolving output. |
| Judge evidence strip | Submission panel shows live demo, proof reel, source, and Devpost copy proof before the tabbed details. |
| Proof reel brief | Script tab gives a copyable sub-50-second recording brief with Guided reveal, Leave an afterimage, live URL, cursor input, computation receipt, Exhibit mode, evolving canvas, export, and source proof. |
| Hosted proof reel | `/submission/afterimage-proof-reel.webm` returns `video/webm`, opens with a nonblank title card, and plays as the public proof-reel asset. |
| Proof reel poster | `/submission/afterimage-proof-reel-poster.png` returns `image/png` and gives Devpost a nonblank thumbnail/title-card fallback. |
| Browser console | No warnings or errors during the judge path. |
| Layout overflow | `document.documentElement.scrollWidth - window.innerWidth` is `0` or within 1px. |
| Export | `Save memory-space PNG` downloads `afterimage-santa-cruz-memory-space.png` with title, evidence, computation note, and motion delta. |
<!-- /AUTO-GENERATED -->

There are no API health endpoints in the current app because it is a client-only static build.

## Common Issues

| Issue | Fix |
|-------|-----|
| Demo photos are missing or stale. | Run `npm run generate:demo`, then verify `public/demo/santa-cruz-demo-photos/`. |
| E2E cannot bind port `5173`. | Stop the existing local server or let Playwright reuse it when not running in CI. |
| Judge link opens the normal app state. | Confirm the URL includes `/?judge=1` exactly. |
| PNG export does not start. | Load the demo or run judge mode first so the canvas has photo evidence. |
| Build period proof is missing. | Keep public repo history and Devpost notes aligned with the July 1 to August 1, 2026 build window. |
| MCP integration starts pulling secrets into the browser app. | Keep Composio/GitHub/Vercel tooling in submission ops; do not ship API keys or OAuth config in the static runtime. |
| Devpost media assets are incomplete. | Use the Script tab media kit, Proof Reel player, and `npm run record:proof-reel` to refresh the cover screenshot, proof/source screenshots, exported PNG artifact, and hosted proof reel. |
| Cover screenshot still looks like an operations dashboard. | Open `/?judge=1`, press `Enter exhibit mode`, then capture the immersive canvas view. |
| Public source requirement needs proof. | Use the Source tab `Source repository` card and `https://github.com/rushtanu14/afterimage` for the Devpost source-code field. |
| Live demo requirement needs proof. | Use the Source tab `Live demo` card and verify `https://afterimage-omega.vercel.app/?judge=1` with `PLAYWRIGHT_BASE_URL=https://afterimage-omega.vercel.app npx playwright test tests/app.spec.ts -g "judge presentation URL opens directly" --project=chromium`. |

## Rollback

For a static deployment, rollback by redeploying the last known-good `dist/` artifact or reverting the hosting provider to the previous successful deployment. After rollback, re-open `/?judge=1` and confirm the exhibit label, canvas, submission pack, and PNG export still work.

## Monitoring And Escalation

Monitor the deployed judge path manually before submission:

- Browser console warnings/errors.
- Broken demo assets under `public/demo/santa-cruz-demo-photos/`.
- Mobile and desktop overflow.
- Devpost links for demo, source, attribution, and recorded proof reel.

Escalate any broken deployed demo, source repository visibility issue, or Devpost submission issue before the Hack the Arts deadline. These are external submission blockers, not local app bugs.

## Staleness Review

<!-- AUTO-GENERATED -->
Generated from Markdown file modification dates during this docs update.

| Document | Last modified | Status |
|----------|---------------|--------|
| `README.md` | 2026-07-05 | Current. |
| `public/demo/santa-cruz-demo-photos/README.md` | 2026-07-01 | Current. |
| `docs/CONTRIBUTING.md` | 2026-07-05 | Current. |
| `docs/RUNBOOK.md` | 2026-07-05 | Current. |
<!-- /AUTO-GENERATED -->
