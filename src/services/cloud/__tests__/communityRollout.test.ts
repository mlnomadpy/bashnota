import { describe,expect,it } from 'vitest'
import { resolveCommunityRollout } from '../communityRollout'

const green={version:'supabase-v1',enabled:'true',marker:'community-c6-fixture',comments:'true',relationships:'true',
  votes:'true',counts:'true',subscriptions:'true',timestamps:'true',orphans:'true',task008Ready:'true'}
describe('community rollout',()=>{
  it('defaults to Firebase and requires every exact comparison plus task008',()=>{
    expect(resolveCommunityRollout({}, {auth:'supabase-v1',publishing:'supabase-v1'}).version).toBe('firebase-v1')
    for(const key of ['comments','relationships','votes','counts','subscriptions','timestamps','orphans','task008Ready'])
      expect(resolveCommunityRollout({...green,[key]:'false'},{auth:'supabase-v1',publishing:'supabase-v1'}).version).toBe('firebase-v1')
  })
  it('requires reconciled dependencies before producing a database-verified candidate',()=>{
    expect(resolveCommunityRollout(green,{auth:'firebase-v1',publishing:'supabase-v1'}).version).toBe('firebase-v1')
    expect(resolveCommunityRollout(green,{auth:'supabase-v1',publishing:'supabase-v1'})).toMatchObject({version:'supabase-v1',candidateMarker:green.marker})
  })
})
