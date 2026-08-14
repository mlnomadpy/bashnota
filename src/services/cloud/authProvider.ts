import type { CloudAuthApi, CloudProfilesApi } from './api'
import { currentAuthRolloutDecision } from './authRollout'
import { getSupabaseBrowserClient } from './supabaseBrowser'

export interface IdentityCloudApi {
  auth: CloudAuthApi
  profiles: CloudProfilesApi
}

let selected: Promise<IdentityCloudApi> | undefined

export function getIdentityCloudApi(): Promise<IdentityCloudApi> {
  selected ??= selectIdentityCloudApi()
  return selected
}

async function selectIdentityCloudApi(): Promise<IdentityCloudApi> {
  const decision = currentAuthRolloutDecision()
  if (decision.version !== 'supabase-v1' || !decision.candidateMarker) {
    return (await import('./firebaseCompatibility')).firebaseCompatibilityApi
  }

  // The build flags are only a candidate. The restricted reconciliation job
  // must independently activate the exact marker in Postgres. Any network,
  // configuration, or marker mismatch fails closed to Firebase compatibility.
  try {
    const client = await getSupabaseBrowserClient()
    const verification = await client.rpc('verify_auth_rollout', {
      p_version: 'supabase-v1',
      p_marker: decision.candidateMarker,
    })
    if (!verification.error && verification.data === true) {
      return (await import('./supabaseAuthProfiles')).getSupabaseAuthProfilesApi()
    }
  } catch { /* fail closed below */ }
  return (await import('./firebaseCompatibility')).firebaseCompatibilityApi
}

export function resetIdentityCloudApiForTests(): void {
  selected = undefined
}
