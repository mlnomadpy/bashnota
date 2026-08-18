import { chmod, mkdir, open, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { classifyRetry, publicAuditEvent, sha256, stableJson } from './canonical.mjs'

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

export class ChainedAuditFile {
  constructor(path, runId) { this.path = path; this.runId = runId; this.previousHash = ''; this.sequence = 0 }

  async initialize() {
    await mkdir(dirname(this.path), { recursive: true })
    let text = ''
    try { text = await readFile(this.path, 'utf8') } catch (error) { if (error.code !== 'ENOENT') throw error }
    for (const line of text.split('\n').filter(Boolean)) {
      const entry = JSON.parse(line)
      const expected = sha256(`${entry.previousHash ?? ''}\0${entry.runId}\0${entry.sequence}\0${stableJson(entry.event)}`)
      if (entry.runId !== this.runId || entry.sequence !== this.sequence + 1 || entry.previousHash !== (this.previousHash || null) || entry.eventHash !== expected) {
        throw new Error('audit chain verification failed')
      }
      this.sequence = entry.sequence
      this.previousHash = entry.eventHash
    }
    const handle = await open(this.path, 'a', 0o600); await handle.close(); await chmod(this.path, 0o600)
  }

  async append(event) {
    const redacted = publicAuditEvent(event)
    const sequence = this.sequence + 1
    const previousHash = this.previousHash || null
    const eventHash = sha256(`${previousHash ?? ''}\0${this.runId}\0${sequence}\0${stableJson(redacted)}`)
    const handle = await open(this.path, 'a', 0o600)
    try { await handle.appendFile(`${stableJson({ runId: this.runId, sequence, previousHash, event: redacted, eventHash })}\n`, 'utf8'); await handle.sync() } finally { await handle.close() }
    this.sequence = sequence; this.previousHash = eventHash
    return eventHash
  }
}

export class CheckpointFile {
  constructor(path) { this.path = path }
  async read(binding) {
    try {
      const value = JSON.parse(await readFile(this.path, 'utf8'))
      for (const key of ['runId', 'manifestHash', 'sourceWatermarkHash', 'identityPlanHash']) {
        if (value[key] !== binding[key]) throw new Error(`checkpoint ${key} does not match this run`)
      }
      return value
    } catch (error) { if (error.code === 'ENOENT') return null; throw error }
  }
  async write(value) {
    await mkdir(dirname(this.path), { recursive: true })
    const temporary = `${this.path}.${process.pid}.tmp`
    await writeFile(temporary, `${stableJson(value)}\n`, { mode: 0o600 })
    await chmod(temporary, 0o600); await rename(temporary, this.path); await chmod(this.path, 0o600)
  }
}

export async function runMigration({ manifest, target, runId, mode = 'apply', batchSize = 100, requestsPerSecond = 20, maxRetries = 3, checkpoint, audit, beforeStart }) {
  if (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 500) throw new Error('batchSize must be between 1 and 500')
  if (!Number.isFinite(requestsPerSecond) || requestsPerSecond <= 0 || requestsPerSecond > 100) throw new Error('requestsPerSecond must be between 0 and 100')
  if (!Number.isSafeInteger(maxRetries) || maxRetries < 0 || maxRetries > 8) throw new Error('maxRetries must be between 0 and 8')
  if (manifest.orphans.length || manifest.quarantined.length) {
    const result = { status: 'no-go', manifestHash: manifest.manifestHash, orphanCount: manifest.orphans.length, quarantineCount: manifest.quarantined.length }
    if (mode === 'dry-run') return result
    throw new Error('migration source has unresolved or quarantined records')
  }
  const binding = { runId, manifestHash: manifest.manifestHash, sourceWatermarkHash: manifest.sourceWatermarkHash, identityPlanHash: manifest.identityPlanHash }
  const existing = checkpoint ? await checkpoint.read(binding) : null
  const startSequence = existing?.nextSequence ?? 1
  const dryRun = mode === 'dry-run'
  const emit = async event => {
    await audit?.append(event)
    await target.appendAudit?.(runId, publicAuditEvent(event))
  }
  await target.preflight?.(manifest)
  await beforeStart?.()
  await target.startRun({ runId, manifest, dryRun })
  await emit({ phase: 'run', status: dryRun ? 'dry-run' : 'started', count: manifest.records.length })
  if (dryRun) {
    await target.finishRun({ runId, status: 'completed', counters: { validated: manifest.records.length } })
    return { status: 'dry-run', manifestHash: manifest.manifestHash, validated: manifest.records.length, applied: 0, skipped: 0 }
  }

  let applied = 0, skipped = 0
  const interval = 1000 / requestsPerSecond
  try {
    for (let batchStart = startSequence - 1; batchStart < manifest.records.length; batchStart += batchSize) {
      const batch = manifest.records.slice(batchStart, batchStart + batchSize)
      for (let offset = 0; offset < batch.length; offset += 1) {
        const record = batch[offset], sequence = batchStart + offset + 1
        const reservation = await target.reserve({ runId, sequence, record })
        if (reservation === 'already_applied') { skipped += 1; continue }
        let attempt = 0
        while (true) {
          attempt += 1
          try {
            await target.apply(record, { runId })
            await target.complete(record, { runId })
            applied += 1
            await emit({ phase: 'record', kind: record.kind, keyHash: record.keyHash, sourceHash: record.sourceHash, status: 'applied', attempt })
            break
          } catch (error) {
            const errorClass = classifyRetry(error)
            if (errorClass !== 'transient' || attempt > maxRetries) {
              await target.fail(record, errorClass, { runId })
              await emit({ phase: 'record', kind: record.kind, keyHash: record.keyHash, sourceHash: record.sourceHash, status: 'failed', attempt, errorClass })
              throw error
            }
            await emit({ phase: 'record', kind: record.kind, keyHash: record.keyHash, sourceHash: record.sourceHash, status: 'retry', attempt, errorClass })
            await wait(Math.min(25 * (2 ** (attempt - 1)), 250))
          }
        }
        if (interval >= 1) await wait(interval)
      }
      const nextSequence = batchStart + batch.length + 1
      await checkpoint?.write({ version: 1, ...binding, nextSequence, applied, skipped })
      await emit({ phase: 'checkpoint', status: 'saved', checkpoint: nextSequence, count: applied })
    }
    const reconciliation = await target.reconcile(manifest)
    if (reconciliation.status !== 'pass') throw Object.assign(new Error('post-migration reconciliation failed'), { reconciliation })
    await target.finishRun({ runId, status: 'completed', counters: { applied, skipped } })
    await emit({ phase: 'run', status: 'completed', count: applied })
    return { status: 'completed', manifestHash: manifest.manifestHash, applied, skipped, reconciliation }
  } catch (error) {
    await target.finishRun({ runId, status: 'failed', counters: { applied, skipped } })
    throw error
  }
}
