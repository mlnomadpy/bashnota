export function canonicalHistoryRefs(runGit) {
  const tags = runGit('for-each-ref', '--format=%(refname)', 'refs/tags')
    .split('\n')
    .filter(Boolean)
    .sort()
  return ['HEAD', ...tags]
}

export function forbiddenBundleRef(ref) {
  if (ref === 'HEAD' || ref.startsWith('refs/tags/')) return null
  return 'non-canonical or private Git ref'
}
