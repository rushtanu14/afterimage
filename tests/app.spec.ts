import { expect, test, type Locator, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const demoFolder = resolve(process.cwd(), 'public/demo/santa-cruz-demo-photos')
const proofReelPath = '/submission/afterimage-proof-reel.mp4'
const proofReelWebmPath = '/submission/afterimage-proof-reel.webm'
const proofReelPosterPath = '/submission/afterimage-proof-reel-poster.png'

const canvasSnapshot = async (canvas: Locator) =>
  canvas.evaluate((node) => {
    const element = node as HTMLCanvasElement
    const context = element.getContext('2d')
    if (!context) {
      return { width: 0, height: 0, colored: 0, checksum: 0 }
    }

    const data = context.getImageData(0, 0, element.width, element.height).data
    const step = Math.max(4, Math.floor(data.length / 3_000))
    let colored = 0
    let checksum = 0

    for (let index = 0; index < data.length; index += step) {
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const a = data[index + 3]

      if (a > 0 && (r < 245 || g < 245 || b < 245)) {
        colored += 1
      }

      checksum = (checksum + r * 3 + g * 5 + b * 7 + a) % 1_000_000_007
    }

    return {
      width: element.width,
      height: element.height,
      colored,
      checksum,
    }
  })

const testCanvasLocator = (page: Page) => page.getByTestId('memory-canvas')

const waitForPaintedCanvas = async (canvas: Locator) => {
  let latest = await canvasSnapshot(canvas)

  await expect
    .poll(
      async () => {
        latest = await canvasSnapshot(canvas)
        return latest.colored
      },
      { timeout: 5_000 },
    )
    .toBeGreaterThan(100)

  return latest
}

const openScriptTab = async (page: Page) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await page.getByRole('tab', { name: 'Script' }).click()
}

test('submission panel offers a copyable demo recording script', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const evidenceStrip = page.getByRole('region', { name: /judge evidence strip/i })
  await expect(evidenceStrip).toContainText(/Run live demo/i)
  await expect(evidenceStrip).toContainText(/Proof reel/i)
  await expect(evidenceStrip).toContainText(/Sub-50-second proof/i)
  await expect(evidenceStrip).toContainText(/View source/i)

  await page.getByRole('tab', { name: 'Script' }).click()
  const demoScript = page.getByRole('region', { name: /demo script/i })
  await expect(demoScript).toContainText(/0:00 Run judge demo/i)
  await expect(demoScript).toContainText(/0:20 Show the Computation receipt/i)
  await expect(demoScript).toContainText(/0:28 Show the Live medium proof/i)
  await expect(demoScript).toContainText(/0:35 Enter Exhibit mode/i)
  await expect(demoScript).toContainText(/0:42 Show the scorecard, save PNG, and copy the Devpost package/i)

  await page.getByRole('button', { name: /copy demo script/i }).click()
  await expect(demoScript).toContainText(/Demo script copied/i)
})

test('submission panel offers hosted proof reel evidence', async ({ page }) => {
  await openScriptTab(page)

  const proofReel = page.getByRole('region', { name: /proof reel/i })
  await expect(proofReel).toContainText(/Sub-50-second proof reel/i)
  await expect(proofReel).toContainText(/Hosted MP4 proof reel/i)
  await expect(proofReel).toContainText(/WebM fallback/i)
  await expect(proofReel).toContainText(/Record the deployed judge path/i)
  await expect(proofReel).toContainText(/Title card shows the live judge URL/i)
  await expect(proofReel).toContainText(/Leave an afterimage/i)
  await expect(proofReel).toContainText(/https:\/\/afterimage-omega\.vercel\.app\/\?judge=1/i)
  await expect(proofReel.locator('video')).toHaveAttribute('poster', proofReelPosterPath)
  await expect(proofReel.locator('video')).toHaveAttribute('preload', 'none')
  await expect(proofReel.locator('video source').nth(0)).toHaveAttribute('src', proofReelPath)
  await expect(proofReel.locator('video source').nth(0)).toHaveAttribute('type', 'video/mp4')
  await expect(proofReel.locator('video source').nth(1)).toHaveAttribute('src', proofReelWebmPath)
  await expect(proofReel.locator('video source').nth(1)).toHaveAttribute('type', 'video/webm')
  await expect(
    proofReel.getByRole('link', { name: /open hosted proof reel/i }),
  ).toHaveAttribute('href', proofReelPath)
  await expect(proofReel).toContainText(/Show cursor drag, computation receipt, evolving canvas, export, and source proof/i)
  await expect(proofReel).toContainText(/Enter Exhibit mode/i)
  await page.getByRole('button', { name: /copy proof reel brief/i }).click()
  await expect(proofReel).toContainText(/Proof reel brief copied/i)
})

