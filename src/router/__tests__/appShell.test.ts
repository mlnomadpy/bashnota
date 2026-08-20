import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/auth/stores/auth', () => ({
  useAuthStore: () => ({
    isInitialized: true,
    isAuthenticated: false,
    init: vi.fn(),
  }),
}))

import App from '@/App.vue'
import router from '@/router'

const mountApp = () => mount(App, {
  global: {
    plugins: [router],
    stubs: { RouterView: { template: '<div data-test="route-view" />' } },
  },
})

describe('route-aware application shell', () => {
  beforeEach(async () => {
    await router.push('/')
  })

  it.each([
    ['/', 'home'],
    ['/login', 'login'],
    ['/p/published-nota', 'public-nota'],
    ['/settings', 'settings-detail'],
  ])('mounts %s without the editor shell', async (destination, expectedRoute) => {
    await router.push(destination)
    const wrapper = mountApp()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe(expectedRoute)
    expect(wrapper.find('[data-test="editor-shell"]').exists()).toBe(false)
  })

  it('classifies editor-capable routes for the lazy shell', async () => {
    await router.push('/nota/local-nota')

    expect(router.currentRoute.value.meta.editorShell).toBe(true)
  })
})
