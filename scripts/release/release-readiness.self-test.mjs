#!/usr/bin/env node
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { forbiddenArchivePath, findSecretShape } from './archive-policy.mjs'
import { scanGitObjects } from './git-secret-scan.mjs'
import { canonicalHistoryRefs, forbiddenBundleRef, isCanonicalHistoryRef } from './history-policy.mjs'
import { assertReleaseVersionBinding } from './release-version-policy.mjs'

const root = path.resolve(new URL('../..', import.meta.url).pathname)
const required = [
  'SECURITY.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md', '.github/CODEOWNERS',
  'NOTICE', 'docs/release-readiness.md', 'docs/development.md',
  'docs/architecture/README.md', 'docs/architecture/data-flow.md',
  'docs/architecture/threat-model.md', 'docs/architecture/backup-recovery.md',
  'docs/architecture/format-compatibility.md',
  'docs/provenance/contributors.json', 'docs/provenance/fixtures.json',
  'docs/provenance/dependency-license-overrides.json',
]

for (const file of required) await readFile(path.join(root, file))
assert.equal(forbiddenArchivePath('node_modules/vue/index.js'), 'generated/dependency directory')
assert.equal(forbiddenArchivePath('dist/index.html'), 'generated/dependency directory')
assert.equal(forbiddenArchivePath('.env.production'), 'private environment file')
assert.equal(forbiddenArchivePath('private.nota'), 'unclassified notebook/user data')
assert.equal(forbiddenArchivePath('e2e/fixtures/example.nota'), null)
assert.equal(forbiddenArchivePath('src/main.ts'), null)
assert.equal(findSecretShape('-----BEGIN ' + 'PRIVATE KEY-----'), 'private-key marker')
assert.equal(findSecretShape('sk-' + 'proj-' + 'A1b2C3d4E5f6G7h8I9j0K1l2'), 'OpenAI API-key shape')
assert.equal(findSecretShape('sk-' + 'ant-api03-' + 'A1b2C3d4E5f6G7h8I9j0K1l2'), 'Anthropic API-key shape')
assert.equal(findSecretShape('gsk_' + 'A1b2C3d4E5f6G7h8I9j0K1l2'), 'Groq API-key shape')
assert.equal(findSecretShape('hf_' + 'A1b2C3d4E5f6G7h8I9j0K1l2'), 'Hugging Face token shape')
assert.equal(findSecretShape('xai-' + 'A1b2C3d4E5f6G7h8I9j0K1l2'), 'xAI API-key shape')
assert.equal(findSecretShape(Buffer.concat([Buffer.from([0, 255, 0]), Buffer.from('sk_' + 'live_' + 'A1b2C3d4E5f6G7h8I9j0K1l2')])), 'Stripe live secret-key shape')
assert.equal(findSecretShape(`jupyter_token=${'aB3dE5fG7hI9jK1mN3pQ5rS7tU9wX2zC'}`), 'high-entropy value assigned to a secret-named field')
assert.equal(findSecretShape(`token=${'placeholder-'.repeat(4)}`), null)
assert.equal(findSecretShape(Buffer.concat([Buffer.alloc(6 * 1024 * 1024), Buffer.from('glpat-' + 'A1b2C3d4E5f6G7h8I9j0')])), 'GitLab access-token shape')
assert.equal(findSecretShape('ordinary fixture data'), null)

assert.doesNotThrow(() => assertReleaseVersionBinding({
  requestedVersion: '0.2.0',
  packageVersion: '0.2.0',
  changelog: '# Changelog\n\n## [Unreleased]\n',
}))
assert.throws(() => assertReleaseVersionBinding({
  requestedVersion: '0.3.0',
  packageVersion: '0.2.0',
  changelog: '# Changelog\n\n## [0.3.0] - 2026-09-04\n',
}), /does not match package\.json/)
assert.throws(() => assertReleaseVersionBinding({
  requestedVersion: '0.2.0',
  packageVersion: '0.2.0',
  changelog: '# Changelog\n\n## [Unreleased]\n',
  requireReleasedHeading: true,
}), /missing a released heading/)
assert.doesNotThrow(() => assertReleaseVersionBinding({
  requestedVersion: '0.2.0',
  packageVersion: '0.2.0',
  changelog: '# Changelog\n\n## [0.2.0] - 2026-09-04\n',
  requireReleasedHeading: true,
}))

