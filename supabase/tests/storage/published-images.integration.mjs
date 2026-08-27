import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const browser = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
const password = `Image-${suffix}!`
const owner = browser()
const ownerSignup = await owner.auth.signUp({ email: `image-owner-${suffix}@example.test`, password })
assert.ifError(ownerSignup.error)
assert.ok(ownerSignup.data.user)
const ownerId = ownerSignup.data.user.id
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

// A publishable-key caller cannot bypass the validating function by forging
// Storage object metadata, even with correctly shaped raster bytes.
const direct = await owner.storage.from('published-images').upload(
  `${ownerId}/direct-${suffix}.png`, Buffer.from(pngBase64, 'base64'), { contentType: 'image/png' },
)
assert.ok(direct.error)

const uploaded = await owner.functions.invoke('published-images', {
  body: { action: 'upload', contentType: 'image/png', base64: pngBase64 },
})
if (uploaded.error) {
  const detail = await uploaded.error.context?.json().catch(() => null)
  assert.fail(`validated upload failed: ${JSON.stringify(detail)}`)
}
assert.match(uploaded.data.path, new RegExp(`^${ownerId}/[0-9a-f-]+\\.png$`))
assert.ifError((await owner.storage.from('published-images').download(uploaded.data.path)).error)

for (const body of [
  { action: 'upload', contentType: 'image/jpeg', base64: pngBase64 },
  { action: 'upload', contentType: 'image/png', base64: Buffer.from('<svg><script>').toString('base64') },
  { action: 'upload', contentType: 'image/png', base64: `${pngBase64.slice(0, -1)}A` },
]) {
  const rejected = await owner.functions.invoke('published-images', { body })
  assert.ok(rejected.error || rejected.data?.error)
}

const attacker = browser()
assert.ifError((await attacker.auth.signUp({ email: `image-attacker-${suffix}@example.test`, password })).error)
const crossDelete = await attacker.functions.invoke('published-images', {
  body: { action: 'delete', paths: [uploaded.data.path] },
})
assert.ok(crossDelete.error || crossDelete.data?.error)
assert.ifError((await owner.storage.from('published-images').download(uploaded.data.path)).error)

assert.ifError((await owner.functions.invoke('published-images', {
  body: { action: 'delete', paths: [uploaded.data.path] },
})).error)
assert.ok((await owner.storage.from('published-images').download(uploaded.data.path)).error)

console.log('Publishable-key image validation, ownership, and deletion integration passed without service-role credentials.')
