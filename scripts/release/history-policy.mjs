export function isCanonicalHistoryRef(ref) {
  return ref === 'refs/heads/master'
    || ref === 'refs/remotes/origin/master'
    || ref.startsWith('refs/heads/release/')
    || ref.startsWith('refs/remotes/origin/release/')
    || ref.startsWith('refs/tags/')
}

export function canonicalHistoryRefs(runGit) {
  const refs = runGit(
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
    .sort()
  return ['HEAD', ...refs]
}

export function forbiddenBundleRef(ref) {
  if (ref === 'HEAD' || isCanonicalHistoryRef(ref)) return null
  return 'non-canonical or private Git ref'
}
