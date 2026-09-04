import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { load as parseYaml } from 'js-yaml'

const workflowsDirectory = new URL('../.github/workflows/', import.meta.url)
const pinnedRef = '${{ github.event.workflow_run.head_sha }}'
const provenanceGuard = "${{ github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && github.event.workflow_run.head_repository.full_name == github.repository && github.event.workflow_run.head_branch == 'master' }}"
const approvedActions = new Map([
  ['actions/checkout', { sha: '11bd71901bbe5b1630ceea73d27597364c9af683', version: 'v4.2.2', count: 7 }],
  ['actions/setup-node', { sha: '49933ea5288caeca8642d1e84afbd3f7d6820020', version: 'v4.4.0', count: 7 }],
  ['actions/upload-artifact', { sha: 'ea165f8d65b6e75b540449e92b4886f43607fa02', version: 'v4.6.2', count: 4 }],
  ['JamesIves/github-pages-deploy-action', { sha: 'd92aa235d04922e8f08b40ce78cc5442fcfbfa2f', version: 'v4.8.0', count: 1 }],
])
const environmentFileRun = [
  'echo "VITE_APP_BASE_URL=${{ secrets.VITE_APP_BASE_URL }}" >> .env',
  'echo "VITE_SUPABASE_URL=${{ vars.VITE_SUPABASE_URL }}" >> .env',
  'echo "VITE_SUPABASE_PUBLISHABLE_KEY=${{ vars.VITE_SUPABASE_PUBLISHABLE_KEY }}" >> .env',
  'echo "SUPABASE_MIGRATION_EVIDENCE_SHA256=${{ vars.SUPABASE_MIGRATION_EVIDENCE_SHA256 }}" >> .env',
  'echo "SUPABASE_RECONCILIATION_EVIDENCE_SHA256=${{ vars.SUPABASE_RECONCILIATION_EVIDENCE_SHA256 }}" >> .env',
].join('\n') + '\n'

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

function assertExactKeys(value, expectedKeys, location) {
  assert.deepEqual(Object.keys(value).sort(), [...expectedKeys].sort(), `${location} contains an unexpected or missing field.`)
}

