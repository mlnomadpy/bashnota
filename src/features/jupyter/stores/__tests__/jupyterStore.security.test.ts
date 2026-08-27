import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-sonner', () => ({ toast: vi.fn() }))

import { useJupyterStore } from '../jupyterStore'

describe('Jupyter credential persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('strips legacy tokens on load and rewrites durable storage', () => {
    localStorage.setItem(
      'jupyter-servers',
      JSON.stringify([{ ip: 'localhost', port: '8888', token: 'legacy-token' }]),
    )
    const store = useJupyterStore()

    expect(store.jupyterServers[0].token).toBe('')
    expect(localStorage.getItem('jupyter-servers')).not.toContain('legacy-token')
  })

  it('retains a new token in memory but persists a credential-free server', () => {
    const store = useJupyterStore()
    store.addServer({ ip: 'localhost', port: '8888', token: 'memory-token' })

    expect(store.jupyterServers[0].token).toBe('memory-token')
    expect(localStorage.getItem('jupyter-servers')).not.toContain('memory-token')
  })
})
