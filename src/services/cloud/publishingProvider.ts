import type { CloudPublishingApi, CloudStatisticsApi } from './api'
import { currentPublishingRolloutDecision } from './publishingRollout'
import { getSupabaseBrowserClient } from './supabaseBrowser'

export interface PublicationCloudApi { publishing: CloudPublishingApi, statistics: CloudStatisticsApi }
let selected: Promise<PublicationCloudApi> | undefined

export function getPublicationCloudApi(): Promise<PublicationCloudApi> {
  selected ??= select()
  return selected
}

async function select(): Promise<PublicationCloudApi> {
  const decision = currentPublishingRolloutDecision()
  if (decision.version === 'supabase-v1' && decision.candidateMarker) {
    try {
      const client = await getSupabaseBrowserClient()
      const verified = await client.rpc('verify_publishing_rollout', { p_version: 'supabase-v1', p_marker: decision.candidateMarker })
      if (!verified.error && verified.data === true) return (await import('./supabasePublishing')).createSupabasePublishingApi(client)
    } catch { /* fail closed */ }
  }
  const firebase = await import('./firebaseCompatibility')
  return { publishing: firebase.firebaseCompatibilityApi.publishing, statistics: firebase.firebaseCompatibilityApi.statistics }
}

export function resetPublicationCloudApiForTests() { selected = undefined }
