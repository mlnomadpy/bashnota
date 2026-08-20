import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { load as parseYaml } from 'js-yaml'

const workflowsDirectory = new URL('../.github/workflows/', import.meta.url)
const pinnedRef = '${{ github.event.workflow_run.head_sha }}'
const provenanceGuard = "${{ github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && github.event.workflow_run.head_repository.full_name == github.repository && github.event.workflow_run.head_branch == 'master' }}"
const approvedActions = new Map([
  ['actions/checkout', { sha: '11bd71901bbe5b1630ceea73d27597364c9af683', version: 'v4.2.2', count: 2 }],
  ['actions/setup-node', { sha: '49933ea5288caeca8642d1e84afbd3f7d6820020', version: 'v4.4.0', count: 2 }],
  ['actions/upload-artifact', { sha: 'ea165f8d65b6e75b540449e92b4886f43607fa02', version: 'v4.6.2', count: 1 }],
  ['JamesIves/github-pages-deploy-action', { sha: 'd92aa235d04922e8f08b40ce78cc5442fcfbfa2f', version: 'v4.8.0', count: 1 }],
])

function parseWorkflow(filename, source) {
  const document = parseYaml(source)
  assert.ok(document && typeof document === 'object' && !Array.isArray(document), `${filename}: workflow must be a YAML mapping.`)
  assert.ok(document.jobs && typeof document.jobs === 'object' && !Array.isArray(document.jobs), `${filename}: workflow must define jobs.`)
  return document
}