test('submission panel offers a copyable media kit', async ({ page }) => {
  await openScriptTab(page)

  const mediaKit = page.getByRole('region', { name: /submission media kit/i })
  await expect(mediaKit).toContainText(/Cover screenshot/i)
  await expect(mediaKit).toContainText(/Exhibit mode/i)
  await expect(mediaKit).toContainText(/final Santa Cruz Afterimage canvas/i)
  await expect(mediaKit).toContainText(/Proof screenshot/i)
  await expect(mediaKit).toContainText(/Source screenshot/i)
  await expect(mediaKit).toContainText(/motion delta/i)
  await expect(mediaKit).toContainText(/sub-50-second proof reel/i)
  await expect(mediaKit).toContainText(/URL-visible title card/i)
  await page.getByRole('button', { name: /copy media kit/i }).click()
  await expect(mediaKit).toContainText(/Media kit copied/i)
})

test('submission panel copies the current judge presentation URL', async ({ page }) => {
  await page.goto('/')

  const submissionBrief = page.getByRole('region', { name: /submission brief/i })
  const expectedJudgeUrl = `${new URL(page.url()).origin}/?judge=1`
  await page.getByRole('button', { name: /copy judge link/i }).click()
  await expect(submissionBrief).toContainText(`Judge link copied: ${expectedJudgeUrl}`)
})

test('submission panel offers a copyable attribution block', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('tab', { name: 'Proof' }).click()
  const attributionBlock = page.getByRole('region', { name: /attribution block/i })
  await expect(attributionBlock).toContainText(/Demo photos: procedural generated assets/i)
  await expect(attributionBlock).toContainText(/Higgsfield Cinema Studio Image 2\.5/i)
  await expect(attributionBlock).toContainText(/Libraries: React, TypeScript, Canvas 2D, exifr, lucide-react/i)
  await expect(attributionBlock).toContainText(
    /Provider adapter slots: Mapillary, Panoramax, and KartaView; no live provider requests run in this build/i,
  )
  await expect(attributionBlock).toContainText(/No runtime AI call or paid map API/i)

  await page.getByRole('button', { name: /copy attribution/i }).click()
  await expect(attributionBlock).toContainText(/Attribution copied/i)
})

test('submission panel offers a copyable implementation receipt', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('tab', { name: 'Proof' }).click()
  const implementationReceipt = page.getByRole('region', { name: /implementation receipt/i })
  await expect(implementationReceipt).toContainText(/EXIF, GPS, and timestamps become confidence/i)
  await expect(implementationReceipt).toContainText(/pixel sampling becomes sky, water, sand, and palette ratios/i)
  await expect(implementationReceipt).toContainText(/brush motion and time phase keep the Canvas scene evolving/i)
  await expect(implementationReceipt).toContainText(/visible computation receipt links photo evidence/i)

  await page.getByRole('button', { name: /copy implementation receipt/i }).click()
  await expect(implementationReceipt).toContainText(/Implementation receipt copied/i)
})

