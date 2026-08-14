import assert from 'node:assert/strict'
import fs from 'node:fs'

const byKey=(rows,key)=>new Map(rows.map(row=>[key(row),row]))
const text=value=>value==null?null:String(value)
const count=value=>Number(value??0)
const normalizedEmail=value=>String(value??'').trim().toLowerCase()
const mappedUser=(value,supabase)=>text(supabase.identityMap?.[String(value)]??value)
const push=(values,value)=>{const key=String(value);if(!values.includes(key))values.push(key)}

function stableJson(value){
  if(Array.isArray(value))return value.map(stableJson)
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableJson(value[key])]))
  return value
}
function canonicalJson(value){
  let candidate=value
  if(typeof candidate==='string')try{candidate=JSON.parse(candidate)}catch{/* legacy plain text is canonical text */}
  return stableJson(candidate)
}
const sameJson=(left,right)=>JSON.stringify(canonicalJson(left))===JSON.stringify(canonicalJson(right))
const voteTarget=row=>text(row.commentId??row.notaId??row.targetId??row.id)
const voteKey=(row,supabase,left)=>`${row.commentId?'comment':'nota'}:${voteTarget(row)}:${left?mappedUser(row.userId,supabase):text(row.userId)}`
const subscriptionKey=(row,supabase,left)=>left?mappedUser(row.userId??row.id,supabase):text(row.userId??row.id)

export function compare(firebase,supabase){
  const mismatches={comments:[],relationships:[],votes:[],counts:[],subscriptions:[],timestamps:[],orphans:[]}
  const leftComments=byKey(firebase.comments??[],row=>String(row.id)),rightComments=byKey(supabase.comments??[],row=>String(row.id))
  for(const id of new Set([...leftComments.keys(),...rightComments.keys()])){
    const a=leftComments.get(id),b=rightComments.get(id)
    if(!a||!b){push(mismatches.comments,id);continue}
    if(!sameJson(a.content,b.content)
      || mappedUser(a.authorId,supabase)!==text(b.authorId)
      || text(a.authorName)!==text(b.authorName)
      || text(a.authorTag)!==text(b.authorTag))push(mismatches.comments,id)
    if(text(a.notaId)!==text(b.notaId)||text(a.parentId)!==text(b.parentId))push(mismatches.relationships,id)
    if(count(a.likeCount)!==count(b.likeCount)||count(a.dislikeCount)!==count(b.dislikeCount)
      ||count(a.replyCount)!==count(b.replyCount))push(mismatches.counts,`comment:${id}`)
    if(text(a.createdAt)!==text(b.createdAt)||text(a.updatedAt)!==text(b.updatedAt))push(mismatches.timestamps,`comment:${id}`)
  }

  const leftVotes=byKey(firebase.votes??[],row=>voteKey(row,supabase,true))
  const rightVotes=byKey(supabase.votes??[],row=>voteKey(row,supabase,false))
  for(const key of new Set([...leftVotes.keys(),...rightVotes.keys()])){
    const a=leftVotes.get(key),b=rightVotes.get(key)
    if(!a||!b){push(mismatches.votes,key);continue}
    if(voteTarget(a)!==voteTarget(b)||text(a.vote)!==text(b.vote)
      ||mappedUser(a.userId,supabase)!==text(b.userId))push(mismatches.votes,key)
    if(text(a.createdAt)!==text(b.createdAt)||text(a.updatedAt)!==text(b.updatedAt))push(mismatches.timestamps,`vote:${key}`)
  }

  const leftSubscriptions=byKey(firebase.subscriptions??[],row=>subscriptionKey(row,supabase,true))
  const rightSubscriptions=byKey(supabase.subscriptions??[],row=>subscriptionKey(row,supabase,false))
  for(const key of new Set([...leftSubscriptions.keys(),...rightSubscriptions.keys()])){
    const a=leftSubscriptions.get(key),b=rightSubscriptions.get(key)
    if(!a||!b){push(mismatches.subscriptions,key);continue}
    if(mappedUser(a.userId??a.id,supabase)!==text(b.userId??b.id)
      ||normalizedEmail(a.email)!==normalizedEmail(b.email)
      ||text(a.displayName)!==text(b.displayName))push(mismatches.subscriptions,key)
    if(text(a.subscribedAt)!==text(b.subscribedAt))push(mismatches.timestamps,`subscription:${key}`)
  }

  const leftPublications=byKey(firebase.publications??[],row=>String(row.id))
  const rightPublications=byKey(supabase.publications??[],row=>String(row.id))
  for(const id of new Set([...leftPublications.keys(),...rightPublications.keys()])){
    const a=leftPublications.get(id),b=rightPublications.get(id)
    if(!a||!b||count(a.commentCount)!==count(b.commentCount))push(mismatches.counts,`publication:${id}`)
  }
  mismatches.orphans=[...(supabase.orphans??[])].map(String).sort()
  for(const values of Object.values(mismatches))values.sort()
  return {mismatches,ready:Object.values(mismatches).every(values=>values.length===0)}
}

