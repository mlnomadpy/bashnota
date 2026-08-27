import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_BYTES, validateRaster } from '../../../../supabase/functions/_shared/imageValidation'

const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='), c => c.charCodeAt(0))

describe('authoritative published raster validation', () => {
  it('parses a complete allowlisted raster and obtains dimensions from bytes', () => {
    expect(validateRaster(png, 'image/png')).toEqual({ mime: 'image/png', extension: 'png', width: 1, height: 1 })
  })

  it('rejects forged MIME, malformed bytes, trailing polyglot content, and size limits', () => {
    expect(() => validateRaster(png, 'image/jpeg')).toThrow(/does not match/)
    expect(() => validateRaster(new TextEncoder().encode('<svg><script>'), 'image/png')).toThrow(/not an allowed raster/)
    expect(() => validateRaster(Uint8Array.from([...png, ...new TextEncoder().encode('<script>')]), 'image/png')).toThrow(/trailing bytes/)
    expect(() => validateRaster(new Uint8Array(MAX_IMAGE_BYTES + 1), 'image/png')).toThrow(/size/)
  })

  it('rejects decompression-bomb dimensions before storage', () => {
    const huge = png.slice()
    huge[16] = 0; huge[17] = 0; huge[18] = 0x20; huge[19] = 1
    huge[20] = 0; huge[21] = 0; huge[22] = 0x20; huge[23] = 1
    expect(() => validateRaster(huge, 'image/png')).toThrow(/dimensions exceed/)
  })
})