test('submission panel offers a copyable source handoff', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('tab', { name: 'Source' }).click()
  const submissionRequirements = page.getByRole('region', { name: /devpost requirements/i })
  await expect(submissionRequirements).toContainText(/Working demo/i)
  const workingDemoRequirement = submissionRequirements
    .locator('li')
    .filter({ hasText: 'Working demo' })
  await expect(workingDemoRequirement).toContainText(/Ready/i)
  await expect(workingDemoRequirement).toContainText(
    /https:\/\/afterimage-omega\.vercel\.app\/\?judge=1/i,
  )
  await expect(submissionRequirements).toContainText(/Build period proof/i)
  await expect(submissionRequirements).toContainText(/July 1 to August 1, 2026 build window/i)
  await expect(submissionRequirements).toContainText(/Public source/i)
  await expect(submissionRequirements).toContainText(/Publicly accessible source code repository/i)
  const publicSourceRequirement = submissionRequirements
    .locator('li')
    .filter({ hasText: 'Public source' })
  await expect(publicSourceRequirement).toContainText(/Ready/i)
  await expect(publicSourceRequirement).toContainText(/https:\/\/github.com\/rushtanu14\/afterimage/i)
  await expect(submissionRequirements).toContainText(/Written description/i)
  await expect(submissionRequirements).toContainText(/Attribution/i)

  const sourceHandoff = page.getByRole('region', { name: /source handoff/i })
  await expect(sourceHandoff).toContainText(/Devpost requires demo, source, description, and attribution/i)
  await expect(sourceHandoff).toContainText(/Public repo history: public history from 1f2e060 onward preserves the July 1 to August 1, 2026 build window/i)
  await expect(sourceHandoff).toContainText(/Devpost source URL: https:\/\/github.com\/rushtanu14\/afterimage/i)
  await expect(sourceHandoff).toContainText(/Public repo should include src\/, public\/demo\/, scripts\/, tests\/, README.md, and package-lock.json/i)
  await expect(sourceHandoff).toContainText(/Exclude node_modules, dist, and local screenshots/i)
  await expect(sourceHandoff).toContainText(/Run npm run test, npm run build, npm run test:e2e, and npm audit --json before submitting/i)

  await page.getByRole('button', { name: /copy source handoff/i }).click()
  await expect(sourceHandoff).toContainText(/Source handoff copied/i)

  const sourceRepository = page.getByRole('region', { name: /source repository/i })
  await expect(sourceRepository).toContainText(/https:\/\/github.com\/rushtanu14\/afterimage/i)
  await expect(
    sourceRepository.getByRole('link', { name: /github.com\/rushtanu14\/afterimage/i }),
  ).toHaveAttribute('href', 'https://github.com/rushtanu14/afterimage')
  await page.getByRole('button', { name: /copy source url/i }).click()
  await expect(sourceRepository).toContainText(/Source URL copied/i)

  const liveDemo = page.getByRole('region', { name: /live demo/i })
  await expect(liveDemo).toContainText(/https:\/\/afterimage-omega\.vercel\.app\/\?judge=1/i)
  await expect(
    liveDemo.getByRole('link', { name: /afterimage-omega\.vercel\.app\/\?judge=1/i }),
  ).toHaveAttribute('href', 'https://afterimage-omega.vercel.app/?judge=1')
  await expect(
    liveDemo.getByRole('link', {
      name: 'https://afterimage-omega.vercel.app',
      exact: true,
    }),
  ).toHaveAttribute('href', 'https://afterimage-omega.vercel.app')
  await page.getByRole('button', { name: /copy live demo url/i }).click()
  await expect(liveDemo).toContainText(/Live demo URL copied/i)

  const launchPlan = page.getByRole('region', { name: /mcp launch plan/i })
  await expect(launchPlan).toContainText(/Composio MCP belongs in submission ops/i)
  await expect(launchPlan).toContainText(/GitHub MCP/i)
  await expect(launchPlan).toContainText(/Vercel connector/i)
  await expect(launchPlan).toContainText(/Devpost package/i)
  await page.getByRole('button', { name: /copy launch plan/i }).click()
  await expect(launchPlan).toContainText(/Launch plan copied/i)
})

