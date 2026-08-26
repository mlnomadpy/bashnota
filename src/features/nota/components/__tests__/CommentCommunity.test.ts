import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Comment } from '@/features/nota/types/nota'
import CommentSection from '../CommentSection.vue'
import CommentItem from '../CommentItem.vue'

const mocks=vi.hoisted(()=>({
  getComments:vi.fn(),getUserVote:vi.fn(async()=>null),deleteComment:vi.fn(async()=>true),
  user:{isAuthenticated:true,currentUser:{uid:'viewer'}},
}))
vi.mock('@/features/nota/services/communityCommentService',()=>({communityCommentService:{
  getComments:mocks.getComments,getUserVote:mocks.getUserVote,deleteComment:mocks.deleteComment,
  voteOnComment:vi.fn(),addComment:vi.fn(),editComment:vi.fn(),
}}))
vi.mock('@/features/auth/stores/auth',()=>({useAuthStore:()=>mocks.user}))
vi.mock('vue-router',()=>({useRouter:()=>({push:vi.fn()})}))
vi.mock('vue-sonner',()=>({toast:vi.fn()}))
vi.mock('@/services/logger',()=>({logger:{error:vi.fn(),info:vi.fn()}}))

const makeComment=(index:number,overrides:Partial<Comment>={}):Comment=>({
  id:`comment-${String(index).padStart(2,'0')}`,notaId:'nota',authorId:'author',authorName:'Ada',authorTag:'ada',
  content:`Comment ${index}`,createdAt:new Date(Date.UTC(2026,0,31)-index*1000).toISOString(),
  updatedAt:new Date(Date.UTC(2026,0,31)-index*1000).toISOString(),parentId:null,
  likeCount:0,dislikeCount:0,replyCount:0,...overrides,
})
const buttonStub={template:'<button v-bind="$attrs"><slot /></button>'}

describe('mounted community comments',()=>{
  beforeEach(()=>{vi.clearAllMocks();mocks.user.isAuthenticated=true;mocks.user.currentUser={uid:'viewer'}})

  it('passes the cursor and appends 20+ comments without duplicates in stable order',async()=>{
    const first=Array.from({length:20},(_,index)=>makeComment(index))
    const second=[makeComment(19),...Array.from({length:5},(_,index)=>makeComment(index+20))]
    mocks.getComments.mockResolvedValueOnce({items:first,nextCursor:'page-2'})
      .mockResolvedValueOnce({items:second,nextCursor:null})
    const wrapper=mount(CommentSection,{props:{notaId:'nota'},global:{stubs:{
      Button:buttonStub,CommentItem:{props:['comment'],template:'<div class="comment-stub">{{ comment.id }}</div>'},
      CommentForm:true,MessageSquare:true,RefreshCw:true,Shield:true,
    }}})
    await flushPromises()
    expect(wrapper.findAll('.comment-stub')).toHaveLength(20)
    const loadMore=wrapper.findAll('button').find(button=>button.text().includes('Load More'))
    expect(loadMore).toBeTruthy()
    await loadMore!.trigger('click');await flushPromises()
    expect(mocks.getComments).toHaveBeenNthCalledWith(2,'nota',null,20,'page-2')
    const ids=wrapper.findAll('.comment-stub').map(node=>node.text())
    expect(ids).toHaveLength(25)
    expect(new Set(ids).size).toBe(25)
    expect(ids).toEqual(Array.from({length:25},(_,index)=>`comment-${String(index).padStart(2,'0')}`))
    expect(wrapper.text()).not.toContain('Load More')
    wrapper.unmount()
  })

  it('shows delete to a nota moderator but not an unrelated authenticated caller',async()=>{
    const stubs={
      Button:buttonStub,Badge:true,MessageSquare:true,ThumbsUp:true,ThumbsDown:true,MoreVertical:true,Trash2:true,
      DropdownMenu:{template:'<div><slot /></div>'},DropdownMenuTrigger:{template:'<div><slot /></div>'},
      DropdownMenuContent:{template:'<div><slot /></div>'},DropdownMenuItem:{template:'<div v-bind="$attrs"><slot /></div>'},
      Dialog:{template:'<div />'},DialogContent:true,DialogHeader:true,DialogTitle:true,DialogFooter:true,CommentForm:true,
    }
    const moderator=mount(CommentItem,{props:{notaId:'nota',comment:makeComment(1,{canDelete:true,isOwner:false})},global:{stubs}})
    await flushPromises()
    expect(moderator.find('[data-testid="delete-comment-action"]').exists()).toBe(true)
    moderator.unmount()

    const unrelated=mount(CommentItem,{props:{notaId:'nota',comment:makeComment(1,{canDelete:false,isOwner:false})},global:{stubs}})
    await flushPromises()
    expect(unrelated.find('[data-testid="delete-comment-action"]').exists()).toBe(false)
    unrelated.unmount()
  })
})
