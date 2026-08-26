import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const expectedPackageCommand = 'node scripts/export-security-gate.self-test.mjs && vite-node e2e/export-security.browser.ts'
const expectedCiStep = `- name: Generated export browser security
        run: npm run test:export-security`

function assertGateContract(packageJson, workflow, browserTest) {
  const parsedPackage = JSON.parse(packageJson)
  assert.equal(
    parsedPackage.scripts?.['test:export-security'],
    expectedPackageCommand,
    'The export security command must run its structural contract and the real Chrome fixture.',
  )
  assert.ok(workflow.includes(expectedCiStep), 'Quality CI must run the generated export browser security command.')
  assert.match(browserTest, /<img src="assets\/linked-evil\.svg"/, 'The browser fixture must cover an allowed-shape relative SVG link.')
  assert.match(browserTest, /<img src="assets\/payload\.html"/, 'The browser fixture must cover an allowed-shape relative HTML link.')
  assert.match(browserTest, /allowedAssetUrls: new Set\(\['assets\/image_0\.png'\]\)/, 'The browser fixture must prove exact generated-asset provenance.')
  assert.match(browserTest, /katex\.renderToString\('\\\\sqrt\{x\} \+ \\\\overrightarrow\{AB\}'/, 'The browser fixture must render genuine KaTeX SVG geometry.')
  assert.match(browserTest, /await stopChildProcess\(server\)/, 'The browser fixture must await server shutdown before profile cleanup.')
  assert.match(browserTest, /await runBrowserAndCollectStdout\(chrome,/, 'The browser fixture must retain and await the Chrome process boundary.')
  assert.match(browserTest, /removeTemporaryDirectory\(tempDirectory\)/, 'The browser fixture must use bounded temporary-profile cleanup.')
}

const [packageJson, workflow, browserTest] = await Promise.all([
  readFile(new URL('../package.json', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'),
  readFile(new URL('../e2e/export-security.browser.ts', import.meta.url), 'utf8'),
])

assertGateContract(packageJson, workflow, browserTest)
assert.throws(
  () => assertGateContract(packageJson.replace(expectedPackageCommand, 'true'), workflow, browserTest),
  /real Chrome fixture/,
)
assert.throws(
  () => assertGateContract(packageJson, workflow.replace('run: npm run test:export-security', 'run: true'), browserTest),
  /Quality CI/,
)
assert.throws(
  () => assertGateContract(packageJson, workflow, browserTest.replace('<img src="assets/linked-evil.svg"', '<img src="/assets/linked-evil.svg"')),
  /relative SVG link/,
)

console.log('Export security gate contract self-test passed.')
