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
const path = `${ownerId}/image-${suffix}.png`
const png = new Uint8Array([137, 80, 78, 71])

const uploaded = await owner.storage.from('published-images').upload(path, png, { contentType: 'image/png' })
assert.ifError(uploaded.error)
assert.ifError((await owner.storage.from('published-images').download(path)).error)

const anonymous = browser()
assert.ok((await anonymous.storage.from('published-images').upload(`anonymous-${suffix}.png`, png, { contentType: 'image/png' })).error)

const attacker = browser()
assert.ifError((await attacker.auth.signUp({ email: `image-attacker-${suffix}@example.test`, password })).error)
assert.ok((await attacker.storage.from('published-images').upload(path, png, { contentType: 'image/png', upsert: true })).error)
const crossDelete = await attacker.storage.from('published-images').remove([path])
assert.ok(crossDelete.error || crossDelete.data?.length === 0)
assert.ifError((await owner.storage.from('published-images').download(path)).error)

assert.ok((await owner.storage.from('published-images').upload(
  `${ownerId}/oversized-${suffix}.png`,
  new Uint8Array(5 * 1024 * 1024 + 1),
  { contentType: 'image/png' },
)).error)
assert.ok((await owner.storage.from('published-images').upload(
  `${ownerId}/disallowed-${suffix}.svg`,
  new Uint8Array([60, 115, 118, 103]),
  { contentType: 'image/svg+xml' },
)).error)

assert.ifError((await owner.storage.from('published-images').remove([path])).error)
console.log('Local publishable-key Storage RLS integration passed without service-role credentials.')
