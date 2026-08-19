import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { PUBLISHED_IMAGE_BUCKET, uploadPublishedImage } from '../supabaseImageStorage'

function client(options: { user?: { id: string } | null; authError?: Error | null } = {}) {
  const upload = vi.fn().mockResolvedValue({ data: { path: 'user-id/object.png' }, error: null })
  const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://project.test/storage/v1/object/public/published-images/user-id/object.png' } })
  const from = vi.fn().mockReturnValue({ upload, getPublicUrl })
  return {
    client: {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: options.user === undefined ? { id: 'user-id' } : options.user }, error: options.authError ?? null }) },
      storage: { from },
    } as unknown as SupabaseClient,
    upload,
    getPublicUrl,
    from,
  }
}

describe('published image storage', () => {
  it('uploads allowlisted data URLs to the authenticated user folder', async () => {
    const doubles = client()
    const url = await uploadPublishedImage('data:image/png;base64,aGVsbG8=', doubles.client)

    expect(doubles.from).toHaveBeenCalledWith(PUBLISHED_IMAGE_BUCKET)
    expect(doubles.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^user-id\/[0-9a-f-]+\.png$/),
      expect.any(Uint8Array),
      { contentType: 'image/png', cacheControl: '31536000', upsert: false },
    )
    expect(url).toContain('/published-images/user-id/object.png')
  })

  it('rejects unapproved image types before uploading', async () => {
    const doubles = client()
    await expect(uploadPublishedImage('data:image/svg+xml;base64,PHN2Zy8+', doubles.client))
      .rejects.toMatchObject({ code: 'invalid' })
    expect(doubles.upload).not.toHaveBeenCalled()
  })

  it('requires an authenticated Supabase user', async () => {
    const doubles = client({ user: null })
    await expect(uploadPublishedImage('data:image/png;base64,aGVsbG8=', doubles.client))
      .rejects.toMatchObject({ code: 'unauthenticated' })
    expect(doubles.upload).not.toHaveBeenCalled()
  })
})
