import { mkdirSync, copyFileSync, rmSync, statSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const outputPath = resolve('public/submission/afterimage-proof-reel.webm')
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
    await page.getByText('Santa Cruz Afterimage', { exact: true }).waitFor({ state: 'visible' })
    await wait(4_000)

    const canvas = page.getByTestId('memory-canvas')
    await canvas.scrollIntoViewIfNeeded()
    const canvasBox = await canvas.boundingBox()

    if (!canvasBox) {
      throw new Error('Cannot record proof reel without canvas bounds')
    }

    await page.mouse.move(canvasBox.x + canvasBox.width * 0.22, canvasBox.y + canvasBox.height * 0.52)
    await page.mouse.down()
    await page.mouse.move(canvasBox.x + canvasBox.width * 0.72, canvasBox.y + canvasBox.height * 0.45, {
      steps: 18,
    })
    await page.mouse.up()
    await wait(3_500)

    await page.getByRole('region', { name: /computation receipt/i }).scrollIntoViewIfNeeded()
    await wait(5_500)

    await page.getByRole('region', { name: /live medium proof/i }).scrollIntoViewIfNeeded()
    await wait(5_000)

    await page.getByRole('button', { name: /enter exhibit mode/i }).click()
    await page.getByRole('region', { name: /immersive exhibit mode/i }).waitFor({ state: 'visible' })
    await wait(5_500)
    await page.getByRole('button', { name: /exit exhibit mode/i }).click()
    await wait(1_000)

    await page.getByRole('tab', { name: 'Source' }).click()
    await page.getByRole('region', { name: /devpost requirements/i }).scrollIntoViewIfNeeded()
    await wait(5_000)

    await page.getByRole('region', { name: /live demo/i }).scrollIntoViewIfNeeded()
    await wait(4_500)

    await page.getByRole('tab', { name: 'Script' }).click()
    await page.getByRole('region', { name: /proof reel/i }).scrollIntoViewIfNeeded()
    await wait(5_500)

    await page.locator('.scene-shell').scrollIntoViewIfNeeded()
    await wait(6_000)

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
