import { mkdirSync, copyFileSync, rmSync, statSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const outputPath = resolve(
  process.env.PROOF_REEL_OUTPUT_PATH ??
    'public/submission/afterimage-proof-reel.webm',
)
const recordingDir = resolve('.tmp-proof-reel-recording')
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173'
const judgeURL = new URL('/?judge=1', baseURL).toString()

const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms))

const canReach = async (url) => {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

const waitForReachable = async (url) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < 20_000) {
    if (await canReach(url)) {
      return
    }

    await wait(400)
  }

  throw new Error(`Timed out waiting for local app at ${url}`)
}

const startLocalServerIfNeeded = async () => {
  if (process.env.PLAYWRIGHT_BASE_URL || (await canReach(baseURL))) {
    return undefined
  }

  const server = spawn('npm', ['run', 'dev', '--', '--port', '5173'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  server.stdout.on('data', (data) => process.stdout.write(data))
  server.stderr.on('data', (data) => process.stderr.write(data))

  await waitForReachable(baseURL)
  return server
}

const main = async () => {
  const server = await startLocalServerIfNeeded()
  mkdirSync(dirname(outputPath), { recursive: true })
  rmSync(recordingDir, { recursive: true, force: true })
  mkdirSync(recordingDir, { recursive: true })

  let browser
  let context

  try {
    browser = await chromium.launch()
    context = await browser.newContext({
      recordVideo: {
        dir: recordingDir,
        size: { width: 1280, height: 720 },
      },
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

    await page.goto(judgeURL)
    await page.getByRole('status').waitFor({ state: 'visible' })
    const reveal = page.getByRole('region', { name: /guided reveal/i })
    await reveal.waitFor({ state: 'visible' })
    await wait(1_500)
    await reveal.getByRole('button', { name: /extracted signals/i }).click()
    await wait(1_500)
    await reveal.getByRole('button', { name: /living canvas/i }).click()
    const imprintPad = reveal.getByLabel(/leave an afterimage gesture pad/i)
    const imprintBox = await imprintPad.boundingBox()
    const canvas = page.getByTestId('memory-canvas')

    if (!imprintBox) {
      throw new Error('Cannot record proof reel without imprint pad bounds')
    }

    await wait(1_200)
    await page.mouse.move(imprintBox.x + imprintBox.width * 0.18, imprintBox.y + imprintBox.height * 0.52)
    await page.mouse.down()
    await page.mouse.move(imprintBox.x + imprintBox.width * 0.82, imprintBox.y + imprintBox.height * 0.42, {
      steps: 14,
    })
    await page.mouse.up()
    await wait(1_400)
    await reveal.getByRole('button', { name: /skip guided reveal/i }).click()
    await canvas.waitFor({ state: 'visible' })
    await wait(1_600)

    await page.getByRole('region', { name: /computation receipt/i }).scrollIntoViewIfNeeded()
    await wait(3_200)

    await page.getByRole('region', { name: /live medium proof/i }).scrollIntoViewIfNeeded()
    await wait(3_000)

    await page.getByRole('button', { name: /enter exhibit mode/i }).click()
    await page.getByRole('dialog', { name: /santa cruz afterimage/i }).waitFor({ state: 'visible' })
    await wait(4_000)
    await page.getByRole('button', { name: /exit exhibit mode/i }).click()
    await wait(800)

    await page.getByRole('tab', { name: 'Source' }).click()
    await page.getByRole('region', { name: /devpost requirements/i }).scrollIntoViewIfNeeded()
    await wait(3_000)

    await page.getByRole('region', { name: /live demo/i }).scrollIntoViewIfNeeded()
    await wait(2_600)

    await page.getByRole('tab', { name: 'Script' }).click()
    await page.getByRole('region', { name: /proof reel/i }).scrollIntoViewIfNeeded()
    await wait(3_200)

    await page.locator('.scene-shell').scrollIntoViewIfNeeded()
    await wait(3_600)

    const video = page.video()
    await context.close()
    await browser.close()
    context = undefined
    browser = undefined

    const rawVideoPath = await video?.path()
    if (!rawVideoPath) {
      throw new Error('Playwright did not produce a proof reel video')
    }

    copyFileSync(rawVideoPath, outputPath)
    rmSync(recordingDir, { recursive: true, force: true })

    const { size } = statSync(outputPath)
    console.log(`Recorded proof reel: ${outputPath} (${size} bytes)`)
  } finally {
    await context?.close().catch(() => {})
    await browser?.close().catch(() => {})
    server?.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
