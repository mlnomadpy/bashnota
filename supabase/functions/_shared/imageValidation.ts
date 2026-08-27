export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_IMAGE_DIMENSION = 8192
export const MAX_IMAGE_PIXELS = 40_000_000

export type RasterMime = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
export interface ValidatedRaster { mime: RasterMime; extension: 'png' | 'jpg' | 'gif' | 'webp'; width: number; height: number }

function invalid(message: string): never { throw new Error(`Invalid published image: ${message}`) }
function u16be(b: Uint8Array, o: number) { return (b[o] << 8) | b[o + 1] }
function u24le(b: Uint8Array, o: number) { return b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) }
function u32be(b: Uint8Array, o: number) { return ((b[o] * 0x1000000) + (b[o + 1] << 16) + (b[o + 2] << 8) + b[o + 3]) >>> 0 }
function u32le(b: Uint8Array, o: number) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] * 0x1000000)) >>> 0 }
function ascii(b: Uint8Array, o: number, n: number) { return String.fromCharCode(...b.subarray(o, o + n)) }

function crc32(bytes: Uint8Array, start: number, end: number) {
  let crc = 0xffffffff
  for (let index = start; index < end; index++) {
    crc ^= bytes[index]
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function dimensions(width: number, height: number) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) invalid('dimensions are missing')
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION || width * height > MAX_IMAGE_PIXELS) invalid('dimensions exceed the safe limit')
  return { width, height }
}

function png(bytes: Uint8Array) {
  if (bytes.length < 45 || ascii(bytes, 1, 3) !== 'PNG' || bytes[0] !== 0x89 || bytes[4] !== 13 || bytes[5] !== 10 || bytes[6] !== 26 || bytes[7] !== 10) invalid('malformed PNG signature')
  let offset = 8; let seenHeader = false; let seenData = false
  let size = { width: 0, height: 0 }
  while (offset + 12 <= bytes.length) {
    const length = u32be(bytes, offset); const type = ascii(bytes, offset + 4, 4); const end = offset + 12 + length
    if (end > bytes.length) invalid('truncated PNG chunk')
    if (crc32(bytes, offset + 4, offset + 8 + length) !== u32be(bytes, offset + 8 + length)) invalid('PNG chunk checksum failed')
    if (!seenHeader && type !== 'IHDR') invalid('PNG header is not first')
    if (type === 'IHDR') {
      if (seenHeader || length !== 13) invalid('invalid PNG header')
      size = dimensions(u32be(bytes, offset + 8), u32be(bytes, offset + 12)); seenHeader = true
    } else if (type === 'IDAT') seenData = true
    else if (type === 'IEND') {
      if (length !== 0 || !seenData || end !== bytes.length) invalid('PNG has missing data or trailing bytes')
      return size
    } else if ((type.charCodeAt(0) & 32) === 0 && type !== 'PLTE') invalid('unsupported critical PNG chunk')
    offset = end
  }
  invalid('PNG has no terminal chunk')
}

function jpeg(bytes: Uint8Array) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) invalid('malformed JPEG signature')
  let offset = 2; let size: { width: number; height: number } | undefined
  while (offset < bytes.length) {
    if (bytes[offset++] !== 0xff) invalid('malformed JPEG marker')
    while (bytes[offset] === 0xff) offset++
    const marker = bytes[offset++]
    if (marker === 0xd9) {
      if (offset !== bytes.length || !size) invalid('JPEG has missing dimensions or trailing bytes')
      return size
    }
    if (marker === 0xda) {
      const end = bytes.length - 2
      if (end < offset || bytes[end] !== 0xff || bytes[end + 1] !== 0xd9) invalid('JPEG scan is not terminal')
      if (!size) invalid('JPEG dimensions are missing')
      return size
    }
    if (offset + 2 > bytes.length) invalid('truncated JPEG segment')
    const length = u16be(bytes, offset)
    if (length < 2 || offset + length > bytes.length) invalid('invalid JPEG segment length')
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      if (length < 8) invalid('invalid JPEG frame')
      size = dimensions(u16be(bytes, offset + 3), u16be(bytes, offset + 5))
    }
    offset += length
  }
  invalid('JPEG has no terminal marker')
}

