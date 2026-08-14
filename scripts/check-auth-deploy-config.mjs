const isUrl = value => {
  try { return new URL(value).protocol === 'https:' } catch { return false }
}
const isPublishable = value => Boolean(
  value && !/service[_-]?role|sb_secret_/i.test(value)
  && value.startsWith('sb_publishable_'),
)

export function validateAuthDeployConfig(env) {
  const errors = []
  const provider = env.VITE_AUTH_PROVIDER_VERSION || 'firebase-v1'
  if (!['firebase-v1', 'supabase-v1'].includes(provider)) errors.push('unsupported VITE_AUTH_PROVIDER_VERSION')
  if (!isUrl(env.VITE_APP_BASE_URL)) errors.push('VITE_APP_BASE_URL must be an HTTPS deployment URL')
  if (!isUrl(env.VITE_SUPABASE_URL)) errors.push('VITE_SUPABASE_URL must be an HTTPS project URL')
  if (!isPublishable(env.VITE_SUPABASE_PUBLISHABLE_KEY)) errors.push('VITE_SUPABASE_PUBLISHABLE_KEY must be a browser-safe publishable key')
  if (env.VITE_SUPABASE_ANON_KEY) errors.push('production deploys must use VITE_SUPABASE_PUBLISHABLE_KEY, not the legacy anon-key variable')
  if (provider === 'supabase-v1') {
    if (env.VITE_SUPABASE_AUTH_ENABLED !== 'true') errors.push('Supabase auth rollout flag is not enabled')
    if (!env.VITE_SUPABASE_AUTH_RECONCILIATION_MARKER?.startsWith('auth-c4-')) errors.push('verified auth reconciliation marker is missing')
    if (Number(env.VITE_SUPABASE_AUTH_RECONCILED_PERCENT) !== 100) errors.push('auth reconciliation is not 100%')
    if (Number(env.VITE_SUPABASE_AUTH_IDENTITY_MISMATCHES) !== 0) errors.push('auth identity mismatches are not zero')
  }
  return errors
}

if (process.argv.includes('--self-test')) {
  const fixture = {
    VITE_AUTH_PROVIDER_VERSION: 'firebase-v1',
    VITE_APP_BASE_URL: 'https://offline.bashnota.com',
    VITE_SUPABASE_URL: 'https://project.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture',
  }
  if (validateAuthDeployConfig(fixture).length) throw new Error('valid Firebase-default production fixture failed')
  if (!validateAuthDeployConfig({ ...fixture, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_bad' }).length) throw new Error('privileged key fixture was accepted')
  if (!validateAuthDeployConfig({ ...fixture, VITE_AUTH_PROVIDER_VERSION: 'supabase-v1' }).length) throw new Error('unreconciled Supabase fixture was accepted')
  console.log('Authentication deployment configuration self-test passed.')
} else {
  // Deployment writes the build inputs to .env immediately before this gate.
  // Node does not load that file implicitly.
  if (existsSync('.env')) process.loadEnvFile?.('.env')
  const errors = validateAuthDeployConfig(process.env)
  if (errors.length) {
    for (const error of errors) console.error(`::error::${error}`)
    process.exitCode = 1
  } else console.log('Authentication deployment configuration passed.')
}
import { existsSync } from 'node:fs'
