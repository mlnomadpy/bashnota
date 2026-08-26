import assert from 'node:assert/strict'
import { validateSupabaseDeployConfig, verifyProductionCutover } from './check-supabase-deploy-config.mjs'

const valid = {
  VITE_SUPABASE_URL: 'https://project.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_browser-safe',
  SUPABASE_MIGRATION_EVIDENCE_SHA256: 'a'.repeat(64),
  SUPABASE_RECONCILIATION_EVIDENCE_SHA256: 'b'.repeat(64),
}

assert.deepEqual(validateSupabaseDeployConfig(valid), [])
for (const invalid of [
  { VITE_SUPABASE_URL: '' },
  { VITE_SUPABASE_URL: 'http://project.supabase.co' },
  { VITE_SUPABASE_PUBLISHABLE_KEY: '' },
  { VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_server' },
  { VITE_SUPABASE_ANON_KEY: 'legacy-anon' },
  { SUPABASE_MIGRATION_EVIDENCE_SHA256: 'not-a-hash' },
  { SUPABASE_RECONCILIATION_EVIDENCE_SHA256: '' },
]) assert.ok(validateSupabaseDeployConfig({ ...valid, ...invalid }).length, JSON.stringify(invalid))

let request
const approved = await verifyProductionCutover(valid, async (url, options) => {
  request = { url, options }
  return { ok: true, json: async () => true }
})
assert.deepEqual(approved.errors, [])
assert.equal(request.url, 'https://project.supabase.co/rest/v1/rpc/verify_production_cutover')
assert.equal(request.options.headers.apikey, valid.VITE_SUPABASE_PUBLISHABLE_KEY)
assert.ok(!JSON.stringify(request).match(/service.?role|sb_secret_/i))

const mismatch = await verifyProductionCutover({ ...valid, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_different' }, async () => ({ ok: true, json: async () => false }))
assert.match(mismatch.errors.join(' '), /does not match/)
console.log('Supabase production deployment configuration self-test passed.')
