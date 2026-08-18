import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalCount, canonicalTimestamp, MigrationDataError, publicAuditEvent, sha256, stableJson } from '../../../scripts/firebase-migration/canonical.mjs'
import { identityRequirements, transformExport } from '../../../scripts/firebase-migration/transform.mjs'
import { FileTarget } from '../../../scripts/firebase-migration/file-target.mjs'
import { ChainedAuditFile, CheckpointFile, runMigration } from '../../../scripts/firebase-migration/runner.mjs'
import { assembleExport } from '../../../scripts/firebase-migration/export.mjs'

const fixtureUrl = new URL('./fixtures/firebase-export.json', import.meta.url)
const sourceText = await readFile(fixtureUrl, 'utf8')
const source = JSON.parse(sourceText)
const provisioned = [
  { firebaseUid: 'firebase-alice', supabaseUserId: '00000000-0000-4000-8000-000000000001', provider: 'email', providerUid: 'alice@example.test', email: 'alice@example.test' },
  { firebaseUid: 'firebase-bob', supabaseUserId: '00000000-0000-4000-8000-000000000002', provider: 'email', providerUid: 'bob@example.test', email: 'bob@example.test' },
]

const first = transformExport(source, provisioned)
const assembled = assembleExport({ watermark: source.watermark, authExport: { users: source.authUsers.map(user => ({ ...user, localId: user.uid, uid: undefined })) }, collections: source.firestore, storageManifest: source.storageManifest })
assert.deepEqual(assembled.authUsers.map(user => [user.uid, user.provider]), [['firebase-alice', 'email'], ['firebase-bob', 'email']])
assert.deepEqual(assembled.firestore, source.firestore, 'offline export assembler must retain every exact collection deterministically')
const second = transformExport(JSON.parse(sourceText), [...provisioned].reverse())
assert.equal(first.manifestHash, second.manifestHash, 'canonical transform must be deterministic')
assert.equal(stableJson(first), stableJson(second), 'input and identity ordering must not alter output')
assert.deepEqual(first.orphans, [])
assert.deepEqual(first.quarantined, [])

const kinds = new Set(first.records.map(item => item.kind))
for (const kind of ['identity', 'legacy_nota', 'publication', 'publication_edge', 'nota_vote', 'nota_viewer', 'metric_bucket', 'comment', 'comment_vote', 'newsletter']) {
  assert.ok(kinds.has(kind), `fixture must exercise ${kind}`)
}

const publicationRecords = first.records.filter(item => item.kind === 'publication')
assert.deepEqual(publicationRecords.map(item => item.payload.id), ['pub-root', 'pub-child'], 'parents must precede children regardless of source order')
assert.deepEqual(publicationRecords[0].payload.published_nota_citations.map(item => item.title), ['First', 'Second'], 'citation order must be retained')
assert.equal(publicationRecords[0].payload.source_published_at_raw, '{"_nanoseconds":9000,"_seconds":1754006400}')
assert.equal(publicationRecords[0].payload.published_at, '2025-08-01T00:00:00.000009Z')

const commentRecords = first.records.filter(item => item.kind === 'comment')
assert.deepEqual(commentRecords.map(item => item.payload.id), ['comment-root', 'comment-reply'], 'comment parents must precede replies')
const notaVote = first.records.find(item => item.kind === 'nota_vote').payload
assert.equal(notaVote.updated_at, '2026-08-12T08:00:00.000000Z', 'newer dedicated vote must win without using migration time')
const commentVote = first.records.find(item => item.kind === 'comment_vote').payload
assert.equal(commentVote.created_at, '2026-08-12T10:00:00.000000Z', 'embedded comment vote timestamp must derive deterministically from its source comment')

assert.deepEqual(identityRequirements(source).map(item => item.firebaseUid), ['firebase-alice', 'firebase-bob'])
await assert.rejects(async () => transformExport(source, provisioned.map((item, index) => index ? { ...item, supabaseUserId: provisioned[0].supabaseUserId } : item)), /two Firebase identities map to one Supabase account/)
await assert.rejects(async () => transformExport(source, provisioned.map((item, index) => index ? { ...item, email: 'wrong@example.test' } : item)), /invalid canonical target mapping/)
assert.equal(canonicalCount('9007199254740993', 'large'), '9007199254740993')
assert.throws(() => canonicalCount(9007199254740992, 'unsafe'), MigrationDataError)
assert.equal(canonicalTimestamp('2026-08-10T10:30:00-07:00', 'offset').utc, '2026-08-10T17:30:00.000000Z')
assert.equal(canonicalTimestamp('2026-08-10T10:30:00.123456789Z', 'nanos').utc, '2026-08-10T10:30:00.123456Z')
assert.throws(() => canonicalTimestamp('08/10/2026 10:30', 'locale'), MigrationDataError)

const auditEvent = publicAuditEvent({ phase: 'apply', keyHash: sha256('key'), email: 'not-allowed@example.test', content: 'secret', status: 'ok' })
assert.deepEqual(Object.keys(auditEvent).sort(), ['keyHash', 'phase', 'status'])
assert.ok(!stableJson(first).includes('profile-images/firebase-alice'), 'storage paths must be hashed in the canonical manifest')

