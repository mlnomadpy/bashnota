import assert from 'node:assert/strict'
import fs from 'node:fs'

export function compare(firebaseRows, supabaseRows) {
  const normalize = rows => new Map(rows.map(row => [row.id, {
    owner: row.owner, link: row.link,
    metrics: ['viewCount','uniqueViewers','likeCount','dislikeCount','cloneCount','commentCount']
      .map(key => Number(row[key] ?? 0)),
  }]))
  const firebase = normalize(firebaseRows)
  const supabase = normalize(supabaseRows)
  const ids = [...new Set([...firebase.keys(), ...supabase.keys()])].sort()
  const missingInSupabase = ids.filter(id => firebase.has(id) && !supabase.has(id))
  const missingInFirebase = ids.filter(id => supabase.has(id) && !firebase.has(id))
  const ownerMismatches = ids.filter(id => firebase.has(id) && supabase.has(id) && firebase.get(id).owner !== supabase.get(id).owner)
  const linkMismatches = ids.filter(id => firebase.has(id) && supabase.has(id) && firebase.get(id).link !== supabase.get(id).link)
  const metricMismatches = ids.filter(id => firebase.has(id) && supabase.has(id)
    && JSON.stringify(firebase.get(id).metrics) !== JSON.stringify(supabase.get(id).metrics))
  return { firebaseCount: firebase.size, supabaseCount: supabase.size,
    missingInSupabase, missingInFirebase, ownerMismatches, linkMismatches, metricMismatches,
    ready: firebase.size === supabase.size && [missingInSupabase,missingInFirebase,ownerMismatches,linkMismatches,metricMismatches].every(v => v.length === 0) }
}

if (process.argv.includes('--self-test')) {
  const same = [{ id:'a', owner:'u', link:'/@tag/a', viewCount:2 }]
  assert.equal(compare(same, structuredClone(same)).ready, true)
  assert.equal(compare(same, [{ ...same[0], viewCount:3 }]).ready, false)
  assert.equal(compare(same, [{ ...same[0], owner:'other' }]).ready, false)
  console.log('Publishing reconciliation report self-test passed.')
} else {
  const [firebasePath, supabasePath] = process.argv.slice(2)
  if (!firebasePath || !supabasePath) throw new Error('Usage: reconcile-publishing.mjs FIREBASE.json SUPABASE.json')
  console.log(JSON.stringify(compare(JSON.parse(fs.readFileSync(firebasePath)), JSON.parse(fs.readFileSync(supabasePath))), null, 2))
}
