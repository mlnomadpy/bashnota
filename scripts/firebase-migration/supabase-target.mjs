import { randomBytes, randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { canonicalCount, canonicalTimestamp, sha256, stableJson, stableValue } from './canonical.mjs'

const throwError = result => { if (result.error) throw result.error; return result.data }
const without = (object, ...keys) => Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)))
const COUNT_FIELDS = new Set(['view_count', 'unique_viewers', 'like_count', 'dislike_count', 'clone_count', 'comment_count', 'reply_count'])
const comparable = (value, key) => {
  if (value == null) return value
  if (COUNT_FIELDS.has(key)) return canonicalCount(value, key)
  if (key.endsWith('_at')) return canonicalTimestamp(value, key).utc
  return stableValue(value)
}
const matches = (expected, actual) => Object.entries(expected).every(([key, value]) => stableJson(comparable(value, key)) === stableJson(comparable(actual?.[key], key)))

export function createMigrationClient(url, serviceRoleKey) {
  if (!url || !serviceRoleKey || serviceRoleKey.startsWith('sb_publishable_')) throw new Error('Supabase migration requires a server-side service-role credential')
  if (typeof window !== 'undefined') throw new Error('Supabase migration target cannot run in a browser')
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}

export async function provisionSupabaseIdentities(client, requirements, { preprovisioned = [] } = {}) {
  const supplied = new Map(preprovisioned.map(item => [item.firebaseUid, item]))
  const result = []
  for (const requirement of requirements) {
    if (!requirement.emailVerified || requirement.disabled) throw new Error('all migration identities must be enabled with verified email')
    const existingMap = throwError(await client.from('identity_map').select('firebase_uid,supabase_user_id,provider_links').eq('firebase_uid', requirement.firebaseUid).maybeSingle())
    if (existingMap) {
      const providerUid = existingMap.provider_links[requirement.provider]?.uid
      if (!providerUid) throw new Error('existing identity map does not match the source provider')
      const plan = throwError(await client.from('firebase_identity_provisioning').select('*').eq('firebase_uid', requirement.firebaseUid).maybeSingle())
      if (!plan) throwError(await client.from('firebase_identity_provisioning').insert({ firebase_uid: requirement.firebaseUid, supabase_user_id: existingMap.supabase_user_id, provider: requirement.provider, provider_uid: providerUid, verified_email_hash: sha256(requirement.email), state: 'linked' }))
      else if (plan.supabase_user_id !== existingMap.supabase_user_id || plan.provider_uid !== providerUid || plan.verified_email_hash !== sha256(requirement.email)) throw new Error('identity provisioning plan conflicts with the immutable identity map')
      else if (plan.state !== 'linked') throwError(await client.from('firebase_identity_provisioning').update({ state: 'linked' }).eq('firebase_uid', requirement.firebaseUid))
      result.push({ firebaseUid: requirement.firebaseUid, supabaseUserId: existingMap.supabase_user_id, provider: requirement.provider, providerUid, email: requirement.email })
      continue
    }
    let account = supplied.get(requirement.firebaseUid)
    const planned = throwError(await client.from('firebase_identity_provisioning').select('*').eq('firebase_uid', requirement.firebaseUid).maybeSingle())
    if (planned && (planned.provider !== requirement.provider || planned.verified_email_hash !== sha256(requirement.email)
      || account && (planned.supabase_user_id !== account.supabaseUserId || planned.provider_uid !== account.providerUid))) {
      throw new Error('immutable identity provisioning plan conflicts with the source or external provider mapping')
    }
    if (!planned) {
      if (!account && requirement.provider !== 'email') throw new Error('Google identities must be preprovisioned and reconciled through the external provider harness')
      account ??= { supabaseUserId: randomUUID(), providerUid: null }
      if (requirement.provider === 'email') account.providerUid = account.supabaseUserId
      throwError(await client.from('firebase_identity_provisioning').insert({ firebase_uid: requirement.firebaseUid, supabase_user_id: account.supabaseUserId, provider: requirement.provider, provider_uid: account.providerUid, verified_email_hash: sha256(requirement.email), state: 'planned' }))
    } else account = { supabaseUserId: planned.supabase_user_id, providerUid: planned.provider_uid }
    let fetched = await client.auth.admin.getUserById(account.supabaseUserId)
    if (fetched.error) {
      if (requirement.provider !== 'email') throw fetched.error
      if (fetched.error.status !== 404 && fetched.error.code !== 'user_not_found') throw fetched.error
      fetched = await client.auth.admin.createUser({ id: account.supabaseUserId, email: requirement.email, email_confirm: true, password: `${randomBytes(24).toString('base64url')}Aa1!`, user_metadata: { display_name: requirement.displayName ?? '' } })
    }
    const canonicalAccount = throwError(fetched).user
    const identity = canonicalAccount.identities?.find(item => item.provider === requirement.provider)
    if (!canonicalAccount.email_confirmed_at || !identity || (identity.identity_data?.sub ?? canonicalAccount.id) !== account.providerUid) throw new Error('provisioned Supabase account does not match the verified provider identity')
    throwError(await client.from('firebase_identity_provisioning').update({ state: 'provisioned' }).eq('firebase_uid', requirement.firebaseUid))
    result.push({ firebaseUid: requirement.firebaseUid, supabaseUserId: account.supabaseUserId, provider: requirement.provider, providerUid: account.providerUid, email: requirement.email })
  }
  return result
}

