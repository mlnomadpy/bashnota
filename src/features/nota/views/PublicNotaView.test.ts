import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getPublishedNota } = vi.hoisted(() => ({ getPublishedNota: vi.fn() }))
const { loadNotaContentViewer } = vi.hoisted(() => ({ loadNotaContentViewer: vi.fn() }))

vi.mock('@/features/nota/stores/nota', () => ({
  useNotaStore: () => ({ getPublishedNota, clonePublishedNota: vi.fn() }),
}))
vi.mock('@/features/auth/stores/auth', () => ({
  useAuthStore: () => ({ isAuthenticated: false, currentUser: null }),
}))
vi.mock('@/services/cloud', () => ({
  getPublicationCloudApi: async () => ({ statistics: { getPublicationStats: async () => ({ ok: true, data: { likeCount: 0, dislikeCount: 0, cloneCount: 0 } }) } }),
  getCommunityCloudApi: async () => ({}),
}))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('./notaContentViewerLoader', () => ({ loadNotaContentViewer }))

import PublicNotaView from './PublicNotaView.vue'

const publishedNota = {
  id: 'published-nota', title: 'Published note', content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }] },
  authorId: 'author', authorName: 'Author', authorTag: null, isPublic: true, isSubPage: false, parentId: null,
  tags: [], citations: [], publishedSubPages: [], publishedAt: '2026-08-20T00:00:00.000Z', updatedAt: '2026-08-20T00:00:00.000Z',
  viewCount: 0, uniqueViewers: 0, likeCount: 0, dislikeCount: 0, cloneCount: 0, commentCount: 0, lastViewedAt: null,
}

async function mountPublic() {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/p/:id', component: PublicNotaView }] })
  await router.push('/p/published-nota')
  await router.isReady()
  return mount(PublicNotaView, {
    global: {
      plugins: [router],
      stubs: { CommentSection: true, CitationDialog: true, Button: { template: '<button><slot /></button>' }, Skeleton: true },
    },
  })
}

describe('public nota viewer loader', () => {
  beforeEach(() => {
    getPublishedNota.mockReset()
    getPublishedNota.mockResolvedValue(publishedNota)
    loadNotaContentViewer.mockReset()
  })

  it('shows reader loading only after the published nota fetch completes, then mounts it', async () => {
    let resolveLoader: (component: object) => void = () => undefined
    loadNotaContentViewer.mockImplementation(() => new Promise((resolve) => { resolveLoader = resolve }))
    const wrapper = await mountPublic()
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toContain('Loading published note reader')
    resolveLoader({ template: '<div data-test="public-viewer" />' })
    await flushPromises()
    expect(wrapper.find('[data-test="public-viewer"]').exists()).toBe(true)
  })

  it('renders an actionable retry after the reader chunk rejects', async () => {
    loadNotaContentViewer.mockRejectedValue(new Error('reader chunk unavailable'))
    const wrapper = await mountPublic()
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('reader chunk unavailable')
    loadNotaContentViewer.mockResolvedValue({ template: '<div data-test="public-viewer" />' })
    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-test="public-viewer"]').exists()).toBe(true)
  })
})