function gif(bytes: Uint8Array) {
  if (bytes.length < 14 || !['GIF87a', 'GIF89a'].includes(ascii(bytes, 0, 6))) invalid('malformed GIF signature')
  const size = dimensions(bytes[6] | (bytes[7] << 8), bytes[8] | (bytes[9] << 8))
  const packed = bytes[10]
  let offset = 13 + ((packed & 0x80) ? 3 * (1 << ((packed & 7) + 1)) : 0)
  let seenFrame = false
  const skipBlocks = () => {
    let payload = 0
    while (offset < bytes.length) {
      const length = bytes[offset++]
      if (length === 0) return payload
      if (offset + length > bytes.length) invalid('truncated GIF data block')
      payload += length; offset += length
    }
    invalid('unterminated GIF data block')
  }
  while (offset < bytes.length) {
    const marker = bytes[offset++]
    if (marker === 0x3b) {
      if (!seenFrame || offset !== bytes.length) invalid('GIF has no frame or has trailing bytes')
      return size
    }
    if (marker === 0x21) {
      if (offset >= bytes.length) invalid('truncated GIF extension')
      offset++
      skipBlocks()
      continue
    }
    if (marker !== 0x2c || offset + 9 > bytes.length) invalid('invalid GIF block marker')
    const frameWidth = bytes[offset + 4] | (bytes[offset + 5] << 8)
    const frameHeight = bytes[offset + 6] | (bytes[offset + 7] << 8)
    dimensions(frameWidth, frameHeight)
    const framePacked = bytes[offset + 8]
    offset += 9 + ((framePacked & 0x80) ? 3 * (1 << ((framePacked & 7) + 1)) : 0)
    if (offset >= bytes.length || bytes[offset] < 2 || bytes[offset] > 8) invalid('invalid GIF LZW code size')
    offset++
    if (skipBlocks() === 0) invalid('GIF frame has no raster data')
    seenFrame = true
  }
  invalid('GIF has no terminal trailer')
}

function webp(bytes: Uint8Array) {
  if (bytes.length < 30 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP' || u32le(bytes, 4) + 8 !== bytes.length) invalid('malformed WebP container')
  const chunk = ascii(bytes, 12, 4); const length = u32le(bytes, 16)
  if (20 + length + (length & 1) !== bytes.length) invalid('WebP has trailing or multiple payloads')
  if (chunk === 'VP8X' && length >= 10) return dimensions(1 + u24le(bytes, 24), 1 + u24le(bytes, 27))
  if (chunk === 'VP8L' && length >= 5 && bytes[20] === 0x2f) {
    const bits = u32le(bytes, 21); return dimensions((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1)
  }
  if (chunk === 'VP8 ' && length >= 10 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) return dimensions(u16be(Uint8Array.of(bytes[27], bytes[26]), 0) & 0x3fff, u16be(Uint8Array.of(bytes[29], bytes[28]), 0) & 0x3fff)
  invalid('unsupported WebP raster payload')
}

export function validateRaster(bytes: Uint8Array, declaredMime: string): ValidatedRaster {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) invalid('size must be between 1 byte and 5 MB')
  let detected: RasterMime; let extension: ValidatedRaster['extension']; let size
  if (bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG') { detected = 'image/png'; extension = 'png'; size = png(bytes) }
  else if (bytes[0] === 0xff && bytes[1] === 0xd8) { detected = 'image/jpeg'; extension = 'jpg'; size = jpeg(bytes) }
  else if (ascii(bytes, 0, 3) === 'GIF') { detected = 'image/gif'; extension = 'gif'; size = gif(bytes) }
  else if (ascii(bytes, 0, 4) === 'RIFF') { detected = 'image/webp'; extension = 'webp'; size = webp(bytes) }
  else invalid('bytes are not an allowed raster format')
  if (declaredMime !== detected) invalid(`declared MIME ${declaredMime} does not match ${detected}`)
  return { mime: detected, extension, ...size }
}
