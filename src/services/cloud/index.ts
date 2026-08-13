export type { CloudApi } from './api'
export { CloudError } from './types'
export type {
  CloudComment, CloudPage, CloudPageRequest, CloudProfile, CloudPublication,
  CloudPublicationStats, CloudResult, CloudSession, CloudSubscription, CloudUser,
  CloudVoteResult, VoteKind,
} from './types'
export { getSupabaseBrowserClient } from './supabaseBrowser'

/**
 * The migration starts Firebase-primary. Dynamic loading keeps this temporary
 * compatibility layer out of unrelated product chunks and gives later tasks
 * one switch point for a Supabase implementation.
 */
export async function getDefaultCloudApi(): Promise<import('./api').CloudApi> {
  return (await import('./firebaseCompatibility')).firebaseCompatibilityApi
}