test('hosted submission pack exposes judge handoff links', async ({ page }) => {
  await page.goto('/submission/index.html')

  await expect(page.getByRole('heading', { name: 'Afterimage' })).toBeVisible()
  await expect(page.getByText(/Hack the Arts submission pack/i)).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Live judge demo/i }),
  ).toHaveAttribute('href', '/?judge=1')
  await expect(
    page.getByRole('link', { name: /Hosted proof reel/i }),
  ).toHaveAttribute('href', proofReelPath)
  await expect(
    page.getByRole('link', { name: /WebM proof fallback/i }),
  ).toHaveAttribute('href', proofReelWebmPath)
  await expect(
    page.getByRole('link', { name: /Public source repository/i }),
  ).toHaveAttribute('href', 'https://github.com/rushtanu14/afterimage')
  await expect(page.getByRole('heading', { name: 'Judge Summary' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Written Project Description' })).toBeVisible()
  await expect(page.getByText(/The medium is the transformation itself/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Implementation Receipt' })).toBeVisible()
  await expect(page.getByText(/EXIF, GPS, and timestamps become confidence/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Judging Criteria Map' })).toBeVisible()
  await expect(page.getByText(/Creativity & Originality \(30%\)/i)).toBeVisible()
  await expect(page.getByText(/Theme Alignment \(10%\)/i)).toBeVisible()
  await expect(page.getByText(/Higgsfield Cinema Studio Image 2\.5/i)).toBeVisible()
  await expect(page.getByText(/No runtime AI call or paid map API/i)).toBeVisible()
})

test('judge path can switch from proof dashboard into immersive exhibit mode', async ({
  page,
}) => {
  await page.goto('/?judge=1')
  await expect(page.getByRole('status')).toContainText(/judge demo built/i)

  const exhibitTrigger = page.getByRole('button', { name: /enter exhibit mode/i })
  await exhibitTrigger.click()

  const exhibit = page.getByRole('dialog', { name: /santa cruz afterimage/i })
  await expect(exhibit).toBeVisible()
  await expect(exhibit).toContainText(/Santa Cruz Afterimage/i)
  await expect(exhibit).toContainText(/GPS, color, time, and brush motion/i)
  await expect(exhibit).toContainText(/evolving canvas/i)
  await expect(exhibit.getByTestId('memory-canvas')).toBeVisible()
  await expect(page.locator('.workspace')).toHaveAttribute('inert', '')

  await expect(page.getByRole('button', { name: /exit exhibit mode/i })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(exhibit.getByTestId('memory-canvas')).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: /exit exhibit mode/i })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(exhibit).toBeHidden()
  await expect(exhibitTrigger).toBeFocused()
  await expect(page.getByRole('region', { name: /submission brief/i })).toBeVisible()
})

test('Higgsfield plate adds responsive depth behind the living canvas', async ({ page }) => {
  await page.goto('/?judge=1')
  await expect(page.getByRole('status')).toContainText(/judge demo built/i)

  const scene = page.locator('.scene-shell').first()
  const plate = scene.getByTestId('cinematic-memory-plate')
  const canvas = scene.getByTestId('memory-canvas')

  await expect(plate).toHaveAttribute(
    'src',
    '/demo/afterimage-higgsfield-santa-cruz.webp',
  )
  await expect(plate).toHaveAttribute('aria-hidden', 'true')
  await expect
    .poll(() => plate.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThanOrEqual(1_600)
  await expect(canvas).toBeVisible()
  await canvas.scrollIntoViewIfNeeded()

  const beforeTransform = await plate.evaluate(
    (image) => window.getComputedStyle(image).transform,
  )
  const box = await canvas.boundingBox()
  expect(box).toBeTruthy()
  if (!box) {
    throw new Error('Living canvas bounds missing for Higgsfield depth test')
  }

  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.52)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.68, box.y + box.height * 0.62, {
    steps: 4,
  })
  await page.mouse.up()

  await expect
    .poll(() => plate.evaluate((image) => window.getComputedStyle(image).transform))
    .not.toBe(beforeTransform)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() => plate.evaluate((image) => window.getComputedStyle(image).transform))
    .toBe('none')
  await expect
    .poll(() => plate.evaluate((image) => window.getComputedStyle(image).transitionDuration))
    .toBe('0s')
})

test('judge path starts with a skippable guided source-to-canvas reveal', async ({
  page,
}) => {
  await page.goto('/?judge=1')
  await expect(page.getByRole('status')).toContainText(/judge demo built/i)

  const reveal = page.getByRole('region', { name: /guided reveal/i })
  await expect(reveal).toBeVisible()
  await expect(reveal).toBeInViewport({ ratio: 0.5 })
  await expect(reveal).toContainText(/source evidence/i)
  await expect(reveal).toContainText(/4 verified photos/i)
  await expect(reveal).toContainText(/4 GPS matches/i)

  await reveal.getByRole('button', { name: /extracted signals/i }).click()
  await expect(reveal).toContainText(/sky/i)
  await expect(reveal).toContainText(/water/i)
  await expect(reveal).toContainText(/sand/i)
  await expect(reveal).toContainText(/warmth/i)

  await reveal.getByRole('button', { name: /living canvas/i }).click()
  await expect(reveal).toContainText(/brush motion/i)
  await expect(reveal).toContainText(/time phase/i)
  await expect(reveal).toContainText(/evolving canvas/i)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  await reveal.getByRole('button', { name: /skip guided reveal/i }).click()
  await expect(reveal).toBeHidden()
  await expect(page.getByRole('button', { name: /enter exhibit mode/i })).toBeVisible()
})

test('judge path lets judges leave an afterimage from the first viewport', async ({
  page,
}) => {
  await page.goto('/?judge=1')
  await expect(page.getByRole('status')).toContainText(/judge demo built/i)

  const reveal = page.getByRole('region', { name: /guided reveal/i })
  await reveal.getByRole('button', { name: /living canvas/i }).click()
  await expect(reveal).toContainText(/leave an afterimage/i)
  await expect(reveal).toContainText(/tap or drag this pad/i)
  await expect(reveal).toContainText(/motion delta: 1 brush motion stroke/i)

  const canvas = testCanvasLocator(page)
  const before = await waitForPaintedCanvas(canvas)
  const imprintPad = reveal.getByLabel(/leave an afterimage gesture pad/i)
  await imprintPad.click()

  await expect(page.getByRole('status')).toContainText(/residue saved/i)
  await expect(reveal).toContainText(/motion delta: 2 brush motion strokes/i)
  const after = await canvasSnapshot(canvas)
  expect(after.checksum).not.toBe(before.checksum)

  const computationReceipt = page.getByRole('region', { name: /computation receipt/i })
  await computationReceipt.scrollIntoViewIfNeeded()
  await expect(computationReceipt).toContainText(/2 strokes -> residue changes brush phase/i)
})

test('submission panel exposes judging proof and keyboard tab navigation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: /living memory-space/i })).toBeVisible()
  await expect(page.getByText(/code turns GPS, color, time, and brush motion into the artwork/i)).toBeVisible()
  await expect(page.getByRole('region', { name: /submission brief/i })).toContainText(
    /React \+ TypeScript \/ Canvas 2D \/ EXIF and color sampling/i,
  )
  await expect(page.getByRole('region', { name: /submission brief/i })).toContainText(
    /Procedural demo photos; Manual provider only, with inactive open-provider adapter slots/i,
  )
  await expect(page.getByRole('region', { name: /live medium proof/i })).toContainText(
    /Responds/i,
  )
  await expect(page.getByRole('region', { name: /live medium proof/i })).toContainText(
    /Evolves/i,
  )
  await expect(page.getByRole('region', { name: /live medium proof/i })).toContainText(
    /Engages/i,
  )
  await expect(page.getByRole('region', { name: /judging fit/i })).toContainText(
    /Creativity & Originality \(30%\)/i,
  )
  await expect(page.getByRole('region', { name: /judging fit/i })).toContainText(
    /Interactivity & Experience \(20%\)/i,
  )
  await expect(page.getByRole('region', { name: /prize fit/i })).toContainText(
    /Best Interactive Experience/i,
  )
  await expect(page.getByRole('region', { name: /prize fit/i })).toContainText(/Most Unique/i)
  await expect(page.getByRole('region', { name: /prize fit/i })).toContainText(
    /Best Overall Project/i,
  )
  await expect(page.getByRole('tablist', { name: /submission pack/i })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Scorecard' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: 'Proof' }).click()
  await expect(page.getByRole('region', { name: /attribution block/i })).toBeVisible()
  await page.getByRole('tab', { name: 'Proof' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Source' })).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('tab', { name: 'Proof' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: 'Scorecard' }).click()
  await page.getByRole('button', { name: /copy devpost package/i }).click()
  await expect(page.getByRole('region', { name: /submission brief/i })).toContainText(
    /Devpost package copied/i,
  )
  await expect(page.getByRole('region', { name: /submission brief/i })).toContainText(
    /Exhibit mode/i,
  )
})

test('imports a folder, confirms confidence, paints, undoes, resets, and auto-composes', async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000)

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.getByTestId('provider-picker')).toBeHidden()
  await expect(page.getByText(/Photos stay in this browser/i)).toBeVisible()
  await expect(page.getByText('Load photos first')).toBeVisible()
  await expect(page.getByText('Awaiting folder / procedural base')).toBeVisible()

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /import folder/i }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(demoFolder)
  await expect(page.getByLabel('Import photo folder')).toHaveValue('')

  await expect(page.getByRole('button', { name: /confirm santa cruz anchor/i })).toBeVisible()
  await expect(page.getByText('Manual', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: /transformation engine/i })).toContainText(
    /Photo signals are driving the scene/i,
  )
  await page.getByRole('button', { name: /confirm santa cruz anchor/i }).click()
  await page.getByRole('button', { name: /enter memory-space/i }).click()
  await expect(page.getByText('Memory Brush ready')).toBeVisible()
  const computationReceipt = page.getByRole('region', { name: /computation receipt/i })
  await expect(computationReceipt).toContainText(/Motion delta/i)
  await expect(computationReceipt).toContainText(/Awaiting brush input/i)

  const canvas = testCanvasLocator(page)
  await expect(canvas).toBeVisible()
  const initialBox = await canvas.boundingBox()
  expect(initialBox).toBeTruthy()
  if (!initialBox) {
    throw new Error('Canvas bounds missing before paint check')
  }
  expect(initialBox.height).toBeLessThanOrEqual(760)
  const before = await waitForPaintedCanvas(canvas)

  const box = await canvas.boundingBox()
  expect(box).toBeTruthy()
  if (!box) {
    throw new Error('Canvas bounds missing')
  }

  await page.mouse.move(box.x + box.width * 0.28, box.y + box.height * 0.42)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.56, {
    steps: 10,
  })
  await page.mouse.up()

  await expect(page.getByText(/residue saved/i)).toBeVisible()
  await expect(page.getByText('Residue recording')).toBeVisible()
  await expect(page.getByText(/4 photos \/ manual anchor \/ 1 stroke/i)).toBeVisible()
  await expect(computationReceipt).toContainText(/1 stroke -> residue changes brush phase/i)
  const painted = await canvasSnapshot(canvas)
  expect(painted.checksum).not.toBe(before.checksum)

  await page.getByRole('button', { name: /undo last memory brush stroke/i }).click()
  await expect(page.getByText(/last residue stroke removed/i)).toBeVisible()

  await canvas.scrollIntoViewIfNeeded()
  const secondBox = await canvas.boundingBox()
  expect(secondBox).toBeTruthy()
  if (!secondBox) {
    throw new Error('Canvas bounds missing before second drag')
  }

  await page.mouse.move(secondBox.x + secondBox.width * 0.2, secondBox.y + secondBox.height * 0.5)
  await page.mouse.down()
  await page.mouse.move(secondBox.x + secondBox.width * 0.78, secondBox.y + secondBox.height * 0.46, {
    steps: 12,
  })
  await page.mouse.up()
  await expect(page.getByRole('button', { name: /auto-compose/i })).toBeEnabled()
  await page.getByRole('button', { name: /auto-compose/i }).click()
  await expect(page.getByText(/auto-compose cleaned/i)).toBeVisible()
  await expect(page.getByText('Composed memory-space')).toBeVisible()
  await expect(page.getByText(/4 photos \/ manual anchor \/ evolving scene/i)).toBeVisible()
  await expect(page.getByText('Manual Afterimage')).toBeVisible()
  await expect(page.getByText(/4 photos \/ manual anchor \/ visual signals \/ brush motion/i)).toBeVisible()
  await expect(computationReceipt).toContainText(/1 stroke -> auto-composed motion field/i)

  await page.evaluate(() => {
    const targetWindow = window as Window & { __afterimageFillTextLog?: string[] }
    targetWindow.__afterimageFillTextLog = []
    const originalFillText = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function patchedFillText(
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
    ) {
      targetWindow.__afterimageFillTextLog?.push(text)
      return maxWidth === undefined
        ? originalFillText.call(this, text, x, y)
        : originalFillText.call(this, text, x, y, maxWidth)
    }
  })

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /save memory-space png/i }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('afterimage-santa-cruz-memory-space.png')
  const downloadPath = await download.path()
  expect(downloadPath).toBeTruthy()
  const exportPlaqueText = await page.evaluate(
    () => (window as Window & { __afterimageFillTextLog?: string[] }).__afterimageFillTextLog ?? [],
  )
  expect(exportPlaqueText).toContain('Motion delta: 1 brush stroke -> auto-composed field.')
  expect(exportPlaqueText).toContain('EXIF/GPS + color ratios + motion delta -> evolving Canvas.')
  await expect(
    page.getByText(/png export includes title, evidence, computation note, and motion delta/i),
  ).toBeVisible()

  await page.getByRole('button', { name: /reset memory brush strokes/i }).click()
  await expect(page.getByText(/canvas reset/i)).toBeVisible()

  await page.getByRole('button', { name: /open developer source picker/i }).click()
  await expect(page.getByTestId('provider-picker')).toBeVisible()
  await expect(page.getByRole('button', { name: /close developer source picker/i })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await page.getByRole('radio', { name: 'Mapillary' }).click()
  await page.getByRole('radio', { name: 'Panoramax' }).click()
  await page.getByRole('radio', { name: 'KartaView' }).click()
  await page.getByRole('radio', { name: 'Manual' }).click()

  await page.screenshot({
    path: `/tmp/afterimage-${testInfo.project.name}.png`,
    fullPage: true,
  })
})

