import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEditorAIActionsStore } from '../aiActionsStore'

describe('editor AI credential persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('scrubs legacy keys and keeps updates in memory only', () => {
    localStorage.setItem(
      'ai-code-preferences',
      JSON.stringify({
        provider: 'gemini',
        apiKeys: { gemini: 'legacy-secret' },
      }),
    )
    const store = useEditorAIActionsStore()
    expect(store.state.providerSettings.apiKeys).toEqual({})
    expect(localStorage.getItem('ai-code-preferences')).not.toContain('legacy-secret')

    store.updateProviderSettings({ apiKeys: { gemini: 'memory-secret' } })
    expect(store.state.providerSettings.apiKeys.gemini).toBe('memory-secret')
    expect(localStorage.getItem('ai-code-preferences')).not.toContain('memory-secret')
  })
})
