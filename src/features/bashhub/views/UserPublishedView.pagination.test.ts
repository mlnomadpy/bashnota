import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UserPublishedView from './UserPublishedView.vue'
import type { PublishedNota } from '@/features/nota/types/nota'

const publications: PublishedNota[] = Array.from({ length: 125 }, (_, index) => ({
  id: `publication-${index}`,
  title: `Publication ${index}`,
  content: { type: 'doc' },
  authorId: 'owner-1',
  authorName: 'Portfolio Owner',
  authorTag: 'portfolio_owner',
  isPublic: true,
  isSubPage: false,
  parentId: null,
  tags: [],
  citations: [],
  publishedSubPages: [],
  publishedAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  viewCount: index + 1,
  likeCount: 1,
  dislikeCount: 0,
  cloneCount: 2,
  commentCount: 0,
}))

const getPublishedNotasByUser = vi.fn(async () => publications)

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { userId: 'owner-1' } }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/features/nota/stores/nota', () => ({
  useNotaStore: () => ({
    getPublishedNotasByUser,
    loadNota: vi.fn(),
    unpublishNota: vi.fn(),
  }),
}))

vi.mock('@/features/auth/stores/auth', () => ({
  useAuthStore: () => ({ isAuthenticated: false, currentUser: null }),
}))

vi.mock('@/features/auth/services/supabaseAuth', () => ({
  supabaseAuthService: {
    getPublicProfile: vi.fn(async () => ({
      userId: 'owner-1',
      userTag: 'portfolio_owner',
      photoUrl: '',
      updatedAt: '2026-09-01T00:00:00.000Z',
    })),
  },
}))

vi.mock('@/services/toast', () => ({ toast: vi.fn() }))

describe('UserPublishedView complete portfolio totals', () => {
  it('labels and calculates statistics from all 125 cursor-loaded publications', async () => {
    const wrapper = mount(UserPublishedView)
    await flushPromises()

    expect(getPublishedNotasByUser).toHaveBeenCalledWith('owner-1', 'portfolio_owner')
    expect(wrapper.text()).toContain('125 Publications')
    expect(wrapper.text()).toContain('7875 Views')
    expect(wrapper.text()).toContain('125 Likes')
    expect(wrapper.text()).toContain('250 Clones')
  })
})
