import { describe, expect, it } from 'vitest'
import { redactSensitiveData, redactSensitiveString } from '../redactSensitiveData'

describe('credential redaction', () => {
  it('redacts provider keys, bearer values, identity JWTs, and URL tokens', () => {
    const jwt = `eyJ${'a'.repeat(20)}.${'b'.repeat(20)}.${'c'.repeat(20)}`
    const input = `Bearer secret.bearer token jupyter-secret https://host/api?token=url-secret&x=1#auth=fragment-secret AIza${'A'.repeat(32)} sk-ant-${'B'.repeat(24)} ${jwt}`
    const result = redactSensitiveString(input)

    expect(result).not.toContain('secret.bearer')
    expect(result).not.toContain('jupyter-secret')
    expect(result).not.toContain('url-secret')
    expect(result).not.toContain('fragment-secret')
    expect(result).not.toContain('AIza')
    expect(result).not.toContain('sk-ant-')
    expect(result).not.toContain(jwt)
    expect(result).toContain('x=1')
  })

  it('recursively redacts objects and error messages without mutating artifacts', () => {
    const error = new Error('request failed at https://host?access_token=identity-secret') as Error & {
      cause?: unknown
    }
    error.cause = new Error('Bearer nested-cause-secret')
    const artifact = { authorization: 'Bearer abc', nested: { apiKey: 'provider-secret', error } }
    const result = redactSensitiveData(artifact) as typeof artifact

    expect(result.authorization).toBe('[REDACTED]')
    expect(result.nested.apiKey).toBe('[REDACTED]')
    expect(result.nested.error.message).not.toContain('identity-secret')
    expect(String(result.nested.error.cause)).not.toContain('nested-cause-secret')
    expect(artifact.nested.apiKey).toBe('provider-secret')
  })
})
