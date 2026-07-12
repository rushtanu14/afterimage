# Contributing

Afterimage is a React, TypeScript, Vite, Canvas 2D app for the Hack the Arts judge demo. Keep documentation aligned with source files, especially `package.json`, test configs, and the prepared demo asset folder.

## Development Setup

Prerequisites:

- Node.js with npm.
- Playwright browser binaries available for Chromium and WebKit.

Install and run locally:

```bash
npm install
npm run generate:demo
npm run dev
```

Open `http://127.0.0.1:5173/`. Use `http://127.0.0.1:5173/?judge=1` for the direct judge presentation state.

## Source Of Truth

<!-- AUTO-GENERATED -->
Generated from the current repository source inventory.

| Source | Status | Documentation impact |
|--------|--------|----------------------|
| `package.json` scripts | Present | Generates the command reference below. |
| `.env.example` / `.env.template` / `.env.sample` | Not present | No environment variables are documented for this app. |
| `openapi.yaml` / `openapi.yml` / route files | Not present | No API endpoint reference is generated. |
| Source code exports in `src/` | Present | The app surface is internal React components and utilities, not a published package API. |
| `Dockerfile` / `docker-compose.yml` | Not present | No container setup is documented. |
<!-- /AUTO-GENERATED -->

## Command Reference

<!-- AUTO-GENERATED -->
Generated from `package.json`.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server on `127.0.0.1`. |
| `npm run build` | Type-check the project with `tsc -b` and create the production Vite build. |
| `npm run preview` | Preview the production build locally on `127.0.0.1`. |
| `npm run lint` | Run Oxlint across the repository. |
| `npm run test` | Run the Vitest unit suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Run the Playwright end-to-end suite across desktop and mobile browser projects. |
| `npm run test:e2e:ci` | Run the Chromium judge-flow subset used by GitHub CI. |
| `npm run record:proof-reel` | Record the hosted proof-reel WebM from the judge path. |
| `npm run generate:demo` | Regenerate the prepared Santa Cruz demo PNG assets. |
<!-- /AUTO-GENERATED -->

## Testing

Run fast local verification before changing behavior:

```bash
npm run test
```

Run full browser verification before treating judge-facing changes as done:

```bash
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://afterimage-omega.vercel.app npx playwright test tests/app.spec.ts -g "judge presentation URL opens directly" --project=chromium
```

Unit tests live under `src/**/*.test.ts`. End-to-end coverage lives in `tests/app.spec.ts` and should keep assertions scoped to accessible roles, labels, and the judge path where possible.

## Code Style

Use TypeScript and the existing React component patterns. Run:

```bash
npm run lint
```

Keep generated assets out of source edits unless the demo image generator intentionally changed. Do not commit `node_modules`, `dist`, `test-results`, or local screenshots.

## Pull Request Checklist

- Judge path `/?judge=1` still reaches the final exhibit state.
- README and docs match source-of-truth files.
- `npm run test` passes.
- `npm run build` passes.
- `npm run lint` passes.
- `npm run test:e2e` passes or any skipped browser project is explained.
- GitHub CI passes its Chromium judge-flow gate.
- Deployed judge-path smoke passes against `https://afterimage-omega.vercel.app`.
- `npm audit --json` shows zero vulnerabilities before public submission.
