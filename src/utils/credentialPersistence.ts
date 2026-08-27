export function withoutApiKeys<T extends { apiKeys?: Record<string, string> }>(
  settings: T,
): Omit<T, 'apiKeys'> {
  const { apiKeys: _memoryOnly, ...persistable } = settings
  return persistable
}

export function withoutJupyterToken<T extends { jupyterToken?: string }>(
  settings: T,
): Omit<T, 'jupyterToken'> {
  const { jupyterToken: _memoryOnly, ...persistable } = settings
  return persistable
}

const CREDENTIAL_KEY =
  /^(?:authorization|.*api[-_]?keys?|.*(?:access|refresh|id|jupyter|firebase)[-_]?token|token|secret|credential)$/i

/**
 * Produces a detached value that is safe to cross a durable/export boundary.
 * Exact key matching intentionally preserves non-secret settings such as
 * `maxTokens`, while covering legacy provider and nested Jupyter shapes.
 */
export function credentialFreeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => credentialFreeValue(item)) as T
  }

  if (value && typeof value === 'object') {
    const persistable: Record<string, unknown> = {}
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (!CREDENTIAL_KEY.test(key)) {
        persistable[key] = credentialFreeValue(nestedValue)
      }
    }
    return persistable as T
  }

  return value
}

export function credentialFreeSettings<
  T extends {
    ai: { apiKeys?: Record<string, string> }
    integrations: { jupyterToken?: string }
  },
>(settings: T): T {
  return {
    ...settings,
    ai: { ...withoutApiKeys(settings.ai), apiKeys: {} },
    integrations: { ...withoutJupyterToken(settings.integrations), jupyterToken: '' },
  }
}
