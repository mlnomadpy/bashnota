import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

const workflowsDirectory = new URL('../.github/workflows/', import.meta.url)
const pinnedRef = '${{ github.event.workflow_run.head_sha }}'
const provenanceGuard = "if: ${{ github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && github.event.workflow_run.head_repository.full_name == github.repository && github.event.workflow_run.head_branch == 'master' }}"
const approvedActions = new Map([
  ['actions/checkout', { sha: '11bd71901bbe5b1630ceea73d27597364c9af683', version: 'v4.2.2', count: 2 }],
  ['actions/setup-node', { sha: '49933ea5288caeca8642d1e84afbd3f7d6820020', version: 'v4.4.0', count: 2 }],
  ['actions/upload-artifact', { sha: 'ea165f8d65b6e75b540449e92b4886f43607fa02', version: 'v4.6.2', count: 1 }],
  ['JamesIves/github-pages-deploy-action', { sha: 'd92aa235d04922e8f08b40ce78cc5442fcfbfa2f', version: 'v4.8.0', count: 1 }],
])

function assertPinnedActions(workflows) {
  let actionCount = 0
  const observedActions = new Map()

  for (const [filename, workflow] of workflows) {
    for (const line of workflow.match(/^\s*uses:.*$/gm) ?? []) {
      actionCount += 1
      const match = line.match(/^\s*uses:\s*([^@\s]+)@([0-9a-f]{40})\s+#\s+(v\d+(?:\.\d+){1,2})\s*$/)
      assert.ok(match, `${filename}: every third-party action must use a full commit SHA and version comment: ${line.trim()}`)

      const [, action, sha, version] = match
      const approved = approvedActions.get(action)
      assert.ok(approved, `${filename}: ${action} is not in the reviewed action allowlist.`)
      assert.equal(sha, approved.sha, `${filename}: ${action} must use its reviewed ${approved.version} commit.`)
      assert.equal(version, approved.version, `${filename}: ${action} version comment must match the reviewed commit.`)
      observedActions.set(action, (observedActions.get(action) ?? 0) + 1)
    }
  }

  assert.ok(actionCount > 0, 'At least one third-party action must be inspected.')
  for (const [action, approved] of approvedActions) {
    assert.equal(observedActions.get(action), approved.count, `${action} must occur exactly ${approved.count} time(s) across the workflows.`)
  }
}

function assertDeployWorkflowContract(workflow) {
  assert.ok(workflow.includes(provenanceGuard), 'Deploy must require a successful same-repository push to master.')
  assert.match(workflow, /uses: actions\/checkout@[0-9a-f]{40} # v4\.2\.2\n\s+with:\n\s+ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/,
    'Deploy checkout must use the completed Quality run head SHA.')

  assert.match(workflow, /permissions:\n  contents: write\n\n/, 'Deploy must grant only contents: write for branch-based GitHub Pages publishing.')
  assert.doesNotMatch(workflow, /^\s{2}(?:actions|checks|deployments|id-token|issues|packages|pages|pull-requests|security-events|statuses):\s+(?:read|write)$/m,
    'Deploy must not broaden GitHub token permissions beyond contents: write.')
  assert.match(workflow, /concurrency:\n  group: github-pages-production\n  cancel-in-progress: true\n/,
    'Deploy must use one stable production concurrency group and cancel superseded runs.')

  const purityGate = workflow.indexOf('Verify sole-backend configuration')
  const configGate = workflow.indexOf('Verify Supabase deployment configuration and approved cutover')
  const build = workflow.indexOf('name: Build 🔧')
  const deepLinks = workflow.indexOf('name: Verify GitHub Pages deep links')
  const staleGuard = workflow.indexOf('name: Refuse stale Quality run')
  const deploy = workflow.indexOf('name: Deploy 🚀')
  assert.ok(purityGate >= 0, 'Deploy must verify the sole-backend configuration.')
  assert.ok(configGate >= 0, 'Deploy must verify the approved Supabase cutover configuration.')
  assert.ok(purityGate < build, 'Backend purity verification must run before the build.')
  assert.ok(configGate < build, 'Supabase cutover verification must run before the build.')
  assert.ok(build < deepLinks && deepLinks < staleGuard && staleGuard < deploy,
    'Build, deep-link verification, stale-run refusal, and deployment must remain ordered.')

  const staleStep = workflow.slice(staleGuard, deploy)
  assert.ok(staleStep.includes('GH_TOKEN: ${{ github.token }}'), 'The stale-run check must authenticate with the built-in token.')
  assert.ok(staleStep.includes('EXPECTED_SHA: ${{ github.event.workflow_run.head_sha }}'), 'The stale-run check must compare the tested SHA.')
  assert.ok(staleStep.includes('REPOSITORY: ${{ github.repository }}'), 'The stale-run check must query the current repository.')
  assert.ok(staleStep.includes('gh api "/repos/${REPOSITORY}/git/ref/heads/master"'), 'The stale-run check must query refs/heads/master immediately before deploy.')
  assert.ok(staleStep.includes('if [ "${CURRENT_SHA}" != "${EXPECTED_SHA}" ]; then'), 'The stale-run check must reject a mismatched master head.')
  assert.ok(staleStep.includes('exit 1'), 'The stale-run check must fail closed.')
}

const workflowFiles = (await readdir(workflowsDirectory)).filter((filename) => /\.ya?ml$/.test(filename))
const workflows = new Map(await Promise.all(workflowFiles.map(async (filename) => [
  filename,
  await readFile(new URL(filename, workflowsDirectory), 'utf8'),
])))
const deployWorkflow = workflows.get('deploy.yml')
assert.ok(deployWorkflow, 'deploy.yml must exist.')

assertPinnedActions(workflows)
assertDeployWorkflowContract(deployWorkflow)

for (const clause of [
  "github.event.workflow_run.conclusion == 'success'",
  "github.event.workflow_run.event == 'push'",
  'github.event.workflow_run.head_repository.full_name == github.repository',
  "github.event.workflow_run.head_branch == 'master'",
]) {
  assert.throws(
    () => assertDeployWorkflowContract(deployWorkflow.replace(clause, 'true')),
    /successful same-repository push to master/,
  )
}

for (const mutation of [
  deployWorkflow.replace(`ref: ${pinnedRef}`, 'ref: ${{ github.sha }}'),
  deployWorkflow.replace('group: github-pages-production', 'group: deploy-${{ github.run_id }}'),
  deployWorkflow.replace('cancel-in-progress: true', 'cancel-in-progress: false'),
  deployWorkflow.replace('contents: write', 'contents: read'),
  deployWorkflow.replace('permissions:\n  contents: write', 'permissions:\n  contents: write\n  id-token: write'),
  deployWorkflow.replace('gh api "/repos/${REPOSITORY}/git/ref/heads/master"', 'echo "$EXPECTED_SHA"'),
  deployWorkflow.replace('if [ "${CURRENT_SHA}" != "${EXPECTED_SHA}" ]; then', 'if [ "${CURRENT_SHA}" = "${EXPECTED_SHA}" ]; then'),
  deployWorkflow.replace('exit 1', 'exit 0'),
]) {
  assert.throws(() => assertDeployWorkflowContract(mutation))
}

const ciWorkflow = workflows.get('ci.yml')
assert.ok(ciWorkflow, 'ci.yml must exist.')
assert.match(ciWorkflow, /permissions:\n  contents: read\n\n/, 'Quality must grant only read-only contents permission.')
assert.ok(ciWorkflow.includes('run: npm run test:deploy-workflow'), 'Quality must run the deploy workflow contract self-test.')

assert.doesNotMatch(ciWorkflow, /^\s{2}(?:actions|checks|deployments|id-token|issues|packages|pages|pull-requests|security-events|statuses):\s+(?:read|write)$/m,
  'Quality must not broaden GitHub token permissions beyond contents: read.')

const mutableActionMutation = new Map(workflows)
mutableActionMutation.set('ci.yml', ciWorkflow.replace('actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2', 'actions/checkout@v4'))
assert.throws(() => assertPinnedActions(mutableActionMutation), /full commit SHA and version comment/)

const unreviewedShaMutation = new Map(workflows)
unreviewedShaMutation.set('ci.yml', ciWorkflow.replace('11bd71901bbe5b1630ceea73d27597364c9af683', '1111111111111111111111111111111111111111'))
assert.throws(() => assertPinnedActions(unreviewedShaMutation), /reviewed v4.2.2 commit/)

const missingActionMutation = new Map(workflows)
missingActionMutation.set('ci.yml', ciWorkflow.replace(/^\s*uses: actions\/upload-artifact@.*$/m, ''))
assert.throws(() => assertPinnedActions(missingActionMutation), /must occur exactly 1 time/)

assert.throws(
  () => assert.match(ciWorkflow.replace('permissions:\n  contents: read', 'permissions:\n  contents: read\n  id-token: write'), /permissions:\n  contents: read\n\n/),
  /input did not match/,
)

console.log(`Deploy workflow contract self-test passed (${workflowFiles.length} workflows, immutable action pins, provenance, permissions, concurrency, and stale-run refusal).`)