function collectUses(filename, document) {
  const uses = []

  for (const [jobName, job] of Object.entries(document.jobs)) {
    assert.ok(job && typeof job === 'object' && !Array.isArray(job), `${filename}: job ${jobName} must be a mapping.`)
    if (Object.hasOwn(job, 'uses')) uses.push({ location: `jobs.${jobName}.uses`, value: job.uses })
    if (!Object.hasOwn(job, 'steps')) continue
    assert.ok(Array.isArray(job.steps), `${filename}: jobs.${jobName}.steps must be an array.`)

    job.steps.forEach((step, index) => {
      assert.ok(step && typeof step === 'object' && !Array.isArray(step), `${filename}: jobs.${jobName}.steps[${index}] must be a mapping.`)
      if (Object.hasOwn(step, 'uses')) uses.push({ location: `jobs.${jobName}.steps[${index}].uses`, value: step.uses })
    })
  }

  return uses
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function assertPinnedActions(workflows) {
  const observedActions = new Map()

  for (const [filename, source] of workflows) {
    const document = parseWorkflow(filename, source)
    const uses = collectUses(filename, document)

    for (const occurrence of uses) {
      assert.equal(typeof occurrence.value, 'string', `${filename}: ${occurrence.location} must be a string.`)
      if (occurrence.value.startsWith('./')) continue

      const match = occurrence.value.match(/^([^@\s]+)@([0-9a-f]{40})$/)
      assert.ok(match, `${filename}: ${occurrence.location} must use a full immutable commit SHA: ${occurrence.value}`)
      const [, action, sha] = match
      const approved = approvedActions.get(action)
      assert.ok(approved, `${filename}: ${action} is not in the reviewed action allowlist.`)
      assert.equal(sha, approved.sha, `${filename}: ${action} must use its reviewed ${approved.version} commit.`)
      observedActions.set(action, (observedActions.get(action) ?? 0) + 1)
    }

    for (const [action, approved] of approvedActions) {
      const versionedPin = new RegExp(`^\\s*(?:-\\s*)?uses:\\s*${escapeRegExp(action)}@${approved.sha}\\s+#\\s+${escapeRegExp(approved.version)}\\s*$`, 'gm')
      const sourceCount = [...source.matchAll(versionedPin)].length
      const parsedCount = uses.filter(({ value }) => value === `${action}@${approved.sha}`).length
      assert.equal(sourceCount, parsedCount, `${filename}: every ${action} use must carry the matching ${approved.version} comment.`)
    }
  }

  for (const [action, approved] of approvedActions) {
    assert.equal(observedActions.get(action), approved.count, `${action} must occur exactly ${approved.count} time(s) across the workflows.`)
  }
}

function assertExactPermissions(filename, document, contentsPermission) {
  assert.deepEqual(document.permissions, { contents: contentsPermission },
    `${filename}: root permissions must be exactly contents: ${contentsPermission}.`)

  for (const [jobName, job] of Object.entries(document.jobs)) {
    assert.equal(Object.hasOwn(job, 'permissions'), false,
      `${filename}: jobs.${jobName} must not override or broaden root permissions.`)
  }
}

function findStep(steps, name) {
  const index = steps.findIndex((step) => step.name === name)
  assert.ok(index >= 0, `Missing required workflow step: ${name}`)
  return { index, step: steps[index] }
}

function assertDeployWorkflowContract(source) {
  const document = parseWorkflow('deploy.yml', source)
  assertExactPermissions('deploy.yml', document, 'write')
  assert.deepEqual(document.concurrency, { group: 'github-pages-production', 'cancel-in-progress': true },
    'Deploy must use one stable production concurrency group and cancel superseded runs.')

  const job = document.jobs['build-and-deploy']
  assert.ok(job, 'Deploy must retain the build-and-deploy job.')
  assert.equal(job.if, provenanceGuard, 'Deploy must require an exact successful same-repository push to master.')
  assert.equal(Object.hasOwn(job, 'continue-on-error'), false, 'The deploy job must fail closed.')
  assert.ok(Array.isArray(job.steps), 'The deploy job must define ordered steps.')

  const checkout = findStep(job.steps, 'Checkout 🛎️').step
  assert.equal(checkout.uses, `actions/checkout@${approvedActions.get('actions/checkout').sha}`)
  assert.equal(checkout.with?.ref, pinnedRef, 'Deploy checkout must use the completed Quality run head SHA.')

  const purityGate = findStep(job.steps, 'Verify sole-backend configuration')
  const configGate = findStep(job.steps, 'Verify Supabase deployment configuration and approved cutover')
  const build = findStep(job.steps, 'Build 🔧')
  const deepLinks = findStep(job.steps, 'Verify GitHub Pages deep links')
  const staleGuard = findStep(job.steps, 'Refuse stale Quality run')
  const deploy = findStep(job.steps, 'Deploy 🚀')
  assert.ok(purityGate.index < build.index && configGate.index < build.index,
    'Backend purity and Supabase cutover verification must run before build.')
  assert.ok(build.index < deepLinks.index && deepLinks.index < staleGuard.index,
    'Build and deep-link verification must finish before stale-run refusal.')
  assert.equal(deploy.index, staleGuard.index + 1, 'The stale-run refusal must be immediately before deployment.')

  assert.equal(Object.hasOwn(staleGuard.step, 'continue-on-error'), false, 'The stale-run refusal must not ignore failure.')
  assert.equal(Object.hasOwn(staleGuard.step, 'if'), false, 'The stale-run refusal must use normal success gating.')
  assert.deepEqual(staleGuard.step.env, {
    GH_TOKEN: '${{ github.token }}',
    EXPECTED_SHA: pinnedRef,
    REPOSITORY: '${{ github.repository }}',
  }, 'The stale-run refusal must use only the built-in token and trusted event context.')
  assert.equal(typeof staleGuard.step.run, 'string')
  assert.ok(staleGuard.step.run.includes('set -euo pipefail'), 'The stale-run refusal shell must fail closed.')
  assert.ok(staleGuard.step.run.includes('gh api "/repos/${REPOSITORY}/git/ref/heads/master"'),
    'The stale-run refusal must query refs/heads/master immediately before deploy.')
  assert.ok(staleGuard.step.run.includes('if [ "${CURRENT_SHA}" != "${EXPECTED_SHA}" ]; then'),
    'The stale-run refusal must reject a mismatched master head.')
  assert.ok(staleGuard.step.run.includes('exit 1'), 'The stale-run refusal must exit nonzero on mismatch.')

  assert.equal(Object.hasOwn(deploy.step, 'if'), false, 'Deployment must not bypass a failed stale-run step.')
  assert.equal(Object.hasOwn(deploy.step, 'continue-on-error'), false, 'Deployment failures must remain blocking.')
}

function assertQualityWorkflowContract(source) {
  const document = parseWorkflow('ci.yml', source)
  assertExactPermissions('ci.yml', document, 'read')
  const qualityJob = document.jobs.quality
  assert.ok(qualityJob && Array.isArray(qualityJob.steps), 'Quality must retain its ordered steps.')
  const contractStep = findStep(qualityJob.steps, 'Verify deploy workflow pins the tested commit').step
  assert.equal(contractStep.run, 'npm run test:deploy-workflow', 'Quality must run the deploy workflow contract self-test.')
  assert.equal(Object.hasOwn(contractStep, 'continue-on-error'), false, 'The deploy contract self-test must be blocking.')
}

function expectRejected(operation, description) {
  assert.throws(operation, undefined, `Mutation was not rejected: ${description}`)
}

function replaceRequired(source, from, to) {
  const mutated = source.replace(from, to)
  assert.notEqual(mutated, source, `Mutation fixture did not match: ${String(from)}`)
  return mutated
}

const workflowFiles = (await readdir(workflowsDirectory)).filter((filename) => /\.ya?ml$/.test(filename))
const workflows = new Map(await Promise.all(workflowFiles.map(async (filename) => [
  filename,
  await readFile(new URL(filename, workflowsDirectory), 'utf8'),
])))
const deployWorkflow = workflows.get('deploy.yml')
const ciWorkflow = workflows.get('ci.yml')
assert.ok(deployWorkflow, 'deploy.yml must exist.')
assert.ok(ciWorkflow, 'ci.yml must exist.')

assertPinnedActions(workflows)
assertDeployWorkflowContract(deployWorkflow)
assertQualityWorkflowContract(ciWorkflow)

for (const clause of [
  "github.event.workflow_run.conclusion == 'success'",
  "github.event.workflow_run.event == 'push'",
  'github.event.workflow_run.head_repository.full_name == github.repository',
  "github.event.workflow_run.head_branch == 'master'",
]) {
  expectRejected(
    () => assertDeployWorkflowContract(replaceRequired(deployWorkflow, clause, 'true')),
    `missing provenance predicate: ${clause}`,
  )
}

for (const [description, mutation] of [
  ['checkout no longer uses workflow_run.head_sha', replaceRequired(deployWorkflow, `ref: ${pinnedRef}`, 'ref: ${{ github.sha }}')],
  ['unstable concurrency group', replaceRequired(deployWorkflow, 'group: github-pages-production', 'group: deploy-${{ github.run_id }}')],
  ['superseded runs are not cancelled', replaceRequired(deployWorkflow, 'cancel-in-progress: true', 'cancel-in-progress: false')],
  ['root permission reduced incorrectly', replaceRequired(deployWorkflow, 'contents: write', 'contents: read')],
  ['root permission broadened', replaceRequired(deployWorkflow, 'permissions:\n  contents: write', 'permissions:\n  contents: write\n  id-token: write')],
  ['job-level write-all', replaceRequired(deployWorkflow, '  build-and-deploy:\n', '  build-and-deploy:\n    permissions: write-all\n')],
  ['job-level continue-on-error', replaceRequired(deployWorkflow, '  build-and-deploy:\n', '  build-and-deploy:\n    continue-on-error: true\n')],
  ['master ref query removed', replaceRequired(deployWorkflow, 'gh api "/repos/${REPOSITORY}/git/ref/heads/master"', 'echo "$EXPECTED_SHA"')],
  ['SHA mismatch comparison inverted', replaceRequired(deployWorkflow, 'if [ "${CURRENT_SHA}" != "${EXPECTED_SHA}" ]; then', 'if [ "${CURRENT_SHA}" = "${EXPECTED_SHA}" ]; then')],
  ['stale mismatch exits successfully', replaceRequired(deployWorkflow, 'exit 1', 'exit 0')],
  ['stale guard ignores failure', replaceRequired(deployWorkflow, '      - name: Refuse stale Quality run\n', '      - name: Refuse stale Quality run\n        continue-on-error: true\n')],
  ['deploy runs after failed prerequisites', replaceRequired(deployWorkflow, '      - name: Deploy 🚀\n', '      - name: Deploy 🚀\n        if: always()\n')],
]) {
  expectRejected(() => assertDeployWorkflowContract(mutation), description)
}

for (const [description, mutation] of [
  ['mutable action tag', replaceRequired(ciWorkflow, 'actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2', 'actions/checkout@v4')],
  ['unreviewed action SHA', replaceRequired(ciWorkflow, '11bd71901bbe5b1630ceea73d27597364c9af683', '1111111111111111111111111111111111111111')],
  ['missing version comment', replaceRequired(ciWorkflow, ' # v4.2.2', '')],
  ['missing required action', replaceRequired(ciWorkflow, /^\s*uses: actions\/upload-artifact@.*$/m, '')],
  ['flow-form mutable action', replaceRequired(ciWorkflow, '    steps:\n', '    steps:\n      - { uses: evil/example-action@v1 }\n')],
]) {
  const mutatedWorkflows = new Map(workflows)
  mutatedWorkflows.set('ci.yml', mutation)
  expectRejected(() => assertPinnedActions(mutatedWorkflows), description)
}

for (const [description, mutation] of [
  ['quality root permission broadened', replaceRequired(ciWorkflow, 'permissions:\n  contents: read', 'permissions:\n  contents: read\n  id-token: write')],
  ['quality job-level write-all', replaceRequired(ciWorkflow, '  quality:\n', '  quality:\n    permissions: write-all\n')],
  ['quality contract test made nonblocking', replaceRequired(ciWorkflow, '      - name: Verify deploy workflow pins the tested commit\n', '      - name: Verify deploy workflow pins the tested commit\n        continue-on-error: true\n')],
  ['quality contract command removed', replaceRequired(ciWorkflow, 'run: npm run test:deploy-workflow', 'run: true')],
]) {
  expectRejected(() => assertQualityWorkflowContract(mutation), description)
}

console.log(`Deploy workflow contract self-test passed (${workflowFiles.length} parsed workflows, immutable action pins, exact provenance/permissions, concurrency, and fail-closed stale-run refusal).`)