function assertDeployWorkflowContract(source) {
  const document = parseWorkflow('deploy.yml', source)
  assertExactKeys(document, ['name', 'on', 'permissions', 'concurrency', 'jobs'], 'deploy.yml')
  assert.equal(document.name, 'Deploy to GitHub Pages')
  assert.deepEqual(document.on, {
    workflow_run: {
      workflows: ['Quality'],
      types: ['completed'],
      branches: ['master'],
    },
  }, 'Deploy must trigger only from completed Quality runs associated with master.')
  assertExactPermissions('deploy.yml', document, 'write')
  assert.deepEqual(document.concurrency, { group: 'github-pages-production', 'cancel-in-progress': true },
    'Deploy must use one stable production concurrency group and cancel superseded runs.')

  assert.deepEqual(Object.keys(document.jobs), ['build-and-deploy'], 'Deploy must have exactly one provenance-gated job.')
  const job = document.jobs['build-and-deploy']
  assert.ok(job, 'Deploy must retain the build-and-deploy job.')
  assertExactKeys(job, ['if', 'runs-on', 'steps'], 'deploy.yml jobs.build-and-deploy')
  assert.equal(job.if, provenanceGuard, 'Deploy must require an exact successful same-repository push to master.')
  assert.equal(job['runs-on'], 'ubuntu-latest')
  assert.ok(Array.isArray(job.steps), 'The deploy job must define ordered steps.')

  assert.deepEqual(job.steps.map((step) => step.name), [
    'Checkout 🛎️',
    'Setup Node 🧱',
    'Create .env file',
    'Install dependencies 📦',
    'Verify sole-backend configuration',
    'Verify Supabase deployment configuration and approved cutover',
    'Build 🔧',
    'Verify GitHub Pages deep links',
    'Refuse stale Quality run',
    'Deploy 🚀',
  ], 'Deploy steps must be the exact reviewed sequence; injected or renamed steps fail closed.')

  const checkout = findStep(job.steps, 'Checkout 🛎️').step
  assertExactKeys(checkout, ['name', 'uses', 'with'], 'deploy checkout step')
  assert.equal(checkout.uses, `actions/checkout@${approvedActions.get('actions/checkout').sha}`)
  assert.deepEqual(checkout.with, { ref: pinnedRef }, 'Deploy checkout must use only the completed Quality run head SHA.')

  const setupNode = findStep(job.steps, 'Setup Node 🧱').step
  assertExactKeys(setupNode, ['name', 'uses', 'with'], 'deploy setup-node step')
  assert.equal(setupNode.uses, `actions/setup-node@${approvedActions.get('actions/setup-node').sha}`)
  assert.deepEqual(setupNode.with, { 'node-version': '22.14.0', cache: 'npm' })

  const environmentFile = findStep(job.steps, 'Create .env file').step
  assert.deepEqual(environmentFile, { name: 'Create .env file', run: environmentFileRun },
    'Deploy environment creation must use only the reviewed secret and variable set.')
  assert.deepEqual(findStep(job.steps, 'Install dependencies 📦').step,
    { name: 'Install dependencies 📦', run: 'npm ci' })

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

  assert.deepEqual(staleGuard.step, {
    name: 'Refuse stale Quality run',
    env: {
      GH_TOKEN: '${{ github.token }}',
      EXPECTED_SHA: pinnedRef,
      REPOSITORY: '${{ github.repository }}',
    },
    run: 'node scripts/refuse-stale-deploy.mjs',
  }, 'The stale-run refusal must invoke only the versioned, tested guard with trusted context.')

  assert.deepEqual(purityGate.step, { name: 'Verify sole-backend configuration', run: 'npm run check:backend-purity' })
  assert.deepEqual(configGate.step, { name: 'Verify Supabase deployment configuration and approved cutover', run: 'node scripts/check-supabase-deploy-config.mjs' })
  assert.deepEqual(build.step, { name: 'Build 🔧', run: 'npm run build' })
  assert.deepEqual(deepLinks.step, { name: 'Verify GitHub Pages deep links', run: 'npm run test:github-pages-deep-links' })
  assert.deepEqual(deploy.step, {
    name: 'Deploy 🚀',
    uses: `JamesIves/github-pages-deploy-action@${approvedActions.get('JamesIves/github-pages-deploy-action').sha}`,
    with: { folder: 'dist' },
  }, 'Deployment must be the exact reviewed final action step.')
}

