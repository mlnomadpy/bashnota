import { sha256, stableJson } from './canonical.mjs'

const targetHash = record => sha256(stableJson({ kind: record.kind, keyHash: record.keyHash, payload: record.payload }))
const transient = message => Object.assign(new Error(message), { code: '503' })

export class FileTarget {
  constructor({ transientFailures = {}, lostCompleteResponses = {}, lostAuditResponses = {}, records = [] } = {}) {
    this.records = new Map(); this.journal = new Map(); this.runs = new Map(); this.calls = []; this.completeCalls = []; this.auditCalls = []
    this.audit = new Map(); this.auditSequence = []; this.lostCompleteResponses = new Map(Object.entries(lostCompleteResponses)); this.lostAuditResponses = new Map(Object.entries(lostAuditResponses))
    this.transientFailures = new Map(Object.entries(transientFailures))
    for (const record of records) this.records.set(record.keyHash, structuredClone(record))
  }
  async preflight(manifest) {
    for (const record of manifest.records) {
      const existing = this.records.get(record.keyHash)
      if (existing && stableJson(existing) !== stableJson(record)) throw Object.assign(new Error('pre-existing target conflict'), { code: '23505' })
    }
  }
  async startRun({ runId, manifest, dryRun }) {
    const prior = this.runs.get(runId)
    if (prior && (prior.manifestHash !== manifest.manifestHash || prior.identityPlanHash !== manifest.identityPlanHash)) throw Object.assign(new Error('run manifest conflict'), { code: '23505' })
    this.runs.set(runId, { manifestHash: manifest.manifestHash, identityPlanHash: manifest.identityPlanHash, dryRun, state: 'running' })
  }
  async reserve({ runId, sequence, record }) {
    const prior = this.journal.get(record.keyHash)
    if (prior) {
      if (prior.sourceHash !== record.sourceHash || prior.targetHash !== targetHash(record)) throw Object.assign(new Error('immutable source or target conflict'), { code: '23505' })
      if (prior.state === 'applied') return prior.runId === runId ? 'already_applied_by_run' : 'already_applied'
      if (prior.runId !== runId) throw Object.assign(new Error('record belongs to a different run'), { code: '23505' })
      prior.state = 'applying'; prior.attempts += 1; return 'resume'
    }
    this.journal.set(record.keyHash, { runId, sequence, kind: record.kind, sourceHash: record.sourceHash, targetHash: targetHash(record), state: 'applying', attempts: 1 })
    return 'reserved'
  }
  async apply(record, { runId } = {}) {
    this.calls.push(record.keyHash)
    const remaining = this.transientFailures.get(record.keyHash) ?? 0
    if (remaining > 0) { this.transientFailures.set(record.keyHash, remaining - 1); throw Object.assign(new Error('temporary fixture failure'), { code: '503' }) }
    const prior = this.records.get(record.keyHash)
    if (prior && stableJson(prior) !== stableJson(record)) throw Object.assign(new Error('target conflict'), { code: '23505' })
    const journal = this.journal.get(record.keyHash)
    if (!journal || journal.runId !== runId || journal.state !== 'applying') throw new Error('record is not owned by this applying run')
    if (prior && journal.mutationKind !== 'created') journal.mutationKind = 'preexisting'
    else { this.records.set(record.keyHash, structuredClone(record)); journal.mutationKind = 'created' }
    journal.appliedByRunId = runId
  }
  async complete(record, { runId } = {}) {
    this.completeCalls.push(record.keyHash)
    const journal = this.journal.get(record.keyHash)
    if (journal?.state === 'applied' && journal.runId === runId && journal.appliedByRunId === runId && journal.targetHash === targetHash(record)) return
    if (journal.runId !== runId || journal.appliedByRunId !== runId || !journal.mutationKind) throw new Error('record completion is not owned by this run')
    journal.state = 'applied'
    const remaining = this.lostCompleteResponses.get(record.keyHash) ?? 0
    if (remaining > 0) { this.lostCompleteResponses.set(record.keyHash, remaining - 1); throw transient('completion committed but response was lost') }
  }
  async fail(record, errorClass, { runId } = {}) {
    const journal = this.journal.get(record.keyHash)
    if (journal.runId !== runId) throw new Error('record failure is not owned by this run')
    if (journal.state === 'applied') return
    if (journal.state !== 'applying' && journal.state !== 'failed') throw new Error('record is not in a fail-able state')
    Object.assign(journal, { state: 'failed', errorClass })
  }
  async appendAudit(runId, idempotencyKey, event) {
    this.auditCalls.push(idempotencyKey)
    const eventJson = stableJson(event)
    const prior = this.audit.get(idempotencyKey)
    if (prior) {
      if (prior.runId !== runId || prior.eventJson !== eventJson) throw Object.assign(new Error('audit idempotency conflict'), { code: '23505' })
      return prior.eventHash
    }
    const previousHash = this.auditSequence.at(-1)?.eventHash ?? null
    const sequence = this.auditSequence.length + 1
    const eventHash = sha256(`${previousHash ?? ''}\0${runId}\0${sequence}\0${idempotencyKey}\0${eventJson}`)
    const entry = { runId, sequence, previousHash, idempotencyKey, eventJson, eventHash }
    this.audit.set(idempotencyKey, entry); this.auditSequence.push(entry)
    const remaining = this.lostAuditResponses.get(idempotencyKey) ?? 0
    if (remaining > 0) { this.lostAuditResponses.set(idempotencyKey, remaining - 1); throw transient('audit committed but response was lost') }
    return eventHash
  }
  async reconcile(manifest) {
    const expected = [...manifest.records].sort((a, b) => a.keyHash.localeCompare(b.keyHash)).map(item => item.sourceHash)
    const actual = [...this.records.values()].sort((a, b) => a.keyHash.localeCompare(b.keyHash)).map(item => item.sourceHash)
    return { status: expected.length === actual.length && sha256(expected) === sha256(actual) ? 'pass' : 'fail', count: actual.length, hash: sha256(actual) }
  }
  async finishRun({ runId, status, counters }) { Object.assign(this.runs.get(runId), { state: status, counters }) }
  snapshot() { return structuredClone({ records: [...this.records], journal: [...this.journal], runs: [...this.runs] }) }
  restore(snapshot) { this.records = new Map(structuredClone(snapshot.records)); this.journal = new Map(structuredClone(snapshot.journal)); this.runs = new Map(structuredClone(snapshot.runs)) }
  async rollback(runId) {
    for (const [key, journal] of this.journal) if (journal.runId === runId) {
      if (journal.mutationKind === 'created' && journal.appliedByRunId === runId) this.records.delete(key)
      journal.state = 'rolled-back'
    }
    if (this.runs.has(runId)) this.runs.get(runId).state = 'rolled-back'
  }
}
