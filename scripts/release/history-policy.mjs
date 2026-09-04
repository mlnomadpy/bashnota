function matchesPattern(ref, pattern) {
  if (!pattern.endsWith('*')) return ref === pattern
  return ref.startsWith(pattern.slice(0, -1))
}

export function validateHistoryBranchLedger(ledger) {
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.include) || !Array.isArray(ledger.preserveUnique) || !Array.isArray(ledger.exclude)) {
    throw new Error('Invalid release history branch-classification ledger.')
  }
  for (const pattern of [...ledger.include, ...ledger.exclude]) {
    if (typeof pattern !== 'string' || !pattern.startsWith('refs/')) {
      throw new Error(`Invalid release history ref pattern: ${String(pattern)}`)
    }
  }
  for (const entry of ledger.preserveUnique) {
    if (typeof entry?.ref !== 'string' || !entry.ref.startsWith('refs/') || entry.ref.includes('*') || !/^[0-9a-f]{40}$/.test(entry.oid ?? '')) {
      throw new Error(`Invalid pinned preserve-unique history ref: ${JSON.stringify(entry)}`)
    }
  }
  const preserveRefs = ledger.preserveUnique.map((entry) => entry.ref)
  if (new Set(preserveRefs).size !== preserveRefs.length) throw new Error('Duplicate pinned preserve-unique history ref.')
  for (const pattern of [...ledger.include, ...preserveRefs]) {
    if (ledger.exclude.includes(pattern)) throw new Error(`History ref pattern is both included and excluded: ${pattern}`)
    if (ledger.include.includes(pattern) && preserveRefs.includes(pattern)) {
      throw new Error(`History ref pattern is both head-bound and preserve-unique: ${pattern}`)
    }
  }
  return ledger
}

export function classifyHistoryRef(ref, ledger) {
  validateHistoryBranchLedger(ledger)
  if (ref.startsWith('refs/tags/')) return 'include'
  if (ledger.include.some((pattern) => matchesPattern(ref, pattern))) return 'include'
  if (ledger.preserveUnique.some((entry) => ref === entry.ref)) return 'preserve-unique'
  if (ledger.exclude.some((pattern) => matchesPattern(ref, pattern))) return 'exclude'
  return 'unclassified'
}

export function isCanonicalHistoryRef(ref, ledger) {
  return ['include', 'preserve-unique'].includes(classifyHistoryRef(ref, ledger))
}

export function canonicalHistoryRefs(runGit, ledger) {
  validateHistoryBranchLedger(ledger)
  const discovered = runGit('for-each-ref', '--format=%(refname)', 'refs/heads', 'refs/remotes', 'refs/tags')
    .split('\n')
    .filter(Boolean)
  const refs = new Set()
  for (const ref of discovered) {
    const classification = classifyHistoryRef(ref, ledger)
    if (classification === 'preserve-unique') {
      const expectedOid = ledger.preserveUnique.find((entry) => entry.ref === ref).oid
      const actualOid = runGit('rev-parse', ref)
      if (actualOid !== expectedOid) {
        throw new Error(`Pinned preserve-unique history ref moved: ${ref} (expected ${expectedOid}, got ${actualOid})`)
      }
      refs.add(ref)
      continue
    }
    if (classification === 'exclude') continue
    const uniqueCount = Number(runGit('rev-list', '--count', `HEAD..${ref}`))
    if (!Number.isSafeInteger(uniqueCount) || uniqueCount < 0) {
      throw new Error(`Could not classify unique history for branch ref: ${ref}`)
    }
    if (classification === 'include') {
      if (uniqueCount === 0) refs.add(ref)
      continue
    }
    if (uniqueCount > 0) {
      throw new Error(`Unclassified branch ref has ${uniqueCount} commit(s) outside release HEAD: ${ref}`)
    }
  }

  if (refs.has('refs/remotes/origin/master')) refs.delete('refs/heads/master')
  for (const ref of refs) {
    if (!ref.startsWith('refs/remotes/origin/release/')) continue
    refs.delete(ref.replace('refs/remotes/origin/release/', 'refs/heads/release/'))
  }
  return ['HEAD', ...[...refs].sort()]
}

export function forbiddenBundleRef(ref, ledger) {
  if (ref === 'HEAD' || isCanonicalHistoryRef(ref, ledger)) return null
  return 'non-canonical or private Git ref'
}