function assertQualityWorkflowContract(source) {
  const document = parseWorkflow('ci.yml', source)
  assertExactKeys(document, ['name', 'on', 'permissions', 'concurrency', 'jobs'], 'ci.yml')
  assertExactPermissions('ci.yml', document, 'read')
  assert.deepEqual(document.concurrency, {
    group: 'quality-${{ github.workflow }}-${{ github.ref }}',
    'cancel-in-progress': true,
  }, 'Quality must cancel superseded runs for the same ref.')
  const shardNames = ['static', 'unit', 'browser', 'database', 'build']
  assert.deepEqual(Object.keys(document.jobs), [...shardNames, 'quality'],
    'Quality must retain the reviewed parallel shards and final aggregate gate.')

  for (const shardName of shardNames) {
    const shard = document.jobs[shardName]
    assert.ok(shard && Array.isArray(shard.steps), `Quality shard ${shardName} must define steps.`)
    assert.equal(shard['runs-on'], 'ubuntu-latest')
    assert.equal(typeof shard['timeout-minutes'], 'number', `${shardName} must have a bounded timeout.`)
    assert.equal(Object.hasOwn(shard, 'continue-on-error'), false, `${shardName} must be blocking.`)
  }

  const staticJob = document.jobs.static
  const staticCheckout = findStep(staticJob.steps, 'Checkout').step
  assert.deepEqual(staticCheckout.with, { 'fetch-depth': 0 },
    'The release provenance self-test requires complete Git history in the static shard.')
  const contractStep = findStep(staticJob.steps, 'Verify deploy workflow pins the tested commit').step
  assert.deepEqual(contractStep, {
    name: 'Verify deploy workflow pins the tested commit',
    run: 'npm run test:deploy-workflow',
  }, 'Quality must run the deploy workflow contract self-test unconditionally and as a blocking step.')

  const requiredShardSteps = new Map([
    ['static', ['Type check application and unit tests', 'Type check browser test surfaces', 'Lint without warning growth']],
    ['unit', ['Unit tests and risk-tier coverage', 'Upload unit and coverage results']],
    ['browser', ['Install Playwright Chromium', 'Critical application journeys', 'Production PWA lifecycle', 'Enforce initial route asset graph budget', 'Iframe sandbox isolation', 'Generated export browser security', 'Token-authenticated Jupyter browser security', 'Upload browser diagnostics']],
    ['database', ['Test migration engine', 'Start local Supabase', 'Lint database schema', 'Test database, auth, publishing, community, storage, and API security', 'Rehearse upgrade path']],
    ['build', ['Build', 'Production container smoke test']],
  ])
  for (const [shardName, names] of requiredShardSteps) {
    const observed = document.jobs[shardName].steps.map((step) => step.name)
    for (const name of names) assert.ok(observed.includes(name), `${shardName} is missing required step: ${name}`)
  }
  assert.equal(findStep(document.jobs.browser.steps, 'Iframe sandbox isolation').step.run,
    'npm run test:iframe-security', 'The browser shard must execute the iframe security gate.')
  assert.equal(findStep(document.jobs.database.steps, 'Test database, auth, publishing, community, storage, and API security').step.run,
    'npm run test:supabase', 'The database shard must execute the full Supabase integration suite.')
  assert.equal(findStep(document.jobs.database.steps, 'Rehearse upgrade path').step.run,
    'npm run test:supabase:upgrade', 'The database shard must rehearse the supported upgrade path.')
  assert.equal(findStep(document.jobs.unit.steps, 'Unit tests and risk-tier coverage').step.run,
    'npm run test:ci:unit', 'The unit shard must collect coverage and JUnit results in one non-duplicated run.')
  assert.equal(findStep(document.jobs.build.steps, 'Build').step.run,
    'npm run build-only', 'The artifact shard must not repeat the static shard type-check.')

  const qualityJob = document.jobs.quality
  assertExactKeys(qualityJob, ['name', 'if', 'needs', 'runs-on', 'timeout-minutes', 'env', 'steps'], 'ci.yml jobs.quality')
  assert.equal(qualityJob.name, 'quality')
  assert.equal(qualityJob.if, 'always()')
  assert.deepEqual(qualityJob.needs, shardNames)
  assert.equal(qualityJob['runs-on'], 'ubuntu-latest')
  assert.deepEqual(qualityJob.steps.map((step) => step.name), ['Require every quality shard'])
  assert.match(qualityJob.steps[0].run, /test "\$result" = success/,
    'The final quality check must fail unless every shard succeeded.')
}

