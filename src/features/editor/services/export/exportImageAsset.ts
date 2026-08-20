const safeImageTypes = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
} as const

type SafeImageMimeType = keyof typeof safeImageTypes

export interface ExportImageAsset {
  base64: string
  extension: (typeof safeImageTypes)[SafeImageMimeType]
  mimeType: SafeImageMimeType
}

const dataImageUrl = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]+={0,2})$/i

function hasPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  return bytes.length >= prefix.length && prefix.every((value, index) => bytes[index] === value)
}

function isMatchingImageMagic(mimeType: SafeImageMimeType, bytes: Uint8Array): boolean {
  switch (mimeType) {
    case 'image/png':
      return hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    case 'image/jpeg':
      return hasPrefix(bytes, [0xff, 0xd8, 0xff])
    case 'image/gif':
      return hasPrefix(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61])
        || hasPrefix(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    case 'image/webp':
      return hasPrefix(bytes, [0x52, 0x49, 0x46, 0x46]) && hasPrefix(bytes.slice(8), [0x57, 0x45, 0x42, 0x50])
  }
}

function decodeBase64(value: string): Uint8Array | null {
  try {
    const decoded = atob(value)
    return Uint8Array.from(decoded, character => character.charCodeAt(0))
  } catch {
    return null
  }
}

/**
 * The archive only accepts a small set of raster formats. MIME declarations are
 * not trusted: the decoded bytes must carry the matching format signature.
 */
export function parseSafeExportImageDataUrl(value: string): ExportImageAsset | null {
  const match = dataImageUrl.exec(value)
  if (!match) return null

  const mimeType = match[1].toLowerCase() as SafeImageMimeType
  const base64 = match[2]
  const bytes = decodeBase64(base64)
  if (!bytes || !isMatchingImageMagic(mimeType, bytes)) return null

  return { base64, mimeType, extension: safeImageTypes[mimeType] }
}
