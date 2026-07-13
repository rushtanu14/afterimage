import { defineConfig, devices } from '@playwright/test'

const localBaseURL = 'http://127.0.0.1:5177'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? localBaseURL
const useRemoteBaseURL = Boolean(process.env.PLAYWRIGHT_BASE_URL)

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  workers: 1,
  expect: {
    timeout: 7_500,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: useRemoteBaseURL
    ? undefined
    : {
        command: 'npm run dev -- --port 5177 --strictPort',
        url: localBaseURL,
        reuseExistingServer: false,
        timeout: 60_000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
})
