import assert from 'node:assert/strict'
import fs from 'node:fs'

const byId=rows=>new Map(rows.map(row=>[row.id,row]))
export function compare(firebase,supabase){
  const categories=['comments','votes','subscriptions']
  const mismatches={comments:[],relationships:[],votes:[],counts:[],subscriptions:[],timestamps:[],orphans:[]}
  for(const category of categories){
    const left=byId(firebase[category]??[]),right=byId(supabase[category]??[])
    for(const id of new Set([...left.keys(),...right.keys()])){
      const a=left.get(id),b=right.get(id)
      if(!a||!b){mismatches[category].push(id);continue}
      if(category==='comments'){
        if(a.notaId!==b.notaId||a.parentId!==b.parentId)mismatches.relationships.push(id)
        if(Number(a.likeCount??0)!==Number(b.likeCount??0)||Number(a.dislikeCount??0)!==Number(b.dislikeCount??0)||Number(a.replyCount??0)!==Number(b.replyCount??0))mismatches.counts.push(id)
        if(a.createdAt!==b.createdAt||a.updatedAt!==b.updatedAt)mismatches.timestamps.push(id)
      }else if(JSON.stringify(a)!==JSON.stringify(b))mismatches[category].push(id)
    }
  }
  mismatches.orphans=[...(supabase.orphans??[])].map(String).sort()
  return {mismatches,ready:Object.values(mismatches).every(values=>values.length===0)}
}
if(process.argv.includes('--self-test')){
  const same={comments:[{id:'c',notaId:'n',parentId:null,likeCount:1,createdAt:'t',updatedAt:'t'}],votes:[{id:'c:u',vote:'like'}],subscriptions:[{id:'u',email:'a@b.c'}],orphans:[]}
  assert.equal(compare(same,structuredClone(same)).ready,true)
  assert.equal(compare(same,{...structuredClone(same),orphans:['missing-parent']}).ready,false)
  assert.equal(compare(same,{...structuredClone(same),comments:[{...same.comments[0],replyCount:2}]}).ready,false)
  console.log('Community reconciliation report self-test passed.')
}else{
  const [firebasePath,supabasePath]=process.argv.slice(2)
  if(!firebasePath||!supabasePath)throw new Error('Usage: reconcile-community.mjs FIREBASE.json SUPABASE.json')
  console.log(JSON.stringify(compare(JSON.parse(fs.readFileSync(firebasePath)),JSON.parse(fs.readFileSync(supabasePath))),null,2))
}
