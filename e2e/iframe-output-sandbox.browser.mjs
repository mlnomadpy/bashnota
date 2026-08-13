import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const chromeCandidates = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const chrome = chromeCandidates.find(existsSync)
if (!chrome) {
  throw new Error('Chrome/Chromium is required for the executable-output sandbox browser test')
}

const fixture = readFileSync(new URL('./iframe-output-sandbox.fixture.html', import.meta.url), 'utf8')
const tempDirectory = mkdtempSync(join(tmpdir(), 'bashnota-iframe-security-'))
const fixturePath = join(tempDirectory, 'fixture.html')
const profilePath = join(tempDirectory, 'chrome-profile')

try {
  writeFileSync(fixturePath, fixture)
  let output = ''
  try {
    output = execFileSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--disable-background-networking',
      '--no-first-run',
      '--no-default-browser-check',
      '--virtual-time-budget=1000',
      `--user-data-dir=${profilePath}`,
      '--dump-dom',
      pathToFileURL(fixturePath).href,
    ], { encoding: 'utf8', timeout: 8_000, stdio: ['ignore', 'pipe', 'ignore'] })
  } catch (error) {
    // Some macOS Chrome builds finish --dump-dom but retain a background
    // process. The timeout terminates it; a complete dumped DOM remains valid
    // browser evidence, while missing/partial output still fails below.
    output = typeof error?.stdout === 'string' ? error.stdout : ''
  }

  const resultMatch = output.match(/<pre id="result">([^<]+)<\/pre>/)
  if (!resultMatch) {
    throw new Error(`Sandbox result was not rendered by Chrome:\n${output}`)
  }

  const result = JSON.parse(resultMatch[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'))
  const expected = {
    storage: 'SecurityError',
    dom: 'SecurityError',
    api: 'SecurityError',
    parentApiCalls: 0,
    safeHtmlRendered: true,
    isolatedScriptRan: true,
    sandbox: 'allow-scripts',
  }

  if (JSON.stringify(result) !== JSON.stringify(expected)) {
    throw new Error(`Opaque-origin assertions failed:\nexpected ${JSON.stringify(expected)}\nreceived ${JSON.stringify(result)}`)
  }

  console.log('Opaque-origin executable-output browser assertions passed')
} finally {
  rmSync(tempDirectory, { recursive: true, force: true })
}
