import { AxiosHeaders } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const doubles = vi.hoisted(() => ({
  currentSession: vi.fn(),
}))

vi.mock('@/services/cloud', () => ({
  getDefaultCloudApi: async () => ({ auth: { currentSession: doubles.currentSession } }),
}))

import { authorizeCloudRequest } from '../axios'

function request(): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders({ Authorization: 'Bearer stale-token' }) } as InternalAxiosRequestConfig
}

describe('cloud HTTP authorization', () => {
  beforeEach(() => doubles.currentSession.mockReset())

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
})