function assertReleaseWorkflowContract(source) {
  const document = parseWorkflow('release.yml', source)
  assert.deepEqual(document.on, { push: { tags: ['v*'] } },
    'Release must broadly trigger for v-prefixed tags and reject malformed versions inside the job.')
  const packageJob = document.jobs.package
  assert.ok(packageJob, 'release.yml must define the package job.')
  const tagStep = packageJob.steps.find((step) => step.name === 'Require a GitHub-verified annotated tag on master')
  assert.ok(tagStep, 'release.yml must validate the triggering tag.')
  assert.match(tagStep.run, /node scripts\/release\/validate-release-version\.mjs "\$\{tag_ref#v\}"/,
    'Release must validate the tag through the shared strict SemVer policy.')
  const archiveStep = packageJob.steps.find((step) => step.name === 'Build archive twice and require reproducibility')
  assert.ok(archiveStep, 'release.yml must build and verify the candidate archive.')
  assert.match(archiveStep.run, /version="\$\{GITHUB_REF_NAME#v\}"/,
    'Release packaging must derive its requested version from the signed tag.')
  assert.match(archiveStep.run, /\(\s*cd release\s+sha256sum --check "bashnota-\$\{version\}\.tar\.gz\.sha256"\s*\)/,
    'The adjacent checksum must be verified from the archive directory.')
  assert.doesNotMatch(archiveStep.run, /sha256sum --check "release\//,
    'Checksum verification must not resolve an adjacent basename from repository root.')
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
const releaseWorkflow = workflows.get('release.yml')
assert.ok(deployWorkflow, 'deploy.yml must exist.')
assert.ok(ciWorkflow, 'ci.yml must exist.')
assert.ok(releaseWorkflow, 'release.yml must exist.')

assertPinnedActions(workflows)
assertDeployWorkflowContract(deployWorkflow)
assertQualityWorkflowContract(ciWorkflow)
assertReleaseWorkflowContract(releaseWorkflow)

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
  ['extra unguarded deploy job', replaceRequired(deployWorkflow, 'jobs:\n', 'jobs:\n  unguarded-deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - run: git push origin HEAD:gh-pages\n')],
  ['stale guard command removed', replaceRequired(deployWorkflow, 'run: node scripts/refuse-stale-deploy.mjs', 'run: true')],
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
  ['quality job skipped', replaceRequired(ciWorkflow, '  quality:\n', '  quality:\n    if: false\n')],
  ['quality job made nonblocking', replaceRequired(ciWorkflow, '  quality:\n', '  quality:\n    continue-on-error: true\n')],
  ['quality contract test made nonblocking', replaceRequired(ciWorkflow, '      - name: Verify deploy workflow pins the tested commit\n', '      - name: Verify deploy workflow pins the tested commit\n        continue-on-error: true\n')],
  ['quality contract test skipped', replaceRequired(ciWorkflow, '      - name: Verify deploy workflow pins the tested commit\n', '      - name: Verify deploy workflow pins the tested commit\n        if: false\n')],
  ['quality contract command removed', replaceRequired(ciWorkflow, 'run: npm run test:deploy-workflow', 'run: true')],
  ['database shard removed from aggregate', replaceRequired(ciWorkflow, '    needs: [static, unit, browser, database, build]', '    needs: [static, unit, browser, build]')],
  ['iframe gate removed', replaceRequired(ciWorkflow, 'run: npm run test:iframe-security', 'run: true')],
  ['static provenance runs on shallow history', replaceRequired(ciWorkflow, '          fetch-depth: 0', '          fetch-depth: 1')],
]) {
  expectRejected(() => assertQualityWorkflowContract(mutation), description)
}

for (const [description, mutation] of [
  ['checksum verified from repository root', replaceRequired(releaseWorkflow, '(\n            cd release\n            sha256sum --check "bashnota-${version}.tar.gz.sha256"\n          )', 'sha256sum --check "release/bashnota-${version}.tar.gz.sha256"')],
  ['tag version binding removed', replaceRequired(releaseWorkflow, 'version="${GITHUB_REF_NAME#v}"', 'version="0.0.0"')],
  ['release trigger misses valid versions', replaceRequired(releaseWorkflow, "      - 'v*'", "      - 'v[0-9]+.[0-9]+.[0-9]+*'")],
  ['strict tag validation removed', replaceRequired(releaseWorkflow, '          node scripts/release/validate-release-version.mjs "${tag_ref#v}"\n', '')],
]) {
  expectRejected(() => assertReleaseWorkflowContract(mutation), description)
}

console.log(`Deploy workflow contract self-test passed (${workflowFiles.length} parsed workflows, immutable action pins, exact provenance/permissions, concurrency, and fail-closed stale-run refusal).`)
