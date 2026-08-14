export type AuthRolloutVersion = 'firebase-v1' | 'supabase-v1'

export interface AuthRolloutConfiguration {
  providerVersion?: string
  supabaseEnabled?: string
  reconciliationMarker?: string
  reconciledPercent?: string
  identityMismatches?: string
  deployUrl?: string
  supabaseUrl?: string
  publishableKey?: string
}

export interface AuthRolloutDecision {
  version: AuthRolloutVersion
  candidateMarker: string | null
  reason: string
}

const safePublishableKey = (value: string | undefined, production: boolean): boolean => Boolean(
  value
  && !/service[_-]?role|sb_secret_/i.test(value)
  && (value.startsWith('sb_publishable_') || (!production && value.split('.').length === 3)),
)

const validUrl = (value: string | undefined, production: boolean): boolean => {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return production ? parsed.protocol === 'https:' : ['http:', 'https:'].includes(parsed.protocol)
  } catch { return false }
}

export function resolveAuthRollout(
  config: AuthRolloutConfiguration,
  production = import.meta.env.PROD,
): AuthRolloutDecision {
  if (config.providerVersion !== 'supabase-v1') {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'Firebase compatibility is the default until an explicit versioned cutover.' }
  }
  if (config.supabaseEnabled !== 'true') {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'The Supabase public rollout flag is disabled.' }
  }
  if (!config.reconciliationMarker?.startsWith('auth-c4-')) {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'No versioned reconciliation marker was supplied.' }
  }
  if (Number(config.reconciledPercent) !== 100 || Number(config.identityMismatches) !== 0) {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'Identity reconciliation thresholds are not green.' }
  }
  if (!validUrl(config.deployUrl, production) || !validUrl(config.supabaseUrl, production) || !safePublishableKey(config.publishableKey, production)) {
    return { version: 'firebase-v1', candidateMarker: null, reason: 'Supabase deployment configuration is incomplete or unsafe.' }
  }
  return {
    version: 'supabase-v1',
    candidateMarker: config.reconciliationMarker,
    reason: 'The public build gate is eligible for database reconciliation verification.',
  }
}

export function browserAuthRolloutConfiguration(): AuthRolloutConfiguration {
  return {
    providerVersion: import.meta.env.VITE_AUTH_PROVIDER_VERSION,
    supabaseEnabled: import.meta.env.VITE_SUPABASE_AUTH_ENABLED,
    reconciliationMarker: import.meta.env.VITE_SUPABASE_AUTH_RECONCILIATION_MARKER,
    reconciledPercent: import.meta.env.VITE_SUPABASE_AUTH_RECONCILED_PERCENT,
    identityMismatches: import.meta.env.VITE_SUPABASE_AUTH_IDENTITY_MISMATCHES,
    deployUrl: import.meta.env.VITE_APP_BASE_URL,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
}

export const currentAuthRolloutDecision = (): AuthRolloutDecision =>
  resolveAuthRollout(browserAuthRolloutConfiguration())
