import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const pinnedRef = '${{ github.event.workflow_run.head_sha }}'
const checkoutStep = `- name: Checkout 🛎️
        uses: actions/checkout@v4
        with:
          ref: ${pinnedRef}`
const provenanceGuard = "if: ${{ github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && github.event.workflow_run.head_repository.full_name == github.repository && github.event.workflow_run.head_branch == 'master' }}"

function assertDeployWorkflowContract(workflow) {
  assert.ok(workflow.includes(checkoutStep), 'Deploy checkout must use the completed Quality run head SHA.')
  assert.ok(workflow.includes(provenanceGuard), 'Deploy must require a successful same-repository push to master.')

  const purityGate = workflow.indexOf('Verify sole-backend configuration')
  const configGate = workflow.indexOf('Verify Supabase deployment configuration and approved cutover')
  const build = workflow.indexOf('name: Build 🔧')
  const deepLinks = workflow.indexOf('Verify GitHub Pages deep links')
  const deploy = workflow.indexOf('name: Deploy 🚀')
  assert.ok(purityGate >= 0, 'Deploy must verify the sole-backend configuration.')
  assert.ok(configGate >= 0, 'Deploy must verify the approved Supabase cutover configuration.')
  assert.ok(purityGate < build, 'Backend purity verification must run before the build.')
  assert.ok(configGate < build, 'Supabase cutover verification must run before the build.')
  assert.ok(build < deploy, 'The build must run before deployment.')
  assert.ok(deepLinks > build, 'GitHub Pages deep links must be tested after the build.')
  assert.ok(deepLinks < deploy, 'GitHub Pages deep links must be tested before deployment.')
}

const workflow = await readFile(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
assertDeployWorkflowContract(workflow)

assert.throws(
  () => assertDeployWorkflowContract(workflow.replace(`\n        with:\n          ref: ${pinnedRef}`, '')),
  /completed Quality run head SHA/,
)
assert.throws(
  () => assertDeployWorkflowContract(workflow.replace(pinnedRef, '${{ github.sha }}')),
  /completed Quality run head SHA/,
)
for (const clause of [
  "github.event.workflow_run.event == 'push'",
  'github.event.workflow_run.head_repository.full_name == github.repository',
  "github.event.workflow_run.head_branch == 'master'",
]) {
  assert.throws(
    () => assertDeployWorkflowContract(workflow.replace(` && ${clause}`, '')),
    /successful same-repository push to master/,
  )
}

console.log('Deploy workflow contract self-test passed.')
