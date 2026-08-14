import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CloudProfile } from '..'
import { cloudContract, comment, publication, session } from './cloudApi.contract'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { nextTick } from 'vue'
import NotaContentViewer from '@/features/editor/components/NotaContentViewer.vue'

const state = vi.hoisted(() => ({
  currentUser: null as any,
  records: new Map<string, Record<string, any>>(),
  listeners: new Map<string, Set<(snapshot: any) => void>>(),
  persistStats: true,
  loginError: null as unknown,
  transactionFailure: null as unknown,
  concurrentReservation: false,
  analytics: [] as string[],
}))

const pathFor = (...parts: string[]) => parts.join('/')
const snapshot = (path: string) => ({
  id: path.split('/').at(-1)!,
  exists: () => state.records.has(path),
  data: () => state.records.get(path),
})
const emit = (path: string) => state.listeners.get(path)?.forEach(listener => listener(snapshot(path)))

vi.mock('firebase/auth', () => ({}))
vi.mock('firebase/firestore', () => ({
  collection: (_firestore: unknown, name: string) => ({ name, constraints: [] as any[] }),
  doc: (_firestore: unknown, ...parts: string[]) => ({ path: pathFor(...parts) }),
  getDoc: async (reference: { path: string }) => snapshot(reference.path),
  getDocs: async (source: { name: string; constraints?: any[] }) => {
    const constraints = source.constraints ?? []
    const after = constraints.find(constraint => constraint.kind === 'after')?.value?.id
    const max = constraints.find(constraint => constraint.kind === 'limit')?.value ?? Number.MAX_SAFE_INTEGER
    const docs = [...state.records.entries()]
      .filter(([path, value]) => path.startsWith(`${source.name}/`) && !path.slice(source.name.length + 1).includes('/') && value.isPublic !== false)
      .sort(([left], [right]) => right.localeCompare(left))
    const start = after ? Math.max(docs.findIndex(([path]) => path.endsWith(`/${after}`)) + 1, 0) : 0
    return { docs: docs.slice(start, start + max).map(([path]) => snapshot(path)) }
  },
  query: (source: { name: string }, ...constraints: any[]) => ({ ...source, constraints }),
  where: () => ({ kind: 'where' }),
  orderBy: () => ({ kind: 'order' }),
  startAfter: (value: unknown) => ({ kind: 'after', value }),
  limit: (value: number) => ({ kind: 'limit', value }),
  setDoc: async (reference: { path: string }, value: Record<string, any>, options?: { merge?: boolean }) => {
    state.records.set(reference.path, options?.merge ? { ...state.records.get(reference.path), ...value } : value)
    emit(reference.path)
  },
  deleteDoc: async (reference: { path: string }) => { state.records.delete(reference.path); emit(reference.path) },
  updateDoc: async (reference: { path: string }, value: Record<string, any>) => { state.records.set(reference.path, { ...state.records.get(reference.path), ...value }); emit(reference.path) },
  onSnapshot: (reference: { path: string }, listener: (value: unknown) => void) => {
    const listeners = state.listeners.get(reference.path) ?? new Set()
    listeners.add(listener)
    state.listeners.set(reference.path, listeners)
    return () => listeners.delete(listener)
  },
  runTransaction: async (_firestore: unknown, update: (transaction: any) => Promise<unknown>) => {
    const writes: { kind: 'update' | 'set' | 'delete'; path: string; value?: Record<string, any>; merge?: boolean }[] = []
    await update({
      get: async (reference: { path: string }) => snapshot(reference.path),
      update: (reference: { path: string }, value: Record<string, any>) => writes.push({ kind: 'update', path: reference.path, value }),
      set: (reference: { path: string }, value: Record<string, any>, options?: { merge?: boolean }) => writes.push({ kind: 'set', path: reference.path, value, merge: options?.merge }),
      delete: (reference: { path: string }) => writes.push({ kind: 'delete', path: reference.path }),
    })
    if (state.concurrentReservation) {
      const reservation = writes.find(write => write.kind === 'set' && write.path.startsWith('userTags/'))
      if (reservation) state.records.set(reservation.path, { uid: 'concurrent-user' })
      throw Object.assign(new Error('reservation changed concurrently'), { code: 'already-exists' })
    }
    if (state.transactionFailure) throw state.transactionFailure
    for (const write of writes) {
      if (write.kind === 'delete') state.records.delete(write.path)
      else if (write.kind === 'set' && write.merge) state.records.set(write.path, { ...state.records.get(write.path), ...write.value })
      else state.records.set(write.path, write.kind === 'update' ? { ...state.records.get(write.path), ...write.value } : write.value!)
      emit(write.path)
    }
  },
  serverTimestamp: () => ({ toDate: () => new Date('2026-08-13T00:00:00.000Z') }),
}))
vi.mock('@/services/firebase', () => ({
  auth: { get currentUser() { return state.currentUser } },
  firestore: {},
  logAnalyticsEvent: (event: string) => state.analytics.push(event),
}))
vi.mock('@/features/auth/services/auth', () => ({
  authService: {
    getCurrentUser: () => state.currentUser,
    loginWithEmail: async () => { if (state.loginError) throw state.loginError; return state.currentUser },
    loginWithGoogle: async () => state.currentUser,
    register: async () => state.currentUser,
    logout: async () => undefined,
    resetPassword: async () => undefined,
    onAuthStateChange: () => () => undefined,
    getUserProfileData: async (userId: string) => state.records.get(`users/${userId}`) ?? null,
    updateUserTag: async (userId: string, nextTag: string) => {
      const user = state.records.get(`users/${userId}`)
      if (!user) throw new Error('User document not found')
      const oldTag = user.userTag
      state.records.set(`users/${userId}`, { ...user, userTag: nextTag })
      state.records.set(`userTags/${nextTag}`, { uid: userId })
      if (oldTag) state.records.delete(`userTags/${oldTag}`)
      state.records.set(`publicProfiles/${userId}`, {
        uid: userId, userTag: nextTag, photoURL: state.currentUser.photoURL || '', lastUpdatedAt: '2026-08-13T00:00:00.000Z',
      })
    },
  },
}))
vi.mock('@/features/nota/services/commentService', () => ({
  commentService: {
    getComments: async () => [state.records.get('comments/comment-1')],
    addComment: async (notaId: string, userId: string, authorName: string, authorTag: string, content: string, parentId: string | null) => {
      const created = { id: 'comment-created', notaId, authorId: userId, authorName, authorTag, content, parentId,
        createdAt: '2026-08-13T00:00:00.000Z', updatedAt: '2026-08-13T00:00:00.000Z' }
      state.records.set(`comments/${created.id}`, created)
      return created
    },
    deleteComment: async () => true,
    getUserVote: async () => null,
    voteOnComment: async () => ({ likeCount: 1, dislikeCount: 0, userVote: 'like' as const }),
  },
}))
vi.mock('@/features/bashhub/services/statisticsService', () => ({
  statisticsService: {
    recordView: async (notaId: string) => {
      if (!state.persistStats) return
      const publication = state.records.get(`publishedNotas/${notaId}`)
      if (publication) state.records.set(`publishedNotas/${notaId}`, { ...publication, viewCount: (publication.viewCount ?? 0) + 1 })
    },
    recordVote: async () => ({ likeCount: 1, dislikeCount: 0, userVote: 'like' as const }),
    recordClone: async (notaId: string) => {
      if (!state.persistStats) return
      const publication = state.records.get(`publishedNotas/${notaId}`)
      if (publication) state.records.set(`publishedNotas/${notaId}`, { ...publication, cloneCount: (publication.cloneCount ?? 0) + 1 })
    },
  },
}))

