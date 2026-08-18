import { sha256 } from './canonical.mjs'

export class FileTarget {
  constructor({ transientFailures = {}, records = [] } = {}) {
    this.records = new Map(); this.journal = new Map(); this.runs = new Map(); this.calls = []
    this.transientFailures = new Map(Object.entries(transientFailures))
    for (const record of records) this.records.set(record.keyHash, structuredClone(record))
  }
  async preflight(manifest) {
    for (const record of manifest.records) {
      const existing = this.records.get(record.keyHash)
      if (existing && existing.sourceHash !== record.sourceHash) throw Object.assign(new Error('pre-existing target conflict'), { code: '23505' })
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
      if (prior.sourceHash !== record.sourceHash) throw Object.assign(new Error('immutable source conflict'), { code: '23505' })
      if (prior.state === 'applied') return 'already_applied'
      if (prior.runId !== runId) throw Object.assign(new Error('record belongs to a different run'), { code: '23505' })
      prior.state = 'applying'; prior.attempts += 1; return 'resume'
    }
    this.journal.set(record.keyHash, { runId, sequence, kind: record.kind, sourceHash: record.sourceHash, state: 'applying', attempts: 1 })
    return 'reserved'
  }
  async apply(record, { runId } = {}) {
    this.calls.push(record.keyHash)
    const remaining = this.transientFailures.get(record.keyHash) ?? 0
    if (remaining > 0) { this.transientFailures.set(record.keyHash, remaining - 1); throw Object.assign(new Error('temporary fixture failure'), { code: '503' }) }
    const prior = this.records.get(record.keyHash)
    if (prior && prior.sourceHash !== record.sourceHash) throw Object.assign(new Error('target conflict'), { code: '23505' })
    const journal = this.journal.get(record.keyHash)
    if (!journal || journal.runId !== runId || journal.state !== 'applying') throw new Error('record is not owned by this applying run')
    if (prior && journal.mutationKind !== 'created') journal.mutationKind = 'preexisting'
    else { this.records.set(record.keyHash, structuredClone(record)); journal.mutationKind = 'created' }
    journal.appliedByRunId = runId
  }
  async complete(record, { runId } = {}) {
    const journal = this.journal.get(record.keyHash)
    if (journal.runId !== runId || journal.appliedByRunId !== runId || !journal.mutationKind) throw new Error('record completion is not owned by this run')
    journal.state = 'applied'
  }
  async fail(record, errorClass, { runId } = {}) {
    const journal = this.journal.get(record.keyHash)
    if (journal.runId !== runId) throw new Error('record failure is not owned by this run')
    Object.assign(journal, { state: 'failed', errorClass })
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
