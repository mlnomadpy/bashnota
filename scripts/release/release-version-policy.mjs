function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function assertReleaseVersionBinding({
  requestedVersion,
  packageVersion,
  changelog,
  requireReleasedHeading = false,
}) {
  if (requestedVersion !== packageVersion) {
    throw new Error(`Release version ${requestedVersion} does not match package.json version ${packageVersion}.`)
  }
  if (!requireReleasedHeading) return

  const releasedHeading = new RegExp(
    `^## \\[?${escapeRegExp(requestedVersion)}\\]?(?:\\s+-\\s+\\d{4}-\\d{2}-\\d{2})?\\s*$`,
    'm',
  )
  if (!releasedHeading.test(changelog)) {
    throw new Error(`CHANGELOG.md is missing a released heading for ${requestedVersion}.`)
  }
}
