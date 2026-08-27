import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_BYTES, validateRaster } from '../../../../supabase/functions/_shared/imageValidation'

const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='), c => c.charCodeAt(0))

function crc32(bytes: Uint8Array, start: number, end: number) {
  let crc = 0xffffffff
  for (let index = start; index < end; index++) {
    crc ^= bytes[index]
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

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

  it('rejects corrupt encoded data and header-only raster lookalikes', () => {
    const corruptPng = png.slice()
    corruptPng[45] ^= 0xff
    expect(() => validateRaster(corruptPng, 'image/png')).toThrow(/checksum/)

    const headerOnlyGif = Uint8Array.from([
      ...new TextEncoder().encode('GIF89a'), 1, 0, 1, 0, 0, 0, 0, 0x3b,
    ])
    expect(() => validateRaster(headerOnlyGif, 'image/gif')).toThrow(/no frame/)
  })

  it('rejects decompression-bomb dimensions before storage', () => {
    const huge = png.slice()
    huge[16] = 0; huge[17] = 0; huge[18] = 0x20; huge[19] = 1
    huge[20] = 0; huge[21] = 0; huge[22] = 0x20; huge[23] = 1
    new DataView(huge.buffer).setUint32(29, crc32(huge, 12, 29))
    expect(() => validateRaster(huge, 'image/png')).toThrow(/dimensions exceed/)
  })
})
