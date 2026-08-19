import type { SupabaseClient } from '@supabase/supabase-js'
import { CloudError } from './types'
import { getSupabaseBrowserClient } from './supabaseBrowser'

export const PUBLISHED_IMAGE_BUCKET = 'published-images'
const DATA_URL = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]+={0,2})$/
const EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  const match = DATA_URL.exec(dataUrl)
  if (!match) throw new CloudError('invalid', 'Only base64 PNG, JPEG, GIF, or WebP images can be published.')
  const binary = atob(match[2])
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
  if (bytes.byteLength > 5 * 1024 * 1024) throw new CloudError('invalid', 'Published images must be 5 MB or smaller.')
  return { bytes, contentType: match[1] }
}

export async function uploadPublishedImage(
  dataUrl: string,
  client?: SupabaseClient,
): Promise<string> {
  const supabase = client ?? await getSupabaseBrowserClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new CloudError('unauthenticated', 'Sign in before publishing images.', userError)

  const { bytes, contentType } = decodeDataUrl(dataUrl)
  const objectPath = `${userData.user.id}/${crypto.randomUUID()}.${EXTENSION[contentType]}`
  const uploaded = await supabase.storage.from(PUBLISHED_IMAGE_BUCKET).upload(objectPath, bytes, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  })
  if (uploaded.error) throw new CloudError('unavailable', 'The image could not be uploaded.', uploaded.error)
  return supabase.storage.from(PUBLISHED_IMAGE_BUCKET).getPublicUrl(uploaded.data.path).data.publicUrl
}
