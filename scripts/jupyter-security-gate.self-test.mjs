import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const expectedCommand =
  'node scripts/jupyter-security-gate.self-test.mjs && vite-node e2e/jupyter-auth.browser.ts'
const expectedStep = `- name: Token-authenticated Jupyter browser security
        run: npm run test:jupyter-security`

function assertContract(packageJson, workflow, browserGate, securitySource, aiSidebar) {
  assert.equal(JSON.parse(packageJson).scripts?.['test:jupyter-security'], expectedCommand)
  assert.ok(
    workflow.includes(expectedStep),
    'Quality CI must run the Jupyter browser security gate',
  )
  assert.match(browserGate, /headers: \{ Authorization: 'token \$\{token\}' \}/)
  assert.match(browserGate, /HttpOnly; SameSite=Strict; Path=\//)
  assert.match(browserGate, /crossOriginCookiePresented/)
  assert.match(browserGate, /crossOriginProtectedUpgradeAttempts !== 0/)
  assert.match(browserGate, /new URL\(serverOrigin\)\.origin !== location\.origin/)
  assert.match(browserGate, /cross-origin-token-failed-closed/)
  assert.match(browserGate, /requestUrl\.includes\('token='\)/)
  assert.match(browserGate, /result\.stdout\.includes\(token\)/)
  assert.match(
    browserGate,
    /sameOriginAuthorizationRequests !== 1 \|\| !sameOriginChannelAuthenticated/,
  )
  assert.match(securitySource, /credentials: 'include'/)
  assert.match(securitySource, /redirect: 'error'/)
  assert.match(securitySource, /target\.origin !== base\.origin/)
  assert.match(securitySource, /server\.token/)
  assert.match(securitySource, /new URL\(appOrigin\)\.origin !== serverOrigin/)
  assert.match(securitySource, /same-origin HTTPS reverse proxy/)
  assert.doesNotMatch(aiSidebar, /console\.error/)
}

const [packageJson, workflow, browserGate, securitySource, aiSidebar] = await Promise.all([
  readFile(new URL('../package.json', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'),
  readFile(new URL('../e2e/jupyter-auth.browser.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/jupyter/services/jupyterSecurity.ts', import.meta.url), 'utf8'),
  readFile(
    new URL('../src/features/ai/components/components/AIAssistantSidebar.vue', import.meta.url),
    'utf8',
  ),
])

assertContract(packageJson, workflow, browserGate, securitySource, aiSidebar)
assert.throws(() =>
  assertContract(
    packageJson.replace(expectedCommand, 'true'),
    workflow,
    browserGate,
    securitySource,
    aiSidebar,
  ),
)
assert.throws(
  () =>
    assertContract(
      packageJson,
      workflow.replace('run: npm run test:jupyter-security', 'run: true'),
      browserGate,
      securitySource,
      aiSidebar,
    ),
  /Quality CI/,
)
assert.throws(() =>
  assertContract(
    packageJson,
    workflow,
    browserGate.replace("requestUrl.includes('token=')", 'false'),
    securitySource,
    aiSidebar,
  ),
)
assert.throws(() =>
  assertContract(
    packageJson,
    workflow,
    browserGate,
    securitySource.replace("credentials: 'include'", "credentials: 'omit'"),
    aiSidebar,
  ),
)
assert.throws(() =>
  assertContract(
    packageJson,
    workflow,
    browserGate,
    securitySource.replace('new URL(appOrigin).origin !== serverOrigin', 'false'),
    aiSidebar,
  ),
)
assert.throws(() =>
  assertContract(
    packageJson,
    workflow,
    browserGate,
    securitySource,
    `${aiSidebar}\nconsole.error(error)`,
  ),
)

console.log('Jupyter security gate contract self-test passed')
