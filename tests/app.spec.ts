import { expect, test, type Locator, type Page } from '@playwright/test'
import { resolve } from 'node:path'

const demoFolder = resolve(process.cwd(), 'public/demo/santa-cruz-demo-photos')
const proofReelPath = '/submission/afterimage-proof-reel.webm'

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

test('submission panel offers a copyable demo recording script', async ({ page }) => {
  await page.goto('/')

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

  const proofReel = page.getByRole('region', { name: /proof reel/i })
  await expect(proofReel).toContainText(/Sub-50-second proof reel/i)
  await expect(proofReel).toContainText(/Hosted proof reel/i)
  await expect(proofReel).toContainText(/Record the deployed judge path/i)
  await expect(proofReel).toContainText(/https:\/\/afterimage-omega\.vercel\.app\/\?judge=1/i)
  await expect(proofReel.locator('video')).toHaveAttribute('src', proofReelPath)
  await expect(
    proofReel.getByRole('link', { name: /open hosted proof reel/i }),
  ).toHaveAttribute('href', proofReelPath)
  await expect(proofReel).toContainText(/Show cursor drag, computation receipt, evolving canvas, export, and source proof/i)
  await expect(proofReel).toContainText(/Enter Exhibit mode/i)
  await page.getByRole('button', { name: /copy proof reel brief/i }).click()
  await expect(proofReel).toContainText(/Proof reel brief copied/i)

  const mediaKit = page.getByRole('region', { name: /submission media kit/i })
  await expect(mediaKit).toContainText(/Cover screenshot/i)
  await expect(mediaKit).toContainText(/Exhibit mode/i)
  await expect(mediaKit).toContainText(/final Santa Cruz Afterimage canvas/i)
  await expect(mediaKit).toContainText(/Proof screenshot/i)
  await expect(mediaKit).toContainText(/Source screenshot/i)
  await expect(mediaKit).toContainText(/motion delta/i)
  await expect(mediaKit).toContainText(/sub-50-second proof reel/i)
  await page.getByRole('button', { name: /copy media kit/i }).click()
  await expect(mediaKit).toContainText(/Media kit copied/i)
})

test('submission panel copies the current judge presentation URL', async ({ page }) => {
  await page.goto('/')

  const submissionBrief = page.getByRole('region', { name: /submission brief/i })
  await page.getByRole('button', { name: /copy judge link/i }).click()
  await expect(submissionBrief).toContainText(
    /Judge link copied: http:\/\/127\.0\.0\.1:5173\/\?judge=1/i,
  )
})

test('submission panel offers a copyable attribution block', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('tab', { name: 'Proof' }).click()
  const attributionBlock = page.getByRole('region', { name: /attribution block/i })
  await expect(attributionBlock).toContainText(/Demo photos: procedural generated assets/i)
  await expect(attributionBlock).toContainText(/Libraries: React, TypeScript, Canvas 2D, exifr, lucide-react/i)
  await expect(attributionBlock).toContainText(/Optional providers: Mapillary, Panoramax, and KartaView/i)

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
  await page.getByRole('button', { name: /copy source url/i }).click()
  await expect(sourceRepository).toContainText(/Source URL copied/i)

  const liveDemo = page.getByRole('region', { name: /live demo/i })
  await expect(liveDemo).toContainText(/https:\/\/afterimage-omega\.vercel\.app\/\?judge=1/i)
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

test('judge path can switch from proof dashboard into immersive exhibit mode', async ({
  page,
}) => {
  await page.goto('/?judge=1')
  await expect(page.getByRole('status')).toContainText(/judge demo built/i)

  await page.getByRole('button', { name: /enter exhibit mode/i }).click()

  const exhibit = page.getByRole('region', { name: /immersive exhibit mode/i })
  await expect(exhibit).toBeVisible()
  await expect(exhibit).toContainText(/Santa Cruz Afterimage/i)
  await expect(exhibit).toContainText(/GPS, color, time, and brush motion/i)
  await expect(exhibit).toContainText(/evolving canvas/i)
  await expect(exhibit.getByTestId('memory-canvas')).toBeVisible()

  await page.getByRole('button', { name: /exit exhibit mode/i }).click()
  await expect(exhibit).toBeHidden()
  await expect(page.getByRole('region', { name: /submission brief/i })).toBeVisible()
})

test('imports a folder, confirms confidence, paints, undoes, resets, and auto-composes', async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000)

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /living memory-space/i })).toBeVisible()
  await expect(page.getByText(/code turns GPS, color, time, and brush motion into the artwork/i)).toBeVisible()
  await expect(page.getByRole('region', { name: /submission brief/i })).toContainText(
    /React \+ TypeScript \/ Canvas 2D \/ EXIF and color sampling/i,
  )
  await expect(page.getByRole('region', { name: /submission brief/i })).toContainText(
    /Procedural demo photos; optional Mapillary, Panoramax, and KartaView lookups/i,
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
  await expect(page.getByTestId('provider-picker')).toBeHidden()
  await expect(page.getByText('Load photos first')).toBeVisible()
  await expect(page.getByText('Awaiting folder / procedural base')).toBeVisible()

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /import folder/i }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(demoFolder)

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
  await page.goto('/')

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

test('keyboard and screen-reader simulation reaches the guided flow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('button', { name: /load santa cruz demo folder/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /run judge demo/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /import folder/i })).toBeVisible()
  await expect(
    page.getByRole('img', { name: /interactive santa cruz memory-space canvas/i }),
  ).toBeVisible()
  await expect(page.getByRole('status')).toContainText(/load the santa cruz demo/i)

  await page.getByRole('button', { name: /load santa cruz demo folder/i }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Verified', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: /enter memory-space/i }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toContainText(/memory-space entered/i)
  await expect(
    page.getByRole('img', { name: /interactive santa cruz memory-space canvas/i }),
  ).toBeFocused()
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

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('hosted proof reel asset is public and playable', async ({ page, request }) => {
  const response = await request.get(proofReelPath)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('video/webm')
  expect(Number(response.headers()['content-length'] ?? '0')).toBeGreaterThan(50_000)

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
