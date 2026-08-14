import { describe, expect, it } from 'vitest'
import { resolveAuthRollout } from '../authRollout'

const green = {
  providerVersion: 'supabase-v1',
  supabaseEnabled: 'true',
  reconciliationMarker: 'auth-c4-report-2026-08-13',
  reconciledPercent: '100',
  identityMismatches: '0',
  deployUrl: 'https://offline.bashnota.com',
  supabaseUrl: 'https://project.supabase.co',
  publishableKey: 'sb_publishable_public-test-key',
}

describe('versioned authentication rollout', () => {
  it('defaults production builds to Firebase compatibility', () => {
    expect(resolveAuthRollout({}, true)).toMatchObject({ version: 'firebase-v1', candidateMarker: null })
  })

  it('requires every public flag and reconciliation threshold before becoming a Supabase candidate', () => {
    expect(resolveAuthRollout(green, true)).toMatchObject({
      version: 'supabase-v1', candidateMarker: green.reconciliationMarker,
    })
    expect(resolveAuthRollout({ ...green, reconciledPercent: '99.99' }, true).version).toBe('firebase-v1')
    expect(resolveAuthRollout({ ...green, identityMismatches: '1' }, true).version).toBe('firebase-v1')
    expect(resolveAuthRollout({ ...green, reconciliationMarker: '' }, true).version).toBe('firebase-v1')
    expect(resolveAuthRollout({ ...green, supabaseEnabled: 'false' }, true).version).toBe('firebase-v1')
  })

  it('rejects unsafe production URLs and privileged-looking keys', () => {
    expect(resolveAuthRollout({ ...green, supabaseUrl: 'http://project.supabase.co' }, true).version).toBe('firebase-v1')
    expect(resolveAuthRollout({ ...green, publishableKey: 'sb_secret_never-browser' }, true).version).toBe('firebase-v1')
    expect(resolveAuthRollout({ ...green, publishableKey: 'service-role-never-browser' }, true).version).toBe('firebase-v1')
  })
})
