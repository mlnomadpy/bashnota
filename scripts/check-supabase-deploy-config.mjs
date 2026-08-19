import { existsSync } from 'node:fs'

const sha256Pattern = /^[0-9a-f]{64}$/

function isSupabaseUrl(value, allowLocal) {
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' && url.hostname.endsWith('.supabase.co')) ||
      (allowLocal && url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))
  } catch {
    return false
  }
}

function isPublishable(value) {
  return Boolean(value && value.startsWith('sb_publishable_') &&
    !/service[_-]?role|secret|sb_secret_/i.test(value))
}

export function validateSupabaseDeployConfig(env) {
  const errors = []
  const allowLocal = env.SUPABASE_DEPLOY_GATE_ALLOW_HTTP_LOCAL === 'true'
  const url = env.VITE_SUPABASE_URL
  const verifierUrl = env.SUPABASE_DEPLOY_VERIFIER_URL || url

  if (env.VITE_AUTH_PROVIDER_VERSION && env.VITE_AUTH_PROVIDER_VERSION !== 'supabase-v1') errors.push('VITE_AUTH_PROVIDER_VERSION must be supabase-v1')
  if (!isSupabaseUrl(url, allowLocal)) errors.push('VITE_SUPABASE_URL must be a valid Supabase HTTPS project URL')
  if (!isPublishable(env.VITE_SUPABASE_PUBLISHABLE_KEY)) errors.push('VITE_SUPABASE_PUBLISHABLE_KEY must be a browser-safe publishable key')
  if (!sha256Pattern.test(env.SUPABASE_MIGRATION_EVIDENCE_SHA256 || '')) errors.push('SUPABASE_MIGRATION_EVIDENCE_SHA256 must be a SHA-256 digest')
  if (!sha256Pattern.test(env.SUPABASE_RECONCILIATION_EVIDENCE_SHA256 || '')) errors.push('SUPABASE_RECONCILIATION_EVIDENCE_SHA256 must be a SHA-256 digest')
  if (!env.SUPABASE_DEPLOY_VERIFIER_KEY || isPublishable(env.SUPABASE_DEPLOY_VERIFIER_KEY)) errors.push('SUPABASE_DEPLOY_VERIFIER_KEY must be a server-only verifier credential')
  if (!isSupabaseUrl(verifierUrl, allowLocal)) errors.push('SUPABASE_DEPLOY_VERIFIER_URL must be a valid verifier endpoint')
  if (!allowLocal && verifierUrl !== url) errors.push('SUPABASE_DEPLOY_VERIFIER_URL must match VITE_SUPABASE_URL in production')
  if (env.VITE_SUPABASE_ANON_KEY) errors.push('VITE_SUPABASE_ANON_KEY is prohibited; use VITE_SUPABASE_PUBLISHABLE_KEY')
  if (Object.keys(env).some(name => name.startsWith('VITE_FIREBASE_'))) errors.push('Firebase browser configuration is prohibited')
  return errors
}

export async function verifyProductionCutover(env, fetchImpl = fetch) {
  const errors = validateSupabaseDeployConfig(env)
  if (errors.length) return { errors }
  const verifierUrl = env.SUPABASE_DEPLOY_VERIFIER_URL || env.VITE_SUPABASE_URL
  try {
    const response = await fetchImpl(`${verifierUrl}/rest/v1/runtime_deployment_state?singleton=eq.true&production_cutover=is.true&select=production_cutover`, {
      headers: { apikey: env.SUPABASE_DEPLOY_VERIFIER_KEY, Authorization: `Bearer ${env.SUPABASE_DEPLOY_VERIFIER_KEY}` },
    })
    if (!response.ok) return { errors: [`production cutover verifier failed (${response.status})`] }
    if (!(await response.json()).length) return { errors: ['runtime_deployment_state.production_cutover approval is missing'] }
    return { errors: [] }
  } catch {
    return { errors: ['production cutover verifier is unreachable'] }
  }
}

if (import.meta.main) {
  if (existsSync('.env')) process.loadEnvFile?.('.env')
  const { errors } = await verifyProductionCutover(process.env)
  if (errors.length) {
    for (const error of errors) console.error(`::error::${error}`)
    process.exitCode = 1
  } else console.log('Supabase production deployment configuration and approved cutover passed.')
}
