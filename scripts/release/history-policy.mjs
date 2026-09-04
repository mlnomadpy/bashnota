function matchesPattern(ref, pattern) {
  if (!pattern.endsWith('*')) return ref === pattern
  return ref.startsWith(pattern.slice(0, -1))
}

export function validateHistoryBranchLedger(ledger) {
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.include) || !Array.isArray(ledger.exclude)) {
    throw new Error('Invalid release history branch-classification ledger.')
  }
  for (const pattern of [...ledger.include, ...ledger.exclude]) {
    if (typeof pattern !== 'string' || !pattern.startsWith('refs/')) {
      throw new Error(`Invalid release history ref pattern: ${String(pattern)}`)
    }
  }
  for (const pattern of ledger.include) {
    if (ledger.exclude.includes(pattern)) throw new Error(`History ref pattern is both included and excluded: ${pattern}`)
  }
  return ledger
}

export function classifyHistoryRef(ref, ledger) {
  validateHistoryBranchLedger(ledger)
  if (ref.startsWith('refs/tags/')) return 'include'
  if (ledger.include.some((pattern) => matchesPattern(ref, pattern))) return 'include'
  if (ledger.exclude.some((pattern) => matchesPattern(ref, pattern))) return 'exclude'
  return 'unclassified'
}

export function isCanonicalHistoryRef(ref, ledger) {
  return classifyHistoryRef(ref, ledger) === 'include'
}

export function canonicalHistoryRefs(runGit, ledger) {
  validateHistoryBranchLedger(ledger)
  const discovered = runGit('for-each-ref', '--format=%(refname)', 'refs/heads', 'refs/remotes', 'refs/tags')
    .split('\n')
    .filter(Boolean)
  const refs = new Set()
  for (const ref of discovered) {
    const classification = classifyHistoryRef(ref, ledger)
    if (classification === 'include') {
      refs.add(ref)
      continue
    }
    if (classification === 'exclude') continue
    const uniqueCount = Number(runGit('rev-list', '--count', `HEAD..${ref}`))
    if (!Number.isSafeInteger(uniqueCount) || uniqueCount < 0) {
      throw new Error(`Could not classify unique history for branch ref: ${ref}`)
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
