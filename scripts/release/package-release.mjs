#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { forbiddenArchivePath, findSecretShape, secretPatterns } from './archive-policy.mjs'
import { canonicalHistoryRefs, forbiddenBundleRef } from './history-policy.mjs'

const root = path.resolve(new URL('../..', import.meta.url).pathname)
const args = process.argv.slice(2)
const valueAfter = (flag) => args.includes(flag) ? args[args.indexOf(flag) + 1] : null
const maxEntryBytes = 50 * 1024 * 1024

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { cwd: options.cwd ?? root, encoding: options.encoding ?? 'utf8', maxBuffer: 256 * 1024 * 1024 })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(' ')} failed:\n${result.stderr || result.stdout}`)
  return result.stdout.trim()
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

if (run('git', ['rev-parse', '--is-shallow-repository']) !== 'false') throw new Error('A full, non-shallow clone is required to preserve history.')
if (run('git', ['status', '--porcelain=v1'])) throw new Error('Refusing to package a dirty checkout.')
run('npm', ['run', 'check:repository-hygiene'])

const tracked = run('git', ['ls-files', '-z']).split('\0').filter(Boolean)
for (const file of tracked) {
  const forbidden = forbiddenArchivePath(file)
  if (forbidden) throw new Error(`Tracked path is forbidden in releases (${forbidden}): ${file}`)
  const info = await stat(path.join(root, file))
  if (info.size > maxEntryBytes) throw new Error(`Tracked file exceeds the ${maxEntryBytes} byte limit: ${file}`)
  if (info.isFile() && info.size <= 5 * 1024 * 1024) {
    const content = await readFile(path.join(root, file))
    if (!content.includes(0)) {
      const finding = findSecretShape(content.toString('utf8'))
      if (finding) throw new Error(`Potential ${finding} in tracked file: ${file}`)
    }
  }
}

const commit = run('git', ['rev-parse', 'HEAD'])
const sourceEpoch = Number(run('git', ['show', '-s', '--format=%ct', commit]))
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const version = valueAfter('--version') ?? packageJson.version
if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) throw new Error(`Invalid release version: ${version}`)
const output = path.resolve(root, valueAfter('--output') ?? `release/bashnota-${version}.tar.gz`)
const qualityRunId = valueAfter('--quality-run-id')
const releaseRunId = valueAfter('--release-run-id')
if (process.env.GITHUB_ACTIONS === 'true' && (!/^\d+$/.test(qualityRunId ?? '') || !/^\d+$/.test(releaseRunId ?? ''))) {
  throw new Error('GitHub release packaging requires numeric --quality-run-id and --release-run-id test evidence.')
}
const temporary = await mkdtemp(path.join(os.tmpdir(), 'bashnota-release-'))

try {
  const prefix = `bashnota-${version}/`
  const archiveRoot = path.join(temporary, prefix)
  const historyDir = path.join(archiveRoot, 'history')
  await mkdir(historyDir, { recursive: true })
  const bundle = path.join(historyDir, 'bashnota.bundle')
  const historyRefs = canonicalHistoryRefs((...gitArgs) => run('git', gitArgs))
  const fixtureLedger = JSON.parse(await readFile(path.join(root, 'docs/provenance/fixtures.json'), 'utf8'))
  const reviewedNotaBlobs = new Set([
    ...fixtureLedger.fixtures,
    ...(fixtureLedger.historicalFixtures ?? []),
  ].map((fixture) => `${fixture.blobOid}\t${fixture.path}`))
  const historicalObjects = run('git', ['rev-list', '--objects', ...historyRefs]).split('\n').filter(Boolean)
  for (const object of historicalObjects) {
    const separator = object.indexOf(' ')
    if (separator < 0) continue
    const oid = object.slice(0, separator)
    const file = object.slice(separator + 1)
    const forbidden = forbiddenArchivePath(file)
    if (forbidden === 'unclassified notebook/user data' && reviewedNotaBlobs.has(`${oid}\t${file}`)) continue
    if (forbidden) throw new Error(`Historical path is forbidden in releases (${forbidden}): ${file} (${oid})`)
  }
  const revisions = run('git', ['rev-list', ...historyRefs]).split('\n').filter(Boolean)
  const historicalSecretPattern = secretPatterns.map(([, regex]) => `(?:${regex.source})`).join('|')
  const search = spawnSync('git', ['grep', '-I', '-l', '-P', '-e', historicalSecretPattern, ...revisions], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
  if (search.error) throw search.error
  if (search.status === 0) {
    const locations = search.stdout.trim().split('\n').slice(0, 10).join('\n')
    throw new Error(`Potential secret shape in released Git history:\n${locations}`)
  }
  if (search.status !== 1) throw new Error(`Historical secret scan failed:\n${search.stderr}`)
  const commitMessages = run('git', ['log', ...historyRefs, '--format=%B'])
  const commitMessageFinding = findSecretShape(commitMessages)
  if (commitMessageFinding) throw new Error(`Potential ${commitMessageFinding} in released Git commit messages.`)
  // Parallel pack-object ordering is nondeterministic even for identical refs.
  // HEAD carries the released commit's complete ancestry. Canonical tags retain
  // release markers without leaking stashes, remote-tracking branches, local
  // worktree refs, or agent/tool bookkeeping namespaces.
  run('git', ['-c', 'pack.threads=1', 'bundle', 'create', bundle, ...historyRefs])
  run('git', ['bundle', 'verify', bundle])
  const advertisedRefs = run('git', ['bundle', 'list-heads', bundle])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split(' ')[1])
  for (const ref of advertisedRefs) {
    const forbidden = forbiddenBundleRef(ref)
    if (forbidden) throw new Error(`History bundle contains ${forbidden}: ${ref}`)
  }

  const licenses = path.join(archiveRoot, 'dependency-licenses.json')
  const sbom = path.join(archiveRoot, 'sbom.cdx.json')
  const testEvidence = path.join(archiveRoot, 'test-evidence.json')
  run(process.execPath, ['scripts/release/generate-license-report.mjs', '--output', licenses])
  run(process.execPath, ['scripts/release/generate-sbom.mjs', '--output', sbom])
  await writeFile(testEvidence, `${JSON.stringify({
    schemaVersion: 1,
    commit,
    sourceDateEpoch: sourceEpoch,
    qualityWorkflow: qualityRunId ? {
      runId: Number(qualityRunId),
      url: `https://github.com/mlnomadpy/bashnota/actions/runs/${qualityRunId}`,
      assertion: 'The release workflow verified this Quality run succeeded for the exact commit.',
    } : null,
    releaseWorkflow: releaseRunId ? {
      runId: Number(releaseRunId),
      url: `https://github.com/mlnomadpy/bashnota/actions/runs/${releaseRunId}`,
      assertion: 'This release workflow rechecked the release gates before packaging.',
    } : null,
    packagerChecks: [
      'npm run check:repository-hygiene',
      'git bundle verify history/bashnota.bundle',
      'current and historical size, secret-shape, and archive-path policy inspection',
      'archive required-entry inspection',
    ],
    limitation: qualityRunId ? null : 'Local package: no CI run IDs supplied; this is not publishable release test evidence.',
  }, null, 2)}\n`)

  const internalFiles = [bundle, licenses, sbom, testEvidence]
  const manifest = {
    schemaVersion: 1,
    project: 'bashnota',
    version,
    commit,
    sourceDateEpoch: sourceEpoch,
    historyScope: 'exact release HEAD ancestry and canonical refs/tags/* from a non-shallow clone',
    historyRefs: advertisedRefs,
    generatedFiles: Object.fromEntries(await Promise.all(internalFiles.map(async (file) => [path.relative(archiveRoot, file), sha256(await readFile(file))]))),
    toolchain: { node: process.version, npm: run('npm', ['--version']), git: run('git', ['--version']) },
    verification: ['npm run release:check', 'git bundle verify history/bashnota.bundle'],
  }
  const manifestPath = path.join(archiveRoot, 'release-manifest.json')
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  await mkdir(path.dirname(output), { recursive: true })
  const gitDir = run('git', ['rev-parse', '--absolute-git-dir'])
  const archiveArgs = [
    `--git-dir=${gitDir}`, `--work-tree=${root}`, 'archive', '--format=tar.gz',
    `--mtime=@${sourceEpoch}`, `--output=${output}`,
    `--prefix=${prefix}history/`,
    `--add-file=${path.relative(temporary, bundle)}`,
    `--prefix=${prefix}`,
    `--add-file=${path.relative(temporary, licenses)}`,
    `--add-file=${path.relative(temporary, sbom)}`,
    `--add-file=${path.relative(temporary, testEvidence)}`,
    `--add-file=${path.relative(temporary, manifestPath)}`,
    `--prefix=${prefix}`,
    commit,
  ]
  run('git', archiveArgs, { cwd: temporary })
  const listing = run('tar', ['-tzf', output]).split('\n').filter(Boolean)
  for (const file of listing) {
    const relative = file.startsWith(prefix) ? file.slice(prefix.length) : file
    const forbidden = forbiddenArchivePath(relative)
    if (forbidden) throw new Error(`Archive inspection found forbidden path (${forbidden}): ${file}`)
  }
  for (const required of ['history/bashnota.bundle', 'dependency-licenses.json', 'sbom.cdx.json', 'test-evidence.json', 'release-manifest.json', 'LICENSE', 'NOTICE', 'CHANGELOG.md']) {
    if (!listing.includes(`${prefix}${required}`)) throw new Error(`Archive is missing ${required}`)
  }
  const digest = sha256(await readFile(output))
  await writeFile(`${output}.sha256`, `${digest}  ${path.basename(output)}\n`)
  console.log(`${path.relative(root, output)}\nsha256 ${digest}\nentries ${listing.length}`)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