import { firebaseCompatibilityApi } from '../firebaseCompatibility'

beforeEach(() => {
  state.records.clear()
  state.listeners.clear()
  state.persistStats = true
  state.loginError = null
  state.transactionFailure = null
  state.concurrentReservation = false
  state.analytics.length = 0
  state.currentUser = {
    uid: session.user.id, email: session.user.email, displayName: session.user.displayName, photoURL: 'ada.png', emailVerified: true,
    metadata: { creationTime: publication.publishedAt, lastSignInTime: publication.updatedAt }, getIdToken: async () => 'firebase-token',
  }
  state.records.set(`publishedNotas/${publication.id}`, { ...publication, viewCount: 1, uniqueViewers: 1, likeCount: 1, dislikeCount: 0, cloneCount: 0, commentCount: 1, lastViewedAt: publication.updatedAt })
  state.records.set(`comments/${comment.id}`, { ...comment })
  state.records.set(`users/${session.user.id}`, { uid: session.user.id, userTag: 'ada', email: session.user.email })
  state.records.set('userTags/ada', { uid: session.user.id })
  state.records.set(`publicProfiles/${session.user.id}`, { uid: session.user.id, userTag: 'ada', photoURL: 'ada.png', lastUpdatedAt: publication.updatedAt })
})

cloudContract('Firebase compatibility', () => firebaseCompatibilityApi)

