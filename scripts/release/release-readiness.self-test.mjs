#!/usr/bin/env node
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { forbiddenArchivePath, findSecretShape } from './archive-policy.mjs'

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
assert.equal(findSecretShape('ordinary fixture data'), null)

const contributors = JSON.parse(await readFile(path.join(root, 'docs/provenance/contributors.json'), 'utf8'))
const exact = new Set(contributors.entries.flatMap((entry) => entry.aliases ?? []).map(({ name, email }) => `${name}\t${email}`))
const suffixes = contributors.entries.map((entry) => entry.match?.emailSuffix).filter(Boolean)
const history = spawnSync('git', ['log', '--all', '--format=%aN%x09%aE'], { cwd: root, encoding: 'utf8' })
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
const historical = spawnSync('git', ['log', '--all', '--format=', '--raw', '--no-abbrev', '--no-renames', '--', '*.nota'], { cwd: root, encoding: 'utf8' })
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
