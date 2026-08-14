import { currentAuthRolloutDecision } from './authRollout'
import { currentPublishingRolloutDecision } from './publishingRollout'

export type CommunityRolloutVersion = 'firebase-v1' | 'supabase-v1'
export interface CommunityRolloutDecision { version: CommunityRolloutVersion, candidateMarker: string | null, reason: string }

export function resolveCommunityRollout(config: Record<string,string|undefined>, dependencies = {
  auth: currentAuthRolloutDecision().version, publishing: currentPublishingRolloutDecision().version,
}): CommunityRolloutDecision {
  if (config.version !== 'supabase-v1' || config.enabled !== 'true')
    return { version:'firebase-v1',candidateMarker:null,reason:'Firebase community workflows remain the default.' }
  if (!config.marker?.startsWith('community-c6-'))
    return { version:'firebase-v1',candidateMarker:null,reason:'Community reconciliation marker is missing.' }
  if (['comments','relationships','votes','counts','subscriptions','timestamps','orphans']
    .some(key => config[key] !== 'true'))
    return { version:'firebase-v1',candidateMarker:null,reason:'Community reconciliation comparisons are not exact.' }
  if (config.task008Ready !== 'true')
    return { version:'firebase-v1',candidateMarker:null,reason:'Task 008 cutover approval is not recorded.' }
  if (dependencies.auth !== 'supabase-v1' || dependencies.publishing !== 'supabase-v1')
    return { version:'firebase-v1',candidateMarker:null,reason:'Supabase identity and publishing must already be reconciled.' }
  return { version:'supabase-v1',candidateMarker:config.marker,reason:'Candidate requires database marker verification.' }
}

export function currentCommunityRolloutDecision(): CommunityRolloutDecision {
  return resolveCommunityRollout({
    version:import.meta.env.VITE_COMMUNITY_PROVIDER_VERSION,
    enabled:import.meta.env.VITE_SUPABASE_COMMUNITY_ENABLED,
    marker:import.meta.env.VITE_SUPABASE_COMMUNITY_RECONCILIATION_MARKER,
    comments:import.meta.env.VITE_SUPABASE_COMMUNITY_COMMENTS_MATCH,
    relationships:import.meta.env.VITE_SUPABASE_COMMUNITY_RELATIONSHIPS_MATCH,
    votes:import.meta.env.VITE_SUPABASE_COMMUNITY_VOTES_MATCH,
    counts:import.meta.env.VITE_SUPABASE_COMMUNITY_COUNTS_MATCH,
    subscriptions:import.meta.env.VITE_SUPABASE_COMMUNITY_SUBSCRIPTIONS_MATCH,
    timestamps:import.meta.env.VITE_SUPABASE_COMMUNITY_TIMESTAMPS_MATCH,
    orphans:import.meta.env.VITE_SUPABASE_COMMUNITY_ORPHANS_RESOLVED,
    task008Ready:import.meta.env.VITE_TASK008_COMMUNITY_CUTOVER_READY,
  })
}
