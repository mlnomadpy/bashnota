import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const expectedCommand = 'node scripts/jupyter-security-gate.self-test.mjs && vite-node e2e/jupyter-auth.browser.ts'
const expectedStep = `- name: Token-authenticated Jupyter browser security
        run: npm run test:jupyter-security`

function assertContract(packageJson, workflow, browserGate, securitySource) {
  assert.equal(JSON.parse(packageJson).scripts?.['test:jupyter-security'], expectedCommand)
  assert.ok(workflow.includes(expectedStep), 'Quality CI must run the Jupyter browser security gate')
  assert.match(browserGate, /headers: \{ Authorization: 'token \$\{token\}' \}/)
  assert.match(browserGate, /HttpOnly; SameSite=Strict; Path=\//)
  assert.match(browserGate, /requestUrl\.includes\('token='\)/)
  assert.match(browserGate, /result\.stdout\.includes\(token\)/)
  assert.match(browserGate, /authorizationRequests !== 1 \|\| !channelCookieAuthenticated/)
  assert.match(securitySource, /credentials: 'include'/)
  assert.match(securitySource, /redirect: 'error'/)
  assert.match(securitySource, /target\.origin !== base\.origin/)
}

const [packageJson, workflow, browserGate, securitySource] = await Promise.all([
  readFile(new URL('../package.json', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'),
  readFile(new URL('../e2e/jupyter-auth.browser.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/jupyter/services/jupyterSecurity.ts', import.meta.url), 'utf8'),
])

assertContract(packageJson, workflow, browserGate, securitySource)
assert.throws(
  () => assertContract(packageJson.replace(expectedCommand, 'true'), workflow, browserGate, securitySource),
)
assert.throws(
  () => assertContract(packageJson, workflow.replace('run: npm run test:jupyter-security', 'run: true'), browserGate, securitySource),
  /Quality CI/,
)
assert.throws(
  () => assertContract(packageJson, workflow, browserGate.replace("requestUrl.includes('token=')", 'false'), securitySource),
)
assert.throws(
  () => assertContract(packageJson, workflow, browserGate, securitySource.replace("credentials: 'include'", "credentials: 'omit'")),
)

console.log('Jupyter security gate contract self-test passed')
