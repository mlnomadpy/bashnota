import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const chrome = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((candidate): candidate is string => Boolean(candidate && existsSync(candidate)))

if (!chrome) {
  throw new Error('Chrome/Chromium is required; set CHROME_BIN when it is not installed in a standard location')
}

export default defineConfig({
  testDir: './e2e/playwright',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173/bashnota/',
    browserName: 'chromium',
    launchOptions: { executablePath: chrome },
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/bashnota/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