function targetKey(record) {
  const payload = record.payload
  if (record.kind === 'identity') return { firebaseUid: payload.firebase_uid, userId: payload.supabase_user_id }
  if (record.kind === 'publication' || record.kind === 'comment') return { id: payload.id, expectedCounts: payload.expected_counts }
  if (record.kind === 'publication_edge') return { parentId: payload.parent_id, childId: payload.child_id }
  if (record.kind === 'nota_vote') return { notaId: payload.nota_id, userId: payload.user_id }
  if (record.kind === 'nota_viewer') return { notaId: payload.nota_id, userId: payload.user_id }
  if (record.kind === 'metric_bucket') return { notaId: payload.nota_id, bucketKind: payload.bucket_kind, bucketKey: payload.bucket_key }
  if (record.kind === 'comment_vote') return { commentId: payload.comment_id, userId: payload.user_id }
  if (payload.id) return { id: payload.id }
  if (payload.user_id && record.kind === 'newsletter') return { userId: payload.user_id }
  return { keyHash: record.keyHash }
}

export class SupabaseTarget {
  constructor(client) { this.client = client }
  async startRun({ runId, manifest, dryRun }) {
    const existing = throwError(await this.client.from('firebase_migration_runs').select('manifest_hash').eq('id', runId).maybeSingle())
    if (existing && existing.manifest_hash !== manifest.manifestHash) throw Object.assign(new Error('run manifest conflict'), { code: '23505' })
    if (!existing) throwError(await this.client.from('firebase_migration_runs').insert({ id: runId, source_watermark: manifest.watermark, manifest_hash: manifest.manifestHash, tool_version: 'migration007-v1', dry_run: dryRun, state: 'running' }))
    else throwError(await this.client.from('firebase_migration_runs').update({ state: 'running' }).eq('id', runId))
  }
  async reserve({ runId, sequence, record }) {
    return throwError(await this.client.rpc('reserve_firebase_migration_record', { p_run_id: runId, p_sequence: sequence, p_entity_kind: record.kind, p_source_key_hash: record.keyHash, p_source_hash: record.sourceHash, p_target_key: targetKey(record) }))
  }
  async apply(record) {
    const p = record.payload
    if (record.kind === 'identity') {
      const existing = throwError(await this.client.from('identity_map').select('supabase_user_id,source_hash').eq('firebase_uid', p.firebase_uid).maybeSingle())
      if (!existing) throwError(await this.client.rpc('migrate_firebase_identity', {
        p_firebase_uid: p.firebase_uid, p_supabase_user_id: p.supabase_user_id, p_provider: p.provider,
        p_provider_uid: p.provider_uid, p_verified_email: p.verified_email, p_user_tag: p.user_tag,
        p_display_name: p.display_name, p_photo_url: p.photo_url, p_source_hash: record.sourceHash,
      }))
      else if (existing.supabase_user_id !== p.supabase_user_id || existing.source_hash !== record.sourceHash) throw Object.assign(new Error('identity target conflict'), { code: '23505' })
      throwError(await this.client.from('private_profiles').update({ created_at: p.created_at, updated_at: p.updated_at, source_created_at_raw: p.source_created_at_raw, source_updated_at_raw: p.source_updated_at_raw }).eq('user_id', p.supabase_user_id))
      throwError(await this.client.from('profiles').update({ updated_at: p.profile_updated_at }).eq('user_id', p.supabase_user_id))
      throwError(await this.client.from('user_tags').update({ created_at: p.tag_created_at }).eq('user_id', p.supabase_user_id))
      throwError(await this.client.from('firebase_identity_provisioning').update({ state: 'linked' }).eq('firebase_uid', p.firebase_uid).eq('supabase_user_id', p.supabase_user_id))
      return
    }
    const mappings = {
      legacy_nota: ['legacy_firebase_notas', { ...p, source_hash: record.sourceHash }, 'id'],
      publication: ['published_notas', { ...without(p, 'expected_counts'), like_count: '0', dislike_count: '0', comment_count: '0' }, 'id'],
      publication_edge: ['published_nota_edges', p, 'parent_id,child_id'],
      nota_vote: ['nota_votes', p, 'nota_id,user_id'],
      nota_viewer: ['nota_viewers', p, 'nota_id,user_id'],
      metric_bucket: ['nota_view_aggregates', p, 'nota_id,bucket_kind,bucket_key'],
      comment: ['comments', { ...without(p, 'expected_counts'), like_count: '0', dislike_count: '0', reply_count: '0' }, 'id'],
      comment_vote: ['comment_votes', p, 'comment_id,user_id'],
      newsletter: ['newsletter_subscriptions', p, 'user_id'],
    }
    const mapping = mappings[record.kind]
    if (!mapping) throw new Error(`unsupported migration record kind ${record.kind}`)
    throwError(await this.client.from(mapping[0]).upsert(mapping[1], { onConflict: mapping[2], ignoreDuplicates: true }))
  }
  async complete(record) { throwError(await this.client.rpc('complete_firebase_migration_record', { p_entity_kind: record.kind, p_source_key_hash: record.keyHash })) }
  async fail(record, errorClass) { throwError(await this.client.rpc('fail_firebase_migration_record', { p_entity_kind: record.kind, p_source_key_hash: record.keyHash, p_error_class: errorClass })) }
  async appendAudit(runId, event) { return throwError(await this.client.rpc('append_firebase_migration_audit', { p_run_id: runId, p_event: event })) }
  async reconcile(manifest) {
    const database = throwError(await this.client.rpc('reconcile_firebase_migration'))
    const expected = Object.fromEntries([...new Set(manifest.records.map(item => item.kind))].map(kind => {
      const records = manifest.records.filter(item => item.kind === kind).sort((a, b) => a.keyHash.localeCompare(b.keyHash))
      return [kind, { count: records.length, hash: sha256(records.map(item => item.sourceHash).join('')) }]
    }))
    const entityPass = Object.entries(expected).every(([kind, value]) => Number(database.entities[kind]?.count) === value.count && database.entities[kind]?.hash === value.hash)
    const storagePass = manifest.storageManifest.every(item => /^[0-9a-f]{64}$/.test(item.contentHash) && /^[0-9a-f]{64}$/.test(item.pathHash))
    let targetMismatches = 0
    const readOne = async (table, filters) => {
      let query = this.client.from(table).select('*')
      for (const [key, value] of Object.entries(filters)) query = query.eq(key, value)
      const result = await query.maybeSingle()
      if (result.error) throw result.error
      return result.data
    }
    for (const record of manifest.records) {
      const p = record.payload
      let actual, expectedRow
      if (record.kind === 'identity') {
        const mapping = await readOne('identity_map', { firebase_uid: p.firebase_uid })
        const privateProfile = await readOne('private_profiles', { user_id: p.supabase_user_id })
        const profile = await readOne('profiles', { user_id: p.supabase_user_id })
        const provisioning = await readOne('firebase_identity_provisioning', { firebase_uid: p.firebase_uid })
        const identityOkay = matches({ firebase_uid: p.firebase_uid, supabase_user_id: p.supabase_user_id, source_hash: record.sourceHash, provider_links: { [p.provider]: { uid: p.provider_uid, verified_email: p.verified_email } } }, mapping)
          && matches({ user_id: p.supabase_user_id, firebase_uid: p.firebase_uid, email: p.verified_email, display_name: p.display_name || null, created_at: p.created_at, updated_at: p.updated_at, source_created_at_raw: p.source_created_at_raw, source_updated_at_raw: p.source_updated_at_raw }, privateProfile)
          && matches({ user_id: p.supabase_user_id, user_tag: p.user_tag, photo_url: p.photo_url, updated_at: p.profile_updated_at }, profile)
          && matches({ user_tag: p.user_tag, user_id: p.supabase_user_id, created_at: p.tag_created_at }, await readOne('user_tags', { user_id: p.supabase_user_id }))
          && matches({ supabase_user_id: p.supabase_user_id, provider: p.provider, provider_uid: p.provider_uid, verified_email_hash: sha256(p.verified_email), state: 'linked' }, provisioning)
        if (!identityOkay) targetMismatches += 1
        continue
      }
      if (record.kind === 'legacy_nota') { actual = await readOne('legacy_firebase_notas', { id: p.id }); expectedRow = { ...p, source_hash: record.sourceHash } }
      if (record.kind === 'publication') { actual = await readOne('published_notas', { id: p.id }); expectedRow = without(p, 'expected_counts') }
      if (record.kind === 'publication_edge') { actual = await readOne('published_nota_edges', { parent_id: p.parent_id, child_id: p.child_id }); expectedRow = p }
      if (record.kind === 'nota_vote') { actual = await readOne('nota_votes', { nota_id: p.nota_id, user_id: p.user_id }); expectedRow = p }
      if (record.kind === 'nota_viewer') { actual = await readOne('nota_viewers', { nota_id: p.nota_id, user_id: p.user_id }); expectedRow = p }
      if (record.kind === 'metric_bucket') { actual = await readOne('nota_view_aggregates', { nota_id: p.nota_id, bucket_kind: p.bucket_kind, bucket_key: p.bucket_key }); expectedRow = p }
      if (record.kind === 'comment') { actual = await readOne('comments', { id: p.id }); expectedRow = without(p, 'expected_counts') }
      if (record.kind === 'comment_vote') { actual = await readOne('comment_votes', { comment_id: p.comment_id, user_id: p.user_id }); expectedRow = p }
      if (record.kind === 'newsletter') { actual = await readOne('newsletter_subscriptions', { user_id: p.user_id }); expectedRow = p }
      if (!actual || !expectedRow || !matches(expectedRow, actual)) targetMismatches += 1
    }
    return { status: entityPass && targetMismatches === 0 && storagePass && database.publicationCounterMismatches === 0 && database.commentCounterMismatches === 0 && database.orphanCount === 0 && database.publicUrlMismatches === 0 && database.missingTargetRows === 0 && database.unexplainedTargetRows === 0 && database.cutoverDisabled === true ? 'pass' : 'fail', entities: database.entities, targetMismatches, targetVerifiedHash: targetMismatches === 0 ? manifest.manifestHash : null, database, storage: { count: manifest.storageManifest.length, hash: sha256(stableJson(stableValue(manifest.storageManifest))), status: storagePass ? 'manifest-only-pass' : 'fail' } }
  }
  async finishRun({ runId, status, counters }) { throwError(await this.client.from('firebase_migration_runs').update({ state: status, counters, completed_at: new Date().toISOString() }).eq('id', runId)) }
  async rollback(runId) {
    const rows = throwError(await this.client.from('firebase_migration_journal').select('entity_kind,target_key').eq('first_run_id', runId).in('state', ['applying', 'applied', 'failed']))
    const keys = kind => rows.filter(row => row.entity_kind === kind).map(row => row.target_key)
    for (const key of keys('comment_vote')) throwError(await this.client.from('comment_votes').delete().eq('comment_id', key.commentId).eq('user_id', key.userId))
    const commentIds = keys('comment').map(key => key.id); if (commentIds.length) throwError(await this.client.from('comments').delete().in('id', commentIds))
    for (const key of keys('nota_vote')) throwError(await this.client.from('nota_votes').delete().eq('nota_id', key.notaId).eq('user_id', key.userId))
    for (const key of keys('nota_viewer')) throwError(await this.client.from('nota_viewers').delete().eq('nota_id', key.notaId).eq('user_id', key.userId))
    for (const key of keys('metric_bucket')) throwError(await this.client.from('nota_view_aggregates').delete().eq('nota_id', key.notaId).eq('bucket_kind', key.bucketKind).eq('bucket_key', key.bucketKey))
    for (const key of keys('publication_edge')) throwError(await this.client.from('published_nota_edges').delete().eq('parent_id', key.parentId).eq('child_id', key.childId))
    const publicationIds = keys('publication').map(key => key.id); if (publicationIds.length) throwError(await this.client.from('published_notas').delete().in('id', publicationIds))
    const newsletterIds = keys('newsletter').map(key => key.userId); if (newsletterIds.length) throwError(await this.client.from('newsletter_subscriptions').delete().in('user_id', newsletterIds))
    const legacyIds = keys('legacy_nota').map(key => key.id); if (legacyIds.length) throwError(await this.client.from('legacy_firebase_notas').delete().in('id', legacyIds))
    // Auth identities stay reconciled but inert while the app remains on the
    // Firebase rollout. Deleting accounts would invalidate stable translations
    // and make a byte-identical resume impossible.
    throwError(await this.client.rpc('mark_firebase_migration_rolled_back', { p_run_id: runId }))
  }
}
