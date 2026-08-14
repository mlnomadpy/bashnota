export type { CloudApi } from './api'
export { CloudError } from './types'
export type {
  CloudComment, CloudPage, CloudPageRequest, CloudProfile, CloudPublication, CloudPublicationPageRequest, CloudPublicationWrite,
  CloudPublicationStats, CloudResult, CloudSession, CloudSubscription, CloudUser,
  CloudVoteResult, VoteKind,
} from './types'
export { normalizeCloudPublishedContent } from './types'
/** Legacy workflows remain Firebase-backed until task 007 migrates them. */
export async function getDefaultCloudApi(): Promise<import('./api').CloudApi> {
  return (await import('./firebaseCompatibility')).firebaseCompatibilityApi
}

export { getIdentityCloudApi } from './authProvider'
export { getPublicationCloudApi } from './publishingProvider'
export { currentAuthRolloutDecision, resolveAuthRollout } from './authRollout'
