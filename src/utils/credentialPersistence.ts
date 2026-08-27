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
