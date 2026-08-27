import { describe, expect, it } from 'vitest'
import { credentialFreeValue } from '../credentialPersistence'

describe('credentialFreeValue', () => {
  it('recursively removes credential keys without mutating input or token-count settings', () => {
    const input = {
      apiKeys: { openai: 'provider-secret' },
      customProviderApiKey: 'custom-provider-secret',
      maxTokens: 2048,
      servers: [{ token: 'jupyter-secret', ip: 'localhost' }],
      nested: { firebaseToken: 'identity-secret', safe: true },
    }

    const result = credentialFreeValue(input)

    expect(JSON.stringify(result)).not.toContain('provider-secret')
    expect(JSON.stringify(result)).not.toContain('custom-provider-secret')
    expect(JSON.stringify(result)).not.toContain('jupyter-secret')
    expect(JSON.stringify(result)).not.toContain('identity-secret')
    expect(result.maxTokens).toBe(2048)
    expect(result.servers[0].ip).toBe('localhost')
    expect(input.servers[0].token).toBe('jupyter-secret')
  })
})
