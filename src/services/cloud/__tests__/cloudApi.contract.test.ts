import { describe, expect, it } from 'vitest'
import type { CloudApi, CloudComment, CloudPublication, CloudResult, CloudSession, CloudSubscription } from '..'
import { CloudError } from '..'

const publication: CloudPublication = {
  id: 'nota-1', authorId: 'user-1', title: 'A nota', content: { type: 'doc' }, authorName: 'Ada',
  isPublic: true, isSubPage: false, parentId: null, tags: ['research'], citations: [],
  publishedAt: '2026-08-13T00:00:00.000Z', updatedAt: '2026-08-13T00:00:00.000Z',
}
const comment: CloudComment = {
  id: 'comment-1', notaId: publication.id, authorId: 'user-1', authorName: 'Ada', authorTag: 'ada',
  content: 'hello', parentId: null, createdAt: publication.publishedAt, updatedAt: publication.updatedAt,
}
const session: CloudSession = {
  user: { id: 'user-1', email: 'ada@example.test', displayName: 'Ada', photoUrl: null, emailVerified: true, createdAt: publication.publishedAt, lastSignInAt: publication.updatedAt },
  accessToken: 'token', expiresAt: '2026-08-14T00:00:00.000Z',
}
const ok = <T>(data: T): CloudResult<T> => ({ ok: true, data })

function fakeCloudApi(): CloudApi {
  const listeners = new Set<(value: CloudPublication | null) => void>()
  return {
    auth: {
      currentSession: async () => ok(session), signInWithPassword: async () => ok(session), signUpWithPassword: async () => ok(session), signInWithGoogle: async () => ok(session), signOut: async () => ok(undefined), sendPasswordReset: async () => ok(undefined),
      onSessionChange: () => ({ unsubscribe() {} }),
    },
    profiles: { getProfile: async () => ok(null), upsertProfile: async value => ok(value), isTagAvailable: async () => ok(true) },
    publishing: {
      getPublication: async id => ok(id === publication.id ? publication : null),
      listPublications: async page => ok({ items: [publication].slice(0, page.limit), nextCursor: page.limit === 1 ? 'cursor-2' : null }),
      upsertPublication: async value => { listeners.forEach(listener => listener(value)); return ok(value) },
      deletePublication: async () => ok(undefined),
      subscribeToPublication: (_id, listener) => { listeners.add(listener); return { unsubscribe: () => listeners.delete(listener) } satisfies CloudSubscription },
    },
    comments: { listComments: async () => ok({ items: [comment], nextCursor: null }), createComment: async value => ok({ ...value, id: comment.id, createdAt: publication.publishedAt, updatedAt: publication.updatedAt }), deleteComment: async () => ok(undefined), vote: async () => ok({ likeCount: 1, dislikeCount: 0, userVote: 'like' }) },
    statistics: { getPublicationStats: async () => ok({ viewCount: 1, uniqueViewers: 1, likeCount: 1, dislikeCount: 0, cloneCount: 0, commentCount: 1, lastViewedAt: publication.updatedAt }), recordView: async () => ok({ viewCount: 2, uniqueViewers: 1 }), vote: async () => ok({ likeCount: 1, dislikeCount: 0, userVote: 'like' }), recordClone: async () => ok(1) },
    newsletter: { subscribe: async () => ok(undefined), unsubscribe: async () => ok(undefined) },
    analytics: { track: () => undefined },
  }
}

function cloudContract(name: string, create: () => CloudApi): void {
  describe(`${name} CloudApi contract`, () => {
    it('uses provider-neutral results and ISO timestamps for auth and pages', async () => {
      const api = create()
      const authenticated = await api.auth.currentSession()
      expect(authenticated).toEqual(ok(session))
      if (!authenticated.ok) throw authenticated.error
      expect(authenticated.data?.user.createdAt).toMatch(/^\d{4}-\d\d-\d\dT/)
      const page = await api.publishing.listPublications({ limit: 1 })
      expect(page).toEqual(ok({ items: [publication], nextCursor: 'cursor-2' }))
    })

    it('uses typed failures instead of provider exceptions', () => {
      const error = new CloudError('forbidden', 'not allowed')
      const result: CloudResult<never> = { ok: false, error }
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.code).toBe('forbidden')
    })

    it('delivers realtime updates until the subscription is removed', async () => {
      const api = create()
      const received: (CloudPublication | null)[] = []
      const subscription = api.publishing.subscribeToPublication(publication.id, value => received.push(value))
      await api.publishing.upsertPublication({ ...publication, title: 'Changed' })
      subscription.unsubscribe()
      await api.publishing.upsertPublication({ ...publication, title: 'Ignored' })
      expect(received.map(value => value?.title)).toEqual(['Changed'])
    })

    it('keeps profiles, comments, metrics, newsletter, and analytics in the same result boundary', async () => {
      const api = create()
      const tracked: string[] = []
      api.analytics.track = event => tracked.push(event)

      expect((await api.profiles.getProfile('missing')).ok).toBe(true)
      expect((await api.profiles.isTagAvailable('ada')).ok).toBe(true)
      expect((await api.comments.listComments(publication.id, { limit: 10 })).ok).toBe(true)
      expect((await api.comments.createComment({
        notaId: publication.id, authorId: session.user.id, authorName: 'Ada', authorTag: 'ada', content: 'new', parentId: null,
      })).ok).toBe(true)
      expect((await api.comments.vote(comment.id, 'like')).ok).toBe(true)
      expect((await api.comments.deleteComment(comment.id)).ok).toBe(true)
      expect((await api.statistics.getPublicationStats(publication.id)).ok).toBe(true)
      expect((await api.statistics.recordView(publication.id)).ok).toBe(true)
      expect((await api.statistics.vote(publication.id, 'like')).ok).toBe(true)
      expect((await api.statistics.recordClone(publication.id)).ok).toBe(true)
      expect((await api.newsletter.subscribe('ada@example.test', 'Ada')).ok).toBe(true)
      expect((await api.newsletter.unsubscribe()).ok).toBe(true)
      api.analytics.track('contract_checked')
      expect(tracked).toEqual(['contract_checked'])
    })
  })
}

cloudContract('fake', fakeCloudApi)
