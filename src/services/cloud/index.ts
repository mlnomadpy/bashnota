export type { CloudApi } from './api'
export { CloudError } from './types'
export type {
  CloudComment, CloudPage, CloudPageRequest, CloudProfile, CloudPublication,
  CloudPublicationStats, CloudResult, CloudSession, CloudSubscription, CloudUser,
  CloudVoteResult, VoteKind,
} from './types'
/**
 * Auth and profile identity move first while publication/comment/statistics
 * remain on the rollback-compatible Firebase adapter until their own tasks.
 * Consumers still receive one provider-neutral CloudApi.
 */
export async function getDefaultCloudApi(): Promise<import('./api').CloudApi> {
  const [{ firebaseCompatibilityApi }, { getSupabaseAuthProfilesApi }] = await Promise.all([
    import('./firebaseCompatibility'),
    import('./supabaseAuthProfiles'),
  ])
  const identityApi = await getSupabaseAuthProfilesApi()
  return {
    ...firebaseCompatibilityApi,
    auth: identityApi.auth,
    profiles: identityApi.profiles,
  }
}
