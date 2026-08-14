export type { CloudApi } from './api'
export { CloudError } from './types'
export type {
  CloudComment, CloudPage, CloudPageRequest, CloudProfile, CloudPublication,
  CloudPublicationStats, CloudResult, CloudSession, CloudSubscription, CloudUser,
  CloudVoteResult, VoteKind,
} from './types'
/** Legacy workflows remain Firebase-backed until task 007 migrates them. */
export async function getDefaultCloudApi(): Promise<import('./api').CloudApi> {
  return (await import('./firebaseCompatibility')).firebaseCompatibilityApi
}

export { getIdentityCloudApi } from './authProvider'
export { currentAuthRolloutDecision, resolveAuthRollout } from './authRollout'