test('loads the prepared Santa Cruz demo and avoids mobile overflow', async ({
  page,
}, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: /load santa cruz demo folder/i }).click()
  await expect(page.getByText('Verified', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: /transformation engine/i })).toContainText(
    /4 photos \/ 4 GPS \/ timestamps/i,
  )
  await page.getByRole('button', { name: /enter memory-space/i }).click()
  await expect(page.getByText('4 photos / 4 GPS / live canvas')).toBeVisible()

  const canvas = testCanvasLocator(page)
  const snapshot = await waitForPaintedCanvas(canvas)
  expect(snapshot.width).toBeGreaterThan(300)
  expect(snapshot.height).toBeGreaterThan(250)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  await page.screenshot({
    path: `/tmp/afterimage-demo-${testInfo.project.name}.png`,
    fullPage: true,
  })
})

test('the latest load action wins over an earlier folder scan', async ({ page }) => {
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    const source = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    if (!source?.set) {
      return
    }

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      ...source,
      set(value: string) {
        window.setTimeout(() => source.set?.call(this, value), 75)
      },
    })
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const demoBytes = await readFile(resolve(demoFolder, '01-boardwalk-gold.png'))
  const folderInput = page.getByLabel('Import photo folder')
  await folderInput.evaluate((input) => {
    input.removeAttribute('directory')
    input.removeAttribute('webkitdirectory')
  })
  await folderInput.setInputFiles(
    Array.from({ length: 32 }, (_, index) => ({
      name: `slow-import-${index}.png`,
      mimeType: 'image/png',
      buffer: demoBytes,
    })),
  )
  await page.getByRole('button', { name: /run judge demo/i }).click()

  await expect(page.getByRole('status')).toContainText(/judge demo built/i)
  await page.waitForTimeout(1_000)
  await expect(page.getByRole('status')).toContainText(/judge demo built/i)
  await expect(page.getByText(/4 photos \/ 4 GPS \/ evolving scene/i)).toBeVisible()
})

