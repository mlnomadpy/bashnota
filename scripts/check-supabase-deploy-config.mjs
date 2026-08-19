import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

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

  if (!isSupabaseUrl(url, allowLocal)) errors.push('VITE_SUPABASE_URL must be a valid Supabase HTTPS project URL')
  if (!isPublishable(env.VITE_SUPABASE_PUBLISHABLE_KEY)) errors.push('VITE_SUPABASE_PUBLISHABLE_KEY must be a browser-safe publishable key')
  if (!sha256Pattern.test(env.SUPABASE_MIGRATION_EVIDENCE_SHA256 || '')) errors.push('SUPABASE_MIGRATION_EVIDENCE_SHA256 must be a SHA-256 digest')
  if (!sha256Pattern.test(env.SUPABASE_RECONCILIATION_EVIDENCE_SHA256 || '')) errors.push('SUPABASE_RECONCILIATION_EVIDENCE_SHA256 must be a SHA-256 digest')
  if (env.VITE_SUPABASE_ANON_KEY) errors.push('VITE_SUPABASE_ANON_KEY is prohibited; use VITE_SUPABASE_PUBLISHABLE_KEY')
  return errors
}

export async function verifyProductionCutover(env, fetchImpl = fetch) {
  const errors = validateSupabaseDeployConfig(env)
  if (errors.length) return { errors }
  const verifierUrl = env.VITE_SUPABASE_URL
  const publicConfigHash = createHash('sha256')
    .update(`${env.VITE_SUPABASE_URL}\n${env.VITE_SUPABASE_PUBLISHABLE_KEY}`)
    .digest('hex')
  try {
    const response = await fetchImpl(`${verifierUrl}/rest/v1/rpc/verify_production_cutover`, {
      method: 'POST',
      headers: {
        apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_public_config_sha256: publicConfigHash,
        p_migration_evidence_sha256: env.SUPABASE_MIGRATION_EVIDENCE_SHA256,
        p_reconciliation_evidence_sha256: env.SUPABASE_RECONCILIATION_EVIDENCE_SHA256,
      }),
    })
    if (!response.ok) return { errors: [`production cutover verifier failed (${response.status})`] }
    if (await response.json() !== true) return { errors: ['runtime deployment approval does not match this config and evidence'] }
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
