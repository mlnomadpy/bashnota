import { describe, expect, it } from 'vitest'
import { parseSafeExportImageDataUrl } from '../exportImageAsset'

const dataUrl = (mime: string, base64: string) => `data:${mime};base64,${base64}`

describe('export archive image validation', () => {
  it.each([
    ['image/png', 'iVBORw0KGgo=', 'png'],
    ['image/jpeg', '/9j/', 'jpg'],
    ['image/gif', 'R0lGODlh', 'gif'],
    ['image/webp', 'UklGRgAAAABXRUJQ', 'webp'],
  ])('accepts matching %s bytes and derives its extension from MIME', (mime, base64, extension) => {
    expect(parseSafeExportImageDataUrl(dataUrl(mime, base64))).toMatchObject({ mimeType: mime, extension, base64 })
  })

  it.each([
    ['spoofed PNG containing HTML', dataUrl('image/png', btoa('<html><script>window.pwned=1</script></html>'))],
    ['SVG payload', dataUrl('image/svg+xml', btoa('<svg onload="window.pwned=1"/>'))],
    ['HTML payload', dataUrl('text/html', btoa('<img src=x onerror="window.pwned=1">'))],
    ['mismatched GIF declaration', dataUrl('image/gif', 'iVBORw0KGgo=')],
    ['malformed base64', 'data:image/png;base64,%%%'],
  ])('drops %s', (_name, value) => {
    expect(parseSafeExportImageDataUrl(value)).toBeNull()
  })
})
