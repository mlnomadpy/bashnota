import { afterEach, describe, expect, it } from 'vitest'
import { getSupabaseBrowserClient, resetSupabaseBrowserClientForTests } from '../supabaseBrowser'

afterEach(resetSupabaseBrowserClientForTests)

describe('Supabase browser foundation', () => {
  it('initializes from a URL and browser anon key without a server credential', async () => {
    const client = await getSupabaseBrowserClient({ url: 'http://127.0.0.1:54321', anonKey: 'local-anon-key' })
    expect((client as unknown as { supabaseUrl: string }).supabaseUrl).toBe('http://127.0.0.1:54321')
  })

  it('requires a browser key when no configured local key is available', async () => {
    await expect(getSupabaseBrowserClient({ url: 'http://127.0.0.1:54321' }))
      .rejects.toThrow('publishable/anon key')
  })
})
