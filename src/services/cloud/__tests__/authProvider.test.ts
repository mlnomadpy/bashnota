import { beforeEach, describe, expect, it, vi } from 'vitest'

const doubles = vi.hoisted(() => ({
  decision: { version: 'firebase-v1', candidateMarker: null } as { version: string; candidateMarker: string | null },
  rpc: vi.fn(),
  firebase: { auth: { provider: 'firebase' }, profiles: { provider: 'firebase' } },
  supabase: { auth: { provider: 'supabase' }, profiles: { provider: 'supabase' } },
}))

vi.mock('../authRollout', () => ({ currentAuthRolloutDecision: () => doubles.decision }))
vi.mock('../supabaseBrowser', () => ({ getSupabaseBrowserClient: async () => ({ rpc: doubles.rpc }) }))
vi.mock('../firebaseCompatibility', () => ({ firebaseCompatibilityApi: doubles.firebase }))
vi.mock('../supabaseAuthProfiles', () => ({ getSupabaseAuthProfilesApi: async () => doubles.supabase }))

import { getIdentityCloudApi, resetIdentityCloudApiForTests } from '../authProvider'

describe('actual identity provider middleware', () => {
  beforeEach(() => {
    resetIdentityCloudApiForTests()
    doubles.decision = { version: 'firebase-v1', candidateMarker: null }
    doubles.rpc.mockReset()
  })

  it('keeps Firebase sessions and profiles in the default compatibility mode', async () => {
    expect(await getIdentityCloudApi()).toBe(doubles.firebase)
    expect(doubles.rpc).not.toHaveBeenCalled()
  })

  it('fails closed to Firebase when Postgres has not verified the candidate marker', async () => {
    doubles.decision = { version: 'supabase-v1', candidateMarker: 'auth-c4-build' }
    doubles.rpc.mockResolvedValue({ data: false, error: null })
    expect(await getIdentityCloudApi()).toBe(doubles.firebase)
    expect(doubles.rpc).toHaveBeenCalledWith('verify_auth_rollout', {
      p_version: 'supabase-v1', p_marker: 'auth-c4-build',
    })
  })

  it('selects Supabase only when build and database reconciliation gates agree', async () => {
    doubles.decision = { version: 'supabase-v1', candidateMarker: 'auth-c4-verified' }
    doubles.rpc.mockResolvedValue({ data: true, error: null })
    expect(await getIdentityCloudApi()).toBe(doubles.supabase)
  })
})
