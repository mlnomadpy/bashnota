import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSupabasePublishingApi, normalizeReferrer } from '../supabasePublishing'

const row = {
  id: 'nota-1', title: 'Public', content: { type: 'doc' }, author_name: 'Author',
  author_tag: 'stable_tag', is_sub_page: false, parent_id: null,
  published_sub_pages: ['child-b', 'child-a'], published_nota_citations: [{ id: 'b' }, { id: 'a' }],
  tags: ['safe'], published_at: '2026-08-13T00:00:00Z', updated_at: '2026-08-13T00:00:00Z',
  view_count: 2, unique_viewers: 1, like_count: 0, dislike_count: 0,
  clone_count: 0, comment_count: 0, last_viewed_at: null,
}

describe('Supabase publishing boundary', () => {
  afterEach(() => vi.useRealTimers())

  it('normalizes URL referrers to a bounded dotted host', () => {
    const long = `${'a'.repeat(80)}.deep.analytics.example.com`
    expect(normalizeReferrer(`https://${long}/private/path?q=secret`)).toBe(long)
    expect(normalizeReferrer('javascript:alert(1)')).toBeNull()
    expect(normalizeReferrer('host/with/path')).toBeNull()
  })

  it('maps only the safe RPC projection and preserves ordered arrays', async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: [row], error: null }) }
    const api = createSupabasePublishingApi(client as never)
    const result = await api.publishing.getPublication('nota-1')
    expect(result).toMatchObject({ ok: true, data: {
      id: 'nota-1', authorId: '', authorTag: 'stable_tag',
      publishedSubPages: ['child-b', 'child-a'], citations: [{ id: 'b' }, { id: 'a' }],
    } })
    expect(client.rpc).toHaveBeenCalledWith('query_publications', { p_id: 'nota-1', p_limit: 1 })
  })

  it('refresh polling never records a duplicate view', async () => {
    vi.useFakeTimers()
    const client = { rpc: vi.fn().mockResolvedValue({ data: [row], error: null }) }
    const api = createSupabasePublishingApi(client as never)
    const listener = vi.fn()
    const subscription = api.publishing.subscribeToPublication('nota-1', listener)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(listener).toHaveBeenCalledTimes(2)
    expect(client.rpc).toHaveBeenCalledTimes(2)
    expect(client.rpc.mock.calls.every(call => call[0] === 'query_publications')).toBe(true)
    subscription.unsubscribe()
  })

  it('sends a normalized host to the single atomic view RPC', async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: [{ view_count: 3, unique_viewers: 1 }], error: null }) }
    const api = createSupabasePublishingApi(client as never)
    await expect(api.statistics.recordView('nota-1', 'https://reader.example.com/a')).resolves
      .toEqual({ ok: true, data: { viewCount: 3, uniqueViewers: 1 } })
    expect(client.rpc).toHaveBeenCalledWith('record_nota_view', {
      p_nota_id: 'nota-1', p_referrer_key: 'reader.example.com',
    })
  })
})
