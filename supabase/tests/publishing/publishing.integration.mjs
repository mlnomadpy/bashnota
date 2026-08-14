import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const make = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
const password = `Publish-${suffix}!`
const owner = make()
const ownerSignup = await owner.auth.signUp({ email: `publisher-${suffix}@example.test`, password })
assert.ifError(ownerSignup.error)
assert.ok(ownerSignup.data.session, 'owner browser session must be authenticated')

const notaId = `browser-${suffix}`
const published = await owner.rpc('publish_nota', {
  p_id: notaId, p_title: 'Browser publication', p_content: { type: 'doc' },
  p_author_name: 'Browser Publisher', p_is_sub_page: false, p_parent_id: null,
  p_citations: [{ id: 'ordered-b' }, { id: 'ordered-a' }], p_tags: ['browser'], p_child_ids: [],
})
assert.ifError(published.error)
assert.equal(published.data?.[0]?.id, notaId)

const anonymous = make()
const publicRead = await anonymous.rpc('query_publications', { p_id: notaId, p_limit: 1 })
assert.ifError(publicRead.error)
assert.equal(publicRead.data?.[0]?.title, 'Browser publication')
assert.deepEqual(publicRead.data?.[0]?.published_nota_citations.map(value => value.id), ['ordered-b', 'ordered-a'])

const attacker = make()
const attackerSignup = await attacker.auth.signUp({ email: `attacker-${suffix}@example.test`, password })
assert.ifError(attackerSignup.error)
const hijack = await attacker.rpc('publish_nota', {
  p_id: notaId, p_title: 'Hijacked', p_content: {}, p_author_name: 'Attacker',
  p_is_sub_page: false, p_parent_id: null, p_citations: [], p_tags: [], p_child_ids: [],
})
assert.equal(hijack.error?.code, '42501', 'another browser identity cannot overwrite the owner')
const forged = await attacker.from('published_notas').update({ view_count: 999 }).eq('id', notaId)
assert.ok(forged.error, 'browser roles cannot forge statistic deltas')

const longReferrer = `${'a'.repeat(80)}.deep.analytics.example.com`
for (const client of [anonymous, anonymous, owner]) {
  const viewed = await client.rpc('record_nota_view', { p_nota_id: notaId, p_referrer_key: longReferrer })
  assert.ifError(viewed.error)
}
const afterViews = await anonymous.rpc('query_publications', { p_id: notaId, p_limit: 1 })
assert.ifError(afterViews.error)
assert.equal(afterViews.data?.[0]?.view_count, 3, 'each explicit view increments exactly once')
assert.equal(afterViews.data?.[0]?.unique_viewers, 1, 'repeat anonymous views create no forged unique markers')

const deniedDelete = await attacker.rpc('unpublish_nota', { p_id: notaId })
assert.equal(deniedDelete.error?.code, 'P0002')
assert.ifError((await owner.rpc('unpublish_nota', { p_id: notaId })).error)
const afterDelete = await anonymous.rpc('query_publications', { p_id: notaId, p_limit: 1 })
assert.ifError(afterDelete.error)
assert.equal(afterDelete.data?.length, 0, 'unpublish immediately removes the public read')

console.log('Local browser-key publication integration passed (no service-role credential used).')
