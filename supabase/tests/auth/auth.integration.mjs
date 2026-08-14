import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
// This is the checked-in local development publishable key from `supabase start`.
// It is deliberately not an admin/service credential and cannot bypass RLS.
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY
  ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

const storageValues = new Map()
const storage = {
  getItem: key => storageValues.get(key) ?? null,
  setItem: (key, value) => storageValues.set(key, value),
  removeItem: key => storageValues.delete(key),
}

const clientOptions = {
  auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false, storage },
}
const first = createClient(url, publishableKey, clientOptions)
const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
const email = `auth-${suffix}@example.test`
const initialPassword = `Start-${suffix}!`
const nextPassword = `Next-${suffix}!`
const userTag = `auth_${suffix}`

const signup = await first.auth.signUp({
  email,
  password: initialPassword,
  options: { data: { display_name: 'Local Auth Integration' } },
})
assert.ifError(signup.error)
assert.ok(signup.data.session, 'local email signup must establish a session')
assert.ok(signup.data.user)

const provision = await first.rpc('provision_user_profile', {
  p_user_tag: userTag,
  p_display_name: 'Local Auth Integration',
  p_photo_url: 'https://example.test/avatar.png',
})
assert.ifError(provision.error)
assert.equal(provision.data.user_tag, userTag)

const anonymous = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})
const publicLookup = await anonymous.from('public_profiles')
  .select('user_id,user_tag,photo_url,updated_at').eq('user_tag', userTag).single()
assert.ifError(publicLookup.error)
assert.equal(publicLookup.data.user_id, signup.data.user.id)
assert.deepEqual(Object.keys(publicLookup.data).sort(), ['photo_url', 'updated_at', 'user_id', 'user_tag'])

// A second client sharing the SDK storage restores the user session without
// any application-managed token copy.
const restored = createClient(url, publishableKey, clientOptions)
const restoredSession = await restored.auth.getSession()
assert.ifError(restoredSession.error)
assert.equal(restoredSession.data.session?.user.id, signup.data.user.id)

const reset = await restored.auth.resetPasswordForEmail(email, {
  redirectTo: 'http://127.0.0.1:5173/auth/reset-password',
})
assert.ifError(reset.error)

const update = await restored.auth.updateUser({ password: nextPassword })
assert.ifError(update.error)
assert.ifError((await restored.auth.signOut()).error)
assert.equal((await restored.auth.getSession()).data.session, null)

const oldPassword = await restored.auth.signInWithPassword({ email, password: initialPassword })
assert.ok(oldPassword.error, 'the previous password must stop authenticating')
const login = await restored.auth.signInWithPassword({ email, password: nextPassword })
assert.ifError(login.error)
assert.equal(login.data.user.id, signup.data.user.id)

console.log('Local Supabase browser-auth integration passed.')