test('keyboard and screen-reader simulation reaches the guided flow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('button', { name: /load santa cruz demo folder/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /run judge demo/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /import folder/i })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /interactive santa cruz memory-space canvas/i }),
  ).toBeVisible()
  await expect(page.getByRole('status')).toContainText(/load the santa cruz demo/i)

  await page.getByRole('button', { name: /load santa cruz demo folder/i }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Verified', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: /enter memory-space/i }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toContainText(/memory-space entered/i)
  const canvas = page.getByRole('button', {
    name: /interactive santa cruz memory-space canvas/i,
  })
  await expect(canvas).toBeFocused()

  await page.keyboard.press('Space')
  await expect(page.getByRole('status')).toContainText(/residue saved/i)
  await expect(page.getByText(/4 photos \/ 4 GPS \/ 1 stroke/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /auto-compose/i })).toBeEnabled()
})

test('one-click judge demo reaches the final exhibit state', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: /run judge demo/i }).click()
  await expect(page.getByRole('status')).toContainText(/judge demo built/i)
  const computationReceipt = page.getByRole('region', { name: /computation receipt/i })
  await expect(computationReceipt).toContainText(/Photo evidence/i)
  await expect(computationReceipt).toContainText(/4 photos \/ 4 GPS/i)
  await expect(computationReceipt).toContainText(/Pixel sampling/i)
  await expect(computationReceipt).toContainText(/sky/i)
  await expect(computationReceipt).toContainText(/water/i)
  await expect(computationReceipt).toContainText(/sand/i)
  await expect(computationReceipt).toContainText(/Render recipe/i)
  await expect(computationReceipt).toContainText(/motion-phase canvas/i)
  await expect(computationReceipt).toContainText(/Evolving output/i)
  await expect(computationReceipt).toContainText(/4 photos -> 4 GPS -> brush motion/i)
  await expect(
    page.locator('.exhibit-plaque').getByText('Santa Cruz Afterimage', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/4 photos \/ 4 GPS \/ evolving scene/i)).toBeVisible()
  await expect(page.getByText(/4 photos \/ 4 GPS matches \/ timestamps \/ brush motion/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /save memory-space png/i })).toBeEnabled()

  const canvas = testCanvasLocator(page)
  const snapshot = await waitForPaintedCanvas(canvas)
  expect(snapshot.width).toBeGreaterThan(300)
  expect(snapshot.height).toBeGreaterThan(250)

  await page.waitForTimeout(450)
  const evolvedSnapshot = await canvasSnapshot(canvas)
  expect(evolvedSnapshot.checksum).not.toBe(snapshot.checksum)

  const pauseTransition = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('[data-testid="memory-canvas"]')
    const pauseButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Pause canvas motion"]',
    )

    if (!canvas || !pauseButton) {
      throw new Error('Canvas or pause control was not found')
    }

    const checksum = () => {
      const context = canvas.getContext('2d')
      if (!context) {
        return 0
      }

      const data = context.getImageData(0, 0, canvas.width, canvas.height).data
      const step = Math.max(4, Math.floor(data.length / 3_000))
      let value = 0
      for (let index = 0; index < data.length; index += step) {
        value = (
          value
          + data[index] * 3
          + data[index + 1] * 5
          + data[index + 2] * 7
          + data[index + 3]
        ) % 1_000_000_007
      }
      return value
    }

    const before = checksum()
    pauseButton.click()

    return new Promise<{ before: number; after: number }>((resolve) => {
      window.requestAnimationFrame(() => resolve({ before, after: checksum() }))
    })
  })
  expect(pauseTransition.after).toBe(pauseTransition.before)
  const pausedSnapshot = await canvasSnapshot(canvas)
  await page.waitForTimeout(450)
  expect((await canvasSnapshot(canvas)).checksum).toBe(pausedSnapshot.checksum)
  const pausedPhase = await canvas.getAttribute('data-motion-phase')
  expect(Number(pausedPhase)).toBeGreaterThan(0)
  const resumeButton = page.getByRole('button', { name: /resume canvas motion/i })
  await expect(resumeButton).not.toHaveAttribute('aria-pressed')

  await page.getByRole('button', { name: /enter exhibit mode/i }).click()
  const exhibitDialog = page.getByRole('dialog', { name: /santa cruz afterimage/i })
  await expect(exhibitDialog.getByRole('button', { name: /resume canvas motion/i })).toBeVisible()
  await expect(exhibitDialog.getByTestId('memory-canvas')).toHaveAttribute(
    'data-motion-phase',
    pausedPhase ?? '',
  )
  await exhibitDialog.getByRole('button', { name: /exit exhibit mode/i }).click()
  await expect(page.getByRole('button', { name: /resume canvas motion/i })).toBeVisible()
  expect((await canvasSnapshot(canvas)).checksum).toBe(pausedSnapshot.checksum)

  await page.getByRole('button', { name: /resume canvas motion/i }).click()
  await page.waitForTimeout(450)
  expect((await canvasSnapshot(canvas)).checksum).not.toBe(pausedSnapshot.checksum)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('hosted proof reel asset is public and playable', async ({
  browserName,
  page,
  request,
}) => {
  const posterResponse = await request.get(proofReelPosterPath)
  expect(posterResponse.ok()).toBe(true)
  expect(posterResponse.headers()['content-type']).toContain('image/png')
  expect(Number(posterResponse.headers()['content-length'] ?? '0')).toBeGreaterThan(50_000)

  const response = await request.get(proofReelPath)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('video/mp4')
  expect(Number(response.headers()['content-length'] ?? '0')).toBeGreaterThan(50_000)

  const webmResponse = await request.get(proofReelWebmPath)
  expect(webmResponse.ok()).toBe(true)
  expect(webmResponse.headers()['content-type']).toContain('video/webm')
  expect(Number(webmResponse.headers()['content-length'] ?? '0')).toBeGreaterThan(50_000)

  if (browserName === 'webkit') {
    return
  }

  await page.goto(proofReelPath)
  const video = page.locator('video')
  await expect(video).toBeVisible()
  await expect(video).toHaveJSProperty('readyState', 4)
})

