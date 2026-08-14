import { currentAuthRolloutDecision } from './authRollout'

export type PublishingRolloutVersion = 'firebase-v1' | 'supabase-v1'

export interface PublishingRolloutDecision {
  version: PublishingRolloutVersion
  candidateMarker: string | null
  reason: string
}

export function resolvePublishingRollout(config: Record<string, string | undefined>): PublishingRolloutDecision {
  if (config.version !== 'supabase-v1' || config.enabled !== 'true') {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'Firebase publishing remains the default.' }
  }
  if (!config.marker?.startsWith('publishing-c5-')) {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'Publishing reconciliation marker is missing.' }
  }
  if (config.countsMatch !== 'true' || config.identitiesMatch !== 'true'
    || config.linksMatch !== 'true' || config.metricsMatch !== 'true') {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'Publishing reconciliation thresholds are not green.' }
  }
  if (currentAuthRolloutDecision().version !== 'supabase-v1') {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'Supabase publishing requires the reconciled Supabase identity rollout.' }
  }
  return { version: 'supabase-v1', candidateMarker: config.marker, reason: 'Candidate requires database marker verification.' }
}

export function currentPublishingRolloutDecision(): PublishingRolloutDecision {
  return resolvePublishingRollout({
    version: import.meta.env.VITE_PUBLISHING_PROVIDER_VERSION,
    enabled: import.meta.env.VITE_SUPABASE_PUBLISHING_ENABLED,
    marker: import.meta.env.VITE_SUPABASE_PUBLISHING_RECONCILIATION_MARKER,
    countsMatch: import.meta.env.VITE_SUPABASE_PUBLISHING_COUNTS_MATCH,
    identitiesMatch: import.meta.env.VITE_SUPABASE_PUBLISHING_IDENTITIES_MATCH,
    linksMatch: import.meta.env.VITE_SUPABASE_PUBLISHING_LINKS_MATCH,
    metricsMatch: import.meta.env.VITE_SUPABASE_PUBLISHING_METRICS_MATCH,
  })
}