describe('Firebase compatibility adapter behavior', () => {
  it('atomically updates private/public profile and tag reservations', async () => {
    const update: CloudProfile = { userId: session.user.id, userTag: 'grace', photoUrl: 'grace.png', updatedAt: publication.updatedAt }
    const result = await firebaseCompatibilityApi.profiles.upsertProfile(update)

    expect(result).toMatchObject({ ok: true, data: { userId: session.user.id, userTag: 'grace', photoUrl: 'grace.png' } })
    expect(state.records.get(`users/${session.user.id}`)?.userTag).toBe('grace')
    expect(state.records.get('userTags/grace')).toMatchObject({ uid: session.user.id })
    expect(state.records.has('userTags/ada')).toBe(false)
    expect(state.records.get(`publicProfiles/${session.user.id}`)).toMatchObject({ uid: session.user.id, userTag: 'grace', photoURL: 'grace.png' })
  })

  it('rejects reserved tags without mutating the established profile records', async () => {
    state.records.set('userTags/grace', { uid: 'other-user' })
    const result = await firebaseCompatibilityApi.profiles.upsertProfile({ userId: session.user.id, userTag: 'grace', photoUrl: 'ada.png', updatedAt: publication.updatedAt })

    expect(result).toMatchObject({ ok: false, error: { code: 'conflict' } })
    expect(state.records.get(`users/${session.user.id}`)?.userTag).toBe('ada')
    expect(state.records.get('userTags/grace')).toEqual({ uid: 'other-user' })
    expect(state.records.get('userTags/ada')).toEqual({ uid: session.user.id })
  })

  it('preserves the owned reservation for a same-tag update', async () => {
    const result = await firebaseCompatibilityApi.profiles.upsertProfile({ userId: session.user.id, userTag: 'ada', photoUrl: 'next.png', updatedAt: publication.updatedAt })

    expect(result).toMatchObject({ ok: true, data: { userTag: 'ada', photoUrl: 'next.png' } })
    expect(state.records.get(`users/${session.user.id}`)?.userTag).toBe('ada')
    expect(state.records.get('userTags/ada')).toEqual({ uid: session.user.id })
    expect(state.records.get(`publicProfiles/${session.user.id}`)).toMatchObject({ userTag: 'ada', photoURL: 'next.png' })
  })

  it('leaves every profile record intact when a competing reservation wins or the transaction fails', async () => {
    const before = new Map(state.records)
    state.concurrentReservation = true
    const collision = await firebaseCompatibilityApi.profiles.upsertProfile({ userId: session.user.id, userTag: 'grace', photoUrl: 'grace.png', updatedAt: publication.updatedAt })

    expect(collision).toMatchObject({ ok: false, error: { code: 'conflict' } })
    expect(state.records.get(`users/${session.user.id}`)).toEqual(before.get(`users/${session.user.id}`))
    expect(state.records.get(`publicProfiles/${session.user.id}`)).toEqual(before.get(`publicProfiles/${session.user.id}`))
    expect(state.records.get('userTags/ada')).toEqual(before.get('userTags/ada'))
    expect(state.records.get('userTags/grace')).toEqual({ uid: 'concurrent-user' })

    state.concurrentReservation = false
    state.records.delete('userTags/grace')
    state.transactionFailure = Object.assign(new Error('write unavailable'), { code: 'unavailable' })
    const failure = await firebaseCompatibilityApi.profiles.upsertProfile({ userId: session.user.id, userTag: 'grace', photoUrl: 'grace.png', updatedAt: publication.updatedAt })
    expect(failure).toMatchObject({ ok: false, error: { code: 'unavailable' } })
    expect(state.records.get(`users/${session.user.id}`)).toEqual(before.get(`users/${session.user.id}`))
    expect(state.records.get(`publicProfiles/${session.user.id}`)).toEqual(before.get(`publicProfiles/${session.user.id}`))
    expect(state.records.get('userTags/ada')).toEqual(before.get('userTags/ada'))
    expect(state.records.has('userTags/grace')).toBe(false)
  })

  it('preserves typed missing/unavailable errors when legacy statistics helpers swallow writes', async () => {
    state.records.delete(`publishedNotas/${publication.id}`)
    expect(await firebaseCompatibilityApi.statistics.recordView(publication.id)).toMatchObject({ ok: false, error: { code: 'not-found' } })
    expect(await firebaseCompatibilityApi.statistics.recordClone(publication.id)).toMatchObject({ ok: false, error: { code: 'not-found' } })

    state.records.set(`publishedNotas/${publication.id}`, { ...publication, viewCount: 1, cloneCount: 1 })
    state.persistStats = false
    expect(await firebaseCompatibilityApi.statistics.recordView(publication.id)).toMatchObject({ ok: false, error: { code: 'unavailable' } })
    expect(await firebaseCompatibilityApi.statistics.recordClone(publication.id)).toMatchObject({ ok: false, error: { code: 'unavailable' } })
  })

  it('maps asynchronous Firebase-shaped failures into stable CloudError codes', async () => {
    state.loginError = Object.assign(new Error('network unavailable'), { code: 'auth/network-request-failed' })
    expect(await firebaseCompatibilityApi.auth.signInWithPassword('ada@example.test', 'secret')).toMatchObject({ ok: false, error: { code: 'unavailable' } })
  })

  it('maps provider snapshots and honors publication cursors', async () => {
    state.records.set('publishedNotas/nota-0', { ...publication, id: 'nota-0', title: 'Older', publishedAt: '2026-08-12T00:00:00.000Z' })
    const first = await firebaseCompatibilityApi.publishing.listPublications({ limit: 1 })
    if (!first.ok) throw first.error
    const second = await firebaseCompatibilityApi.publishing.listPublications({ limit: 1, cursor: first.data.nextCursor })

    expect(first.data.items[0]).toMatchObject({ id: publication.id, publishedAt: publication.publishedAt, updatedAt: publication.updatedAt })
    expect(second).toMatchObject({ ok: true, data: { items: [{ id: 'nota-0', title: 'Older' }] } })
  })

  it('normalizes legacy string content at the Firebase read boundary and omits private identity', async () => {
    state.records.set(`publishedNotas/${publication.id}`, {
      ...publication,
      content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
    })
    const result = await firebaseCompatibilityApi.publishing.getPublication(publication.id)
    expect(result).toMatchObject({ ok: true, data: { content: { type: 'doc', content: [{ type: 'paragraph' }] } } })
    if (!result.ok || !result.data) throw new Error('expected publication')
    expect(result.data).not.toHaveProperty('authorId')
  })

  it('publishes, reads a legacy Firebase representation, and mounts the canonical document', async () => {
    const contentDocument = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Firebase provider render' }] }] }
    expect((await firebaseCompatibilityApi.publishing.upsertPublication({ ...publication, content: contentDocument })).ok).toBe(true)
    state.records.set(`publishedNotas/${publication.id}`, {
      ...state.records.get(`publishedNotas/${publication.id}`), content: JSON.stringify(contentDocument),
    })
    const read = await firebaseCompatibilityApi.publishing.getPublication(publication.id)
    if (!read.ok || !read.data) throw new Error('expected Firebase publication')
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] })
    await router.push('/'); await router.isReady()
    const wrapper = mount(NotaContentViewer, {
      attachTo: document.body,
      props: { content: read.data.content, readonly: true, isPublished: true },
      global: { plugins: [createPinia(), router] },
    })
    await nextTick(); await nextTick()
    expect(wrapper.text()).toContain('Firebase provider render')
    wrapper.unmount()
  })
})