test('judge presentation URL opens directly to the final exhibit state', async ({ page }) => {
  await page.goto('/?judge=1')

  await expect(page.getByRole('status')).toContainText(/judge demo built/i)
  await expect(
    page.locator('.exhibit-plaque').getByText('Santa Cruz Afterimage', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/4 photos \/ 4 GPS \/ evolving scene/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /save memory-space png/i })).toBeEnabled()
  await expect(page.getByRole('group', { name: 'Reveal steps' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Computed art recipe colors' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Scene rendering parameters' })).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('judge presentation keeps the living artwork in frame while reviewing the submission pack', async ({
  page,
}) => {
  const viewport = page.viewportSize()
  test.skip(
    !viewport || viewport.width < 981 || viewport.height < 640,
    'Desktop-only presentation check; mobile uses a single-column reading order.',
  )

  await page.goto('/?judge=1')
  await expect(page.getByRole('status')).toContainText(/judge demo built/i)
  await page.getByRole('tab', { name: 'Source' }).click()

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  const sceneBox = await page.locator('.scene-shell').boundingBox()
  expect(sceneBox).toBeTruthy()
  if (!sceneBox) {
    throw new Error('Scene shell bounds missing while reviewing submission pack')
  }
  expect(sceneBox.y).toBeGreaterThanOrEqual(92)
  expect(sceneBox.y + sceneBox.height).toBeGreaterThan(460)
})