if(process.argv.includes('--self-test')){
  const firebase={
    comments:[{id:'c',notaId:'n',parentId:null,authorId:'firebase-u',authorName:'Ada',authorTag:'ada',content:'{"text":"hello","type":"doc"}',likeCount:1,dislikeCount:0,replyCount:0,createdAt:'t1',updatedAt:'t2'}],
    votes:[{commentId:'c',userId:'firebase-u',vote:'like',createdAt:'t1',updatedAt:'t2'}],
    subscriptions:[{userId:'firebase-u',email:'ADA@EXAMPLE.TEST',displayName:'Ada',subscribedAt:'t1'}],
    publications:[{id:'n',commentCount:1}],orphans:[],
  }
  const supabase={
    identityMap:{'firebase-u':'supabase-u'},
    comments:[{...firebase.comments[0],authorId:'supabase-u',content:{type:'doc',text:'hello'}}],
    votes:[{...firebase.votes[0],userId:'supabase-u'}],
    subscriptions:[{...firebase.subscriptions[0],userId:'supabase-u',email:'ada@example.test'}],
    publications:structuredClone(firebase.publications),orphans:[],
  }
  assert.equal(compare(firebase,supabase).ready,true)
  const reject=(category,mutate)=>{const copy=structuredClone(supabase);mutate(copy);assert.ok(compare(firebase,copy).mismatches[category].length,`${category} negative fixture was accepted`)}
  reject('comments',copy=>{copy.comments[0].content={type:'doc',text:'changed'}})
  reject('comments',copy=>{copy.comments[0].content={type:'doc',text:1}})
  reject('comments',copy=>{copy.comments[0].authorId='wrong-owner'})
  reject('comments',copy=>{copy.comments[0].authorName='Wrong'})
  reject('comments',copy=>{copy.comments[0].authorTag='wrong'})
  reject('relationships',copy=>{copy.comments[0].parentId='wrong-parent'})
  reject('votes',copy=>{copy.votes[0].vote='dislike'})
  reject('counts',copy=>{copy.comments[0].likeCount=2})
  reject('counts',copy=>{copy.publications[0].commentCount=2})
  reject('subscriptions',copy=>{copy.subscriptions[0].email='other@example.test'})
  reject('timestamps',copy=>{copy.comments[0].updatedAt='wrong-time'})
  reject('orphans',copy=>{copy.orphans=['missing-parent']})
  console.log('Community reconciliation report self-test passed all positive and negative invariants.')
}else{
  const [firebasePath,supabasePath]=process.argv.slice(2)
  if(!firebasePath||!supabasePath)throw new Error('Usage: reconcile-community.mjs FIREBASE.json SUPABASE.json')
  console.log(JSON.stringify(compare(JSON.parse(fs.readFileSync(firebasePath)),JSON.parse(fs.readFileSync(supabasePath))),null,2))
}