const secretHistory = await mkdtemp(path.join(os.tmpdir(), 'bashnota-secret-history-'))
try {
  const runFixtureGit = (...args) => {
    const result = spawnSync('git', args, { cwd: secretHistory, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    return result.stdout.trim()
  }
  runFixtureGit('init', '--quiet')
  await writeFile(path.join(secretHistory, 'historical.bin'), Buffer.concat([
    Buffer.alloc(6 * 1024 * 1024),
    Buffer.from('xoxb-' + 'A1b2C3d4-E5f6G7h8-I9j0K1l2'),
  ]))
  runFixtureGit('add', 'historical.bin')
  runFixtureGit('-c', 'user.name=Release Policy Test', '-c', 'user.email=release-policy@example.invalid', 'commit', '--quiet', '-m', 'binary fixture')
  const historicalObjects = new Map(runFixtureGit('rev-list', '--objects', 'HEAD').split('\n').filter((line) => line.includes(' ')).map((line) => {
    const separator = line.indexOf(' ')
    return [line.slice(0, separator), line.slice(separator + 1)]
  }))
  const historicalFinding = await scanGitObjects({ cwd: secretHistory, objects: historicalObjects, maxEntryBytes: 50 * 1024 * 1024 })
  assert.equal(historicalFinding?.shape, 'Slack token shape')
  assert.equal(historicalFinding?.file, 'historical.bin')
  runFixtureGit('-c', 'user.name=Release Policy Test', '-c', 'user.email=release-policy@example.invalid', 'tag', '-a', 'v0.0.0', '-m', `token=${'aB3dE5fG7hI9jK1mN3pQ5rS7tU9wX2zC'}`)
  const tagOid = runFixtureGit('rev-parse', 'refs/tags/v0.0.0')
  const tagFinding = await scanGitObjects({ cwd: secretHistory, objects: new Map([[tagOid, 'refs/tags/v0.0.0']]), maxEntryBytes: 50 * 1024 * 1024 })
  assert.equal(tagFinding?.shape, 'high-entropy value assigned to a secret-named field')
  assert.equal(tagFinding?.type, 'tag')
} finally {
  await rm(secretHistory, { recursive: true, force: true })
}
assert.equal(forbiddenBundleRef('HEAD'), null)
assert.equal(forbiddenBundleRef('refs/tags/v1.0.0'), null)
assert.equal(forbiddenBundleRef('refs/heads/master'), null)
assert.equal(forbiddenBundleRef('refs/remotes/origin/master'), null)
assert.equal(forbiddenBundleRef('refs/heads/release/0.2'), null)
assert.equal(forbiddenBundleRef('refs/remotes/origin/release/0.2'), null)
assert.equal(forbiddenBundleRef('refs/stash'), 'non-canonical or private Git ref')
assert.equal(forbiddenBundleRef('refs/codex/turn-diffs/private'), 'non-canonical or private Git ref')
assert.equal(forbiddenBundleRef('refs/heads/dacli-record'), 'non-canonical or private Git ref')
assert.deepEqual(canonicalHistoryRefs(() => [
  'refs/heads/master',
  'refs/heads/release/0.2',
  'refs/heads/codex/private',
  'refs/remotes/origin/master',
  'refs/remotes/origin/release/0.3',
  'refs/remotes/origin/dacli/private',
  'refs/tags/v0.2.0',
].join('\n')), [
  'HEAD',
  'refs/heads/release/0.2',
  'refs/remotes/origin/master',
  'refs/remotes/origin/release/0.3',
  'refs/tags/v0.2.0',
])
assert.deepEqual(canonicalHistoryRefs(() => 'refs/heads/master\nrefs/heads/release/local-only\n'), [
  'HEAD',
  'refs/heads/master',
  'refs/heads/release/local-only',
])

const git = (...args) => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}
const historyRefs = canonicalHistoryRefs(git)
assert.equal(historyRefs[0], 'HEAD')
assert.ok(historyRefs.slice(1).every(isCanonicalHistoryRef))

const contributors = JSON.parse(await readFile(path.join(root, 'docs/provenance/contributors.json'), 'utf8'))
const exact = new Set(contributors.entries.flatMap((entry) => entry.aliases ?? []).map(({ name, email }) => `${name}\t${email}`))
const suffixes = contributors.entries.map((entry) => entry.match?.emailSuffix).filter(Boolean)
const history = spawnSync('git', ['log', ...historyRefs, '--format=%aN%x09%aE'], { cwd: root, encoding: 'utf8' })
assert.equal(history.status, 0, history.stderr)
const unmatched = [...new Set(history.stdout.trim().split('\n'))].filter((identity) => {
  const email = identity.split('\t')[1]
  return !exact.has(identity) && !suffixes.some((suffix) => email.endsWith(suffix))
})
assert.deepEqual(unmatched, [], `Unmatched Git author identities:\n${unmatched.join('\n')}`)

const fixtures = JSON.parse(await readFile(path.join(root, 'docs/provenance/fixtures.json'), 'utf8'))
const fixtureMap = new Map(fixtures.fixtures.map((fixture) => [fixture.path, fixture]))
const tracked = spawnSync('git', ['ls-files', '-z', '*.nota'], { cwd: root, encoding: 'utf8' })
assert.equal(tracked.status, 0, tracked.stderr)
for (const file of tracked.stdout.split('\0').filter(Boolean)) {
  const record = fixtureMap.get(file)
  assert.ok(record, `Tracked nota lacks provenance: ${file}`)
  const digest = createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')
  assert.equal(record.sha256, digest, `Fixture digest drift: ${file}`)
  assert.equal(record.containsPersonalOrUserData, false, `Fixture is not privacy-cleared: ${file}`)
}

const historicalMap = new Map((fixtures.historicalFixtures ?? []).map((fixture) => [`${fixture.path}\t${fixture.blobOid}`, fixture]))
const historical = spawnSync('git', ['log', ...historyRefs, '--format=', '--raw', '--no-abbrev', '--no-renames', '--', '*.nota'], { cwd: root, encoding: 'utf8' })
assert.equal(historical.status, 0, historical.stderr)
const historicalBlobs = new Map()
for (const line of historical.stdout.split('\n')) {
  const match = line.match(/^:\d+ \d+ ([0-9a-f]{40}) ([0-9a-f]{40}) [A-Z]\t(.+\.nota)$/)
  if (!match) continue
  for (const oid of [match[1], match[2]]) {
    if (!/^0+$/.test(oid)) historicalBlobs.set(`${match[3]}\t${oid}`, { path: match[3], oid })
  }
}
for (const [key, { path: historicalPath, oid }] of historicalBlobs) {
  const record = fixtureMap.get(historicalPath)?.blobOid === oid ? fixtureMap.get(historicalPath) : historicalMap.get(key)
  assert.ok(record, `Historical nota blob lacks provenance: ${historicalPath} (${oid})`)
  const blob = spawnSync('git', ['cat-file', 'blob', oid], { cwd: root, encoding: null })
  assert.equal(blob.status, 0, blob.stderr?.toString())
  const digest = createHash('sha256').update(blob.stdout).digest('hex')
  assert.equal(record.sha256, digest, `Historical fixture digest drift: ${historicalPath} (${oid})`)
  assert.equal(record.containsPersonalOrUserData, false, `Historical fixture is not privacy-cleared: ${historicalPath}`)
}
assert.equal(spawnSync('git', ['ls-files', 'src/App.vue.backup'], { cwd: root, encoding: 'utf8' }).stdout.trim(), '')

for (const file of ['README.md', 'CONTRIBUTING.md']) {
  const text = await readFile(path.join(root, file), 'utf8')
  assert.equal(text.includes('your-repo'), false, `${file} retains the placeholder repository link.`)
  assert.equal(/^\s*(?:\$\s*)?npm run deploy\s*$/m.test(text), false, `${file} advertises an unsupported deploy command.`)
}
console.log(`Release readiness policy passed: ${required.length} required records, ${exact.size} exact aliases, ${fixtureMap.size} current and ${historicalMap.size} historical fixtures.`)
