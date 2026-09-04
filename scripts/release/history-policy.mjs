export function isCanonicalHistoryRef(ref) {
  return ref === 'refs/heads/master'
    || ref === 'refs/remotes/origin/master'
    || ref.startsWith('refs/heads/release/')
    || ref.startsWith('refs/remotes/origin/release/')
    || ref.startsWith('refs/tags/')
}

export function canonicalHistoryRefs(runGit) {
  const discovered = runGit(
    'for-each-ref',
    '--format=%(refname)',
    'refs/heads/master',
    'refs/heads/release',
    'refs/remotes/origin/master',
    'refs/remotes/origin/release',
    'refs/tags',
  )
    .split('\n')
    .filter(Boolean)
    .filter(isCanonicalHistoryRef)
  const refs = new Set(discovered)
  if (refs.has('refs/remotes/origin/master')) refs.delete('refs/heads/master')
  for (const ref of refs) {
    if (!ref.startsWith('refs/remotes/origin/release/')) continue
    refs.delete(ref.replace('refs/remotes/origin/release/', 'refs/heads/release/'))
  }
  return ['HEAD', ...[...refs].sort()]
}

export function forbiddenBundleRef(ref) {
  if (ref === 'HEAD' || isCanonicalHistoryRef(ref)) return null
  return 'non-canonical or private Git ref'
}