const cyclic = JSON.parse(sourceText)
cyclic.firestore.publishedNotas[0].publishedSubPages = ['pub-root']
cyclic.firestore.publishedNotas[0].parentId = 'pub-root'
cyclic.firestore.publishedNotas[1].publishedSubPages = ['pub-child']
cyclic.firestore.publishedNotas[1].parentId = 'pub-child'
cyclic.firestore.publishedNotas[1].isSubPage = true
const cycleManifest = transformExport(cyclic, provisioned)
assert.ok(cycleManifest.orphans.some(item => item.type === 'publication-parent-cycle'), 'cycles must fail closed without recursive looping')
const ambiguousVote = structuredClone(source)
ambiguousVote.firestore.notaVotes[0].voteType = 'dislike'
ambiguousVote.firestore.notaVotes[0].updatedAt = '2026-08-10T08:00:00Z'
assert.ok(transformExport(ambiguousVote, provisioned).orphans.some(item => item.type === 'nota-vote-conflict'), 'an older conflicting dedicated vote must block cutover')

const taskDirectory = await mkdtemp(join(tmpdir(), 'bashnota-migration007-'))
const cliPath = fileURLToPath(new URL('../../../scripts/migrate-firebase-to-supabase.mjs', import.meta.url))
const approvalPath = join(taskDirectory, 'approval.json')
await writeFile(approvalPath, JSON.stringify({ productionRunId: 'fixture-run', c0Approved: true, reconciliationMarker: '   ' }))
const blankMarker = spawnSync(process.execPath, [cliPath, '--mode', 'dry-run', '--environment', 'production', '--run-id', 'fixture-run', '--approval-file', approvalPath], { encoding: 'utf8' })
assert.equal(blankMarker.status, 1, 'production approval must contain a nonblank reconciliation marker')
const invalidInteger = spawnSync(process.execPath, [cliPath, '--mode', 'dry-run', '--environment', 'local', '--run-id', 'fixture-run', '--source', fileURLToPath(fixtureUrl), '--audit', join(taskDirectory, 'invalid.audit'), '--checkpoint', join(taskDirectory, 'invalid.checkpoint'), '--report', join(taskDirectory, 'invalid.report'), '--batch-size', '1x'], { encoding: 'utf8' })
assert.equal(invalidInteger.status, 1, 'CLI numeric controls must reject partially parsed integers')
const auditPath = join(taskDirectory, 'audit.ndjson'), checkpointPath = join(taskDirectory, 'checkpoint.json')
const audit = new ChainedAuditFile(auditPath, 'fixture-run'); await audit.initialize()
const checkpoint = new CheckpointFile(checkpointPath)
const retryKey = first.records[2].keyHash
const target = new FileTarget({ transientFailures: { [retryKey]: 2 } })
const applied = await runMigration({ manifest: first, target, runId: 'fixture-run', batchSize: 3, requestsPerSecond: 100, maxRetries: 2, checkpoint, audit })
assert.equal(applied.status, 'completed')
assert.equal(applied.applied, 18)
assert.equal(target.calls.filter(key => key === retryKey).length, 3, 'bounded transient retry must eventually apply exactly once')
assert.equal((await checkpoint.read(first.manifestHash)).nextSequence, 19)
assert.equal((await stat(auditPath)).mode & 0o777, 0o600)
assert.equal((await stat(checkpointPath)).mode & 0o777, 0o600)
const auditText = await readFile(auditPath, 'utf8')
for (const forbidden of ['alice@example.test', 'bob@example.test', 'firebase-alice', 'profile-images', 'Hello']) assert.ok(!auditText.includes(forbidden), `audit must redact ${forbidden}`)
const resumedAudit = new ChainedAuditFile(auditPath, 'fixture-run'); await resumedAudit.initialize()
const rerun = await runMigration({ manifest: first, target, runId: 'fixture-run', batchSize: 4, requestsPerSecond: 100, checkpoint: null, audit: resumedAudit })
assert.equal(rerun.applied, 0); assert.equal(rerun.skipped, 18); assert.equal(target.records.size, 18)

const snapshot = target.snapshot()
await target.rollback('fixture-run'); assert.equal(target.records.size, 0)
target.restore(snapshot); assert.equal((await target.reconcile(first)).status, 'pass', 'rollback restore must recover an exact snapshot')
const changed = structuredClone(first); changed.records[0].sourceHash = sha256('changed-source')
await assert.rejects(() => runMigration({ manifest: changed, target, runId: 'fixture-run', batchSize: 10, requestsPerSecond: 100 }), error => error.code === '23505')

const unsafe = structuredClone(first); unsafe.orphans.push({ type: 'fixture-orphan' })
const dryTarget = new FileTarget()
const dryResult = await runMigration({ manifest: unsafe, target: dryTarget, runId: 'dry-run', mode: 'dry-run' })
assert.equal(dryResult.status, 'no-go'); assert.equal(dryTarget.records.size, 0)

console.log(JSON.stringify({ status: 'pass', manifestHash: first.manifestHash, records: first.records.length, kinds: kinds.size }))
