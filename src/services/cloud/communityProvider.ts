import type { CloudCommentsApi, CloudNewsletterApi, CloudStatisticsApi } from './api'
import { currentCommunityRolloutDecision } from './communityRollout'
import { getSupabaseBrowserClient } from './supabaseBrowser'

export interface CommunityCloudApi {
  comments: CloudCommentsApi
  newsletter: CloudNewsletterApi
  notaVotes: Pick<CloudStatisticsApi,'vote'>
}
let selected: Promise<CommunityCloudApi>|undefined
export function getCommunityCloudApi(): Promise<CommunityCloudApi> { selected ??= select(); return selected }
async function select(): Promise<CommunityCloudApi> {
  const decision=currentCommunityRolloutDecision()
  if (decision.version==='supabase-v1' && decision.candidateMarker) {
    try {
      const client=await getSupabaseBrowserClient()
      const verified=await client.rpc('verify_community_rollout',{p_version:'supabase-v1',p_marker:decision.candidateMarker})
      if (!verified.error && verified.data===true) return (await import('./supabaseCommunity')).createSupabaseCommunityApi(client)
    } catch { /* fail closed to compatibility */ }
  }
  const firebase=await import('./firebaseCompatibility')
  return {comments:firebase.firebaseCompatibilityApi.comments,newsletter:firebase.firebaseCompatibilityApi.newsletter,
    notaVotes:{vote:firebase.firebaseCompatibilityApi.statistics.vote.bind(firebase.firebaseCompatibilityApi.statistics)}}
}
export function resetCommunityCloudApiForTests(){ selected=undefined }
