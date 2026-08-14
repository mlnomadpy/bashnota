import { AxiosHeaders } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const doubles = vi.hoisted(() => ({
  currentSession: vi.fn(),
  rolloutVersion: 'firebase-v1',
}))

vi.mock('@/services/cloud', () => ({
  getDefaultCloudApi: async () => ({ auth: { currentSession: doubles.currentSession } }),
  CloudError: class CloudError extends Error {
    constructor(public code: string, message: string) { super(message) }
  },
}))
vi.mock('@/services/cloud/authRollout', () => ({
  currentAuthRolloutDecision: () => ({ version: doubles.rolloutVersion }),
}))

import { authorizeCloudRequest } from '../axios'

function request(): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders({ Authorization: 'Bearer stale-token' }) } as InternalAxiosRequestConfig
}

describe('cloud HTTP authorization', () => {
  beforeEach(() => {
    doubles.currentSession.mockReset()
    doubles.rolloutVersion = 'firebase-v1'
  })

  it('uses the provider-restored access token for an active session', async () => {
    doubles.currentSession.mockResolvedValue({ ok: true, data: { accessToken: 'active-token' } })
    const config = await authorizeCloudRequest(request())
    expect(config.headers.get('Authorization')).toBe('Bearer active-token')
  })

  it('removes a stale bearer when an expired session cannot refresh', async () => {
    doubles.currentSession.mockResolvedValue({ ok: true, data: null })
    const config = await authorizeCloudRequest(request())
    expect(config.headers.has('Authorization')).toBe(false)
  })

  it('fails closed without a session when the provider is unavailable', async () => {
    doubles.currentSession.mockResolvedValue({ ok: false, error: new Error('unavailable') })
    const config = await authorizeCloudRequest(request())
    expect(config.headers.has('Authorization')).toBe(false)
  })

  it('truthfully blocks Firebase-backed mutations for a Supabase-only session', async () => {
    doubles.rolloutVersion = 'supabase-v1'
    doubles.currentSession.mockResolvedValue({ ok: true, data: null })
    const config = request()
    config.method = 'post'
    await expect(authorizeCloudRequest(config)).rejects.toMatchObject({
      code: 'unavailable',
      message: expect.stringContaining('Firebase compatibility session'),
    })
  })
})
