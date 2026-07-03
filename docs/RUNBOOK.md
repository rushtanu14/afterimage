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
7. Open the deployed root path and `/?judge=1`.
8. Use the Source tab MCP launch plan for GitHub repo publishing, Vercel deployment, demo-video capture, and Devpost handoff.
9. Copy the deployed `/?judge=1` URL into the Devpost demo link field, or use it as the source for the recorded walkthrough.
<!-- /AUTO-GENERATED -->

## Health Checks

<!-- AUTO-GENERATED -->
Generated from app routes and test coverage.

| Check | Expected result |
|-------|-----------------|
| `/` | App shell loads with the Afterimage header and `Run judge demo` control. |
| `/?judge=1` | The Santa Cruz Afterimage exhibit opens directly in the final composed state. |
| Computation receipt | Transformation Engine shows photo evidence, pixel sampling, render recipe, motion delta, and evolving output. |
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
| Devpost media assets are incomplete. | Use the Script tab media kit to capture the cover screenshot, proof/source screenshots, exported PNG artifact, and 45-second walkthrough video. |
| Public source requirement is not ready. | Publish a public repository containing `src/`, `public/demo/`, `scripts/`, tests, configs, and docs while excluding generated build output and dependencies. |

## Rollback

For a static deployment, rollback by redeploying the last known-good `dist/` artifact or reverting the hosting provider to the previous successful deployment. After rollback, re-open `/?judge=1` and confirm the exhibit label, canvas, submission pack, and PNG export still work.

## Monitoring And Escalation

Monitor the deployed judge path manually before submission:

- Browser console warnings/errors.
- Broken demo assets under `public/demo/santa-cruz-demo-photos/`.
- Mobile and desktop overflow.
- Devpost links for demo, source, attribution, and recorded video.

Escalate any broken deployed demo, source repository visibility issue, or Devpost submission issue before the Hack the Arts deadline. These are external submission blockers, not local app bugs.

## Staleness Review

<!-- AUTO-GENERATED -->
Generated from Markdown file modification dates during this docs update.

| Document | Last modified | Status |
|----------|---------------|--------|
| `README.md` | 2026-07-02 | Current. |
| `public/demo/santa-cruz-demo-photos/README.md` | 2026-07-01 | Current. |
| `docs/CONTRIBUTING.md` | 2026-07-02 | Created by this workflow. |
| `docs/RUNBOOK.md` | 2026-07-02 | Created by this workflow. |
<!-- /AUTO-GENERATED -->
