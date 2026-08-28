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
  testDir: './e2e/pwa',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results/pwa-junit.xml' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4174/bashnota/',
    browserName: 'chromium',
    launchOptions: { executablePath: chrome },
    serviceWorkers: 'allow',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174',
    url: 'http://127.0.0.1:4174/bashnota/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
