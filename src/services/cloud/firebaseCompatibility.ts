/**
 * Temporary Firebase implementation of the provider-neutral port. Product code
 * must import CloudApi types, never Firebase SDK values. Existing feature
 * services continue using Firebase until their individual migration tasks;
 * this adapter is the compatibility seam used by all new cloud work.
 */
import {
  type User, updatePassword,
} from 'firebase/auth'
import {
  collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy,
  query, runTransaction, serverTimestamp, setDoc, startAfter, updateDoc, where,
} from 'firebase/firestore'
import { auth, firestore, logAnalyticsEvent } from '@/services/firebase'
import { authService } from '@/features/auth/services/auth'
import { statisticsService } from '@/features/bashhub/services/statisticsService'
import { commentService } from '@/features/nota/services/commentService'
import type {
  CloudApi, CloudAnalyticsApi, CloudAuthApi, CloudCommentsApi, CloudNewsletterApi,
  CloudProfilesApi, CloudPublishingApi, CloudStatisticsApi,
} from './api'
import {
  CloudError, type CloudComment, type CloudJson, type CloudPage, type CloudPublication,
  type CloudProfile, type CloudResult, type CloudSession, type CloudSubscription,
  type CloudUser, type CloudVoteResult, type VoteKind, normalizeCloudPublishedContent,
} from './types'

const ok = <T>(data: T): CloudResult<T> => ({ ok: true, data })
const fail = <T>(cause: unknown): CloudResult<T> => ({ ok: false, error: cause instanceof CloudError ? cause : firebaseError(cause) })

function firebaseError(cause: unknown): CloudError {
  const code = typeof cause === 'object' && cause && 'code' in cause ? String(cause.code) : ''
  const message = cause instanceof Error ? cause.message : 'Cloud request failed'
  const normalized = code.includes('permission') || code.includes('unauthorized') ? 'forbidden'
    : code.includes('not-found') || /not found/i.test(message) ? 'not-found'
    : code.includes('already') ? 'conflict'
        : code.includes('invalid') ? 'invalid'
          : code.includes('network') || code.includes('unavailable') ? 'unavailable' : 'unknown'
  return new CloudError(normalized, message, cause)
}

function timestamp(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  return null
}

function cloudUser(user: User): CloudUser {
  return {
    id: user.uid, email: user.email, displayName: user.displayName, photoUrl: user.photoURL,
    emailVerified: user.emailVerified, createdAt: user.metadata.creationTime ?? null,
    lastSignInAt: user.metadata.lastSignInTime ?? null,
  }
}

async function sessionFor(user: User | null): Promise<CloudSession | null> {
  if (!user) return null
  return { user: cloudUser(user), accessToken: await user.getIdToken(), expiresAt: null }
}

function publication(id: string, value: Record<string, unknown>): CloudPublication {
  return {
    id, title: String(value.title ?? ''),
    content: normalizeCloudPublishedContent(value.content), authorName: String(value.authorName ?? ''),
    isPublic: value.isPublic !== false, isSubPage: value.isSubPage === true,
    parentId: typeof value.parentId === 'string' ? value.parentId : null,
    tags: Array.isArray(value.tags) ? value.tags.map(String) : [],
    citations: Array.isArray(value.citations) ? value.citations as CloudJson[] : [],
    publishedAt: timestamp(value.publishedAt) ?? '', updatedAt: timestamp(value.updatedAt) ?? '',
    authorTag: typeof value.authorTag === 'string' ? value.authorTag : null,
    publishedSubPages: Array.isArray(value.publishedSubPages) ? value.publishedSubPages.map(String) : [],
    viewCount: Number(value.viewCount ?? 0), uniqueViewers: Number(value.uniqueViewers ?? 0),
    likeCount: Number(value.likeCount ?? 0), dislikeCount: Number(value.dislikeCount ?? 0),
    cloneCount: Number(value.cloneCount ?? 0), commentCount: Number(value.commentCount ?? 0),
    lastViewedAt: timestamp(value.lastViewedAt),
  }
}

function comment(id: string, value: Record<string, unknown>): CloudComment {
  return {
    id, notaId: String(value.notaId ?? ''), authorId: String(value.authorId ?? ''),
    authorName: String(value.authorName ?? ''), authorTag: typeof value.authorTag === 'string' ? value.authorTag : null,
    content: value.content as CloudJson, parentId: typeof value.parentId === 'string' ? value.parentId : null,
    createdAt: timestamp(value.createdAt) ?? '', updatedAt: timestamp(value.updatedAt) ?? '',
    likeCount: Number(value.likeCount ?? 0), dislikeCount: Number(value.dislikeCount ?? 0),
    replyCount: Number(value.replyCount ?? 0),
  }
}

const analytics: CloudAnalyticsApi = {
  track(event, properties) { logAnalyticsEvent(event, properties) },
}

const authApi: CloudAuthApi = {
  // Delegate to the established service rather than duplicating authentication
  // side effects such as tags, public-profile repair, analytics, and toasts.
  async currentSession() { try { return ok(await sessionFor(authService.getCurrentUser())) } catch (error) { return fail(error) } },
  async signInWithPassword(email, password) {
    try {
      const user = await authService.loginWithEmail(email, password)
      if (!user) return fail(new CloudError('unauthenticated', 'Sign in did not return a user'))
      return ok((await sessionFor(user))!)
    } catch (error) { return fail(error) }
  },
  async signUpWithPassword(email, password, displayName) {
    try {
      const user = await authService.register(email, password, displayName)
      if (!user) return fail(new CloudError('unknown', 'Registration did not return a user'))
      return ok((await sessionFor(user))!)
    } catch (error) { return fail(error) }
  },
  async signInWithGoogle() {
    try {
      const user = await authService.loginWithGoogle()
      if (!user) return fail(new CloudError('unauthenticated', 'Google sign-in did not return a user'))
      return ok(undefined)
    } catch (error) { return fail(error) }
  },
  async completeOAuthCallback() {
    try {
      const session = await sessionFor(authService.getCurrentUser())
      return session ? ok(session) : fail(new CloudError('unauthenticated', 'OAuth callback has no session'))
    } catch (error) { return fail(error) }
  },
  async signOut() { try { await authService.logout(); return ok(undefined) } catch (error) { return fail(error) } },
  async sendPasswordReset(email) { try { await authService.resetPassword(email); return ok(undefined) } catch (error) { return fail(error) } },
  async updatePassword(password) {
    try {
      const user = authService.getCurrentUser()
      if (!user) return fail(new CloudError('unauthenticated', 'Password recovery session required'))
      await updatePassword(user, password)
      return ok(undefined)
    } catch (error) { return fail(error) }
  },
  onSessionChange(listener): CloudSubscription {
    const unsubscribe = authService.onAuthStateChange(user => { void sessionFor(user).then(listener) })
    return { unsubscribe }
  },
}

const profiles: CloudProfilesApi = {
  async getProfile(userId) {
    try {
      const snapshot = await getDoc(doc(firestore, 'publicProfiles', userId))
      if (!snapshot.exists()) return ok(null)
      const value = snapshot.data()
      return ok({ userId, userTag: String(value.userTag ?? ''), photoUrl: String(value.photoURL ?? ''), updatedAt: timestamp(value.lastUpdatedAt) ?? '' })
    } catch (error) { return fail(error) }
  },
  async getProfileByTag(tag) {
    try {
      const tagSnapshot = await getDoc(doc(firestore, 'userTags', tag))
      if (!tagSnapshot.exists()) return ok(null)
      const userId = String(tagSnapshot.data().uid ?? '')
      return userId ? profiles.getProfile(userId) : ok(null)
    } catch (error) { return fail(error) }
  },
  async provisionProfile(profile) { return profiles.upsertProfile(profile) },
  async upsertProfile(profile) {
    const actor = auth.currentUser
    if (!actor) return fail(new CloudError('unauthenticated', 'Sign in is required to update a profile'))
    if (actor.uid !== profile.userId) {
      return fail(new CloudError('forbidden', 'You may only update your own profile'))
    }
    try {
      const userRef = doc(firestore, 'users', profile.userId)
      const publicProfileRef = doc(firestore, 'publicProfiles', profile.userId)
      const nextTagRef = doc(firestore, 'userTags', profile.userTag)

      await runTransaction(firestore, async transaction => {
        const userSnapshot = await transaction.get(userRef)
        if (!userSnapshot.exists()) throw new CloudError('not-found', 'Private user profile not found')
        const oldTag = typeof userSnapshot.data().userTag === 'string' ? userSnapshot.data().userTag : ''
        const oldTagRef = oldTag && oldTag !== profile.userTag ? doc(firestore, 'userTags', oldTag) : null

        // Read every precondition before queueing any write. Firestore retries
        // this transaction when the reservation changes after this read.
        const nextTagSnapshot = await transaction.get(nextTagRef)
        const oldTagSnapshot = oldTagRef ? await transaction.get(oldTagRef) : null
        if (nextTagSnapshot.exists() && nextTagSnapshot.data().uid !== profile.userId) {
          throw new CloudError('conflict', 'That user tag is already reserved')
        }
        if (!nextTagSnapshot.exists()) {
          transaction.set(nextTagRef, {
            uid: profile.userId, createdAt: profile.updatedAt, lastUpdatedAt: profile.updatedAt,
          })
        }
        transaction.update(userRef, { userTag: profile.userTag, lastUpdatedAt: profile.updatedAt })
        transaction.set(publicProfileRef, {
          uid: profile.userId, userTag: profile.userTag, photoURL: profile.photoUrl, lastUpdatedAt: profile.updatedAt,
        }, { merge: true })
        if (oldTagRef && oldTagSnapshot?.exists() && oldTagSnapshot.data().uid === profile.userId) {
          transaction.delete(oldTagRef)
        }
      })
      const updated = await this.getProfile(profile.userId)
      if (!updated.ok) return updated
      if (!updated.data) return fail(new CloudError('unknown', 'Profile update did not create a public projection'))
      return ok(updated.data)
    } catch (error) { return fail(error) }
  },
  async isTagAvailable(tag) {
    try { return ok(!(await getDoc(doc(firestore, 'userTags', tag))).exists()) } catch (error) { return fail(error) }
  },
}

const publishing: CloudPublishingApi = {
  async getPublication(id) {
    try { const snapshot = await getDoc(doc(firestore, 'publishedNotas', id)); return ok(snapshot.exists() ? publication(snapshot.id, snapshot.data()) : null) } catch (error) { return fail(error) }
  },
  async listPublications(page) {
    try {
      const ownerId = page.ownerOnly ? auth.currentUser?.uid : page.authorId
      if (page.ownerOnly && !ownerId) return fail(new CloudError('unauthenticated', 'Sign in is required to list owned publications'))
      const source = collection(firestore, 'publishedNotas')
      const cursor = page.cursor ? await getDoc(doc(firestore, 'publishedNotas', page.cursor)) : null
      if (page.cursor && !cursor?.exists()) return fail(new CloudError('invalid', 'Unknown publication cursor'))
      const filters = ownerId ? [where('authorId', '==', ownerId)]
        : page.authorTag ? [where('authorTag', '==', page.authorTag)] : []
      const snapshots = await getDocs(cursor
        ? query(source, where('isPublic', '==', true), ...filters, orderBy('publishedAt', 'desc'), startAfter(cursor), limit(page.limit))
        : query(source, where('isPublic', '==', true), ...filters, orderBy('publishedAt', 'desc'), limit(page.limit)))
      const items = snapshots.docs.map(snapshot => publication(snapshot.id, snapshot.data()))
      return ok({ items, nextCursor: items.length === page.limit ? items.at(-1)?.id ?? null : null } satisfies CloudPage<CloudPublication>)
    } catch (error) { return fail(error) }
  },
  async upsertPublication(value) {
    try { await setDoc(doc(firestore, 'publishedNotas', value.id), value, { merge: true }); return ok(value) } catch (error) { return fail(error) }
  },
  async deletePublication(id) {
    try {
      const snapshot = await getDoc(doc(firestore, 'publishedNotas', id))
      if (!snapshot.exists()) return fail(new CloudError('not-found', 'Publication not found'))
      const children = Array.isArray(snapshot.data().publishedSubPages)
        ? snapshot.data().publishedSubPages.map(String) : []
      for (const childId of children) {
        const deleted = await this.deletePublication(childId)
        if (!deleted.ok && deleted.error.code !== 'not-found') return deleted
      }
      await deleteDoc(doc(firestore, 'publishedNotas', id))
      return ok(undefined)
    } catch (error) { return fail(error) }
  },
  subscribeToPublication(id, listener) {
    const unsubscribe = onSnapshot(doc(firestore, 'publishedNotas', id), snapshot => listener(snapshot.exists() ? publication(snapshot.id, snapshot.data()) : null))
    return { unsubscribe }
  },
}

const comments: CloudCommentsApi = {
  async listComments(notaId, page) {
    try {
      if (page.cursor) return fail(new CloudError('invalid', 'Firebase comments do not support cursor pagination yet'))
      const items = (await commentService.getComments(notaId, page.parentId ?? null, page.limit)).map(value => comment(value.id, value as unknown as Record<string, unknown>))
      return ok({ items, nextCursor: null })
    } catch (error) { return fail(error) }
  },
  async createComment(value) {
    const userId = auth.currentUser?.uid
    if (!userId) return fail(new CloudError('unauthenticated', 'Sign in is required to comment'))
    if (typeof value.content !== 'string') return fail(new CloudError('invalid', 'Firebase comments require text content'))
    try {
      const created = await commentService.addComment(
        value.notaId, userId, value.authorName, value.authorTag ?? '', value.content, value.parentId,
      )
      return ok(comment(created.id, created as unknown as Record<string, unknown>))
    } catch (error) { return fail(error) }
  },
  async deleteComment(id) {
    const userId = auth.currentUser?.uid
    if (!userId) return fail(new CloudError('unauthenticated', 'Sign in is required to delete a comment'))
    try { await commentService.deleteComment(id, userId); return ok(undefined) } catch (error) { return fail(error) }
  },
  async updateComment(id, content) {
    const userId = auth.currentUser?.uid
    if (!userId) return fail(new CloudError('unauthenticated', 'Sign in is required to edit a comment'))
    try {
      const reference = doc(firestore, 'comments', id)
      const snapshot = await getDoc(reference)
      if (!snapshot.exists()) return fail(new CloudError('not-found', 'Comment not found'))
      if (snapshot.data().authorId !== userId) return fail(new CloudError('forbidden', 'Only the comment author may edit'))
      await updateDoc(reference, { content, updatedAt: serverTimestamp() })
      const updated = await getDoc(reference)
      return ok(comment(updated.id, updated.data()!))
    } catch (error) { return fail(error) }
  },
  async getVote(commentId) {
    const userId = auth.currentUser?.uid
    if (!userId) return ok(null)
    try { return ok(await commentService.getUserVote(commentId, userId)) } catch (error) { return fail(error) }
  },
  async vote(commentId, vote) {
    const userId = auth.currentUser?.uid
    if (!userId) return fail(new CloudError('unauthenticated', 'Sign in is required to vote'))
    try { return ok(await commentService.voteOnComment(commentId, userId, vote)) } catch (error) { return fail(error) }
  },
}

const statistics: CloudStatisticsApi = {
  async getPublicationStats(notaId) {
    try {
      const snapshot = await getDoc(doc(firestore, 'publishedNotas', notaId))
      if (!snapshot.exists()) return ok(null)
      const value = snapshot.data()
      return ok({ viewCount: Number(value.viewCount ?? 0), uniqueViewers: Number(value.uniqueViewers ?? 0), likeCount: Number(value.likeCount ?? 0), dislikeCount: Number(value.dislikeCount ?? 0), cloneCount: Number(value.cloneCount ?? 0), commentCount: Number(value.commentCount ?? 0), lastViewedAt: timestamp(value.lastViewedAt) })
    } catch (error) { return fail(error) }
  },
  async recordView(notaId, referrer) {
    try {
      const before = await this.getPublicationStats(notaId)
      if (!before.ok) return before
      if (!before.data) return fail(new CloudError('not-found', 'Publication not found'))
      await statisticsService.recordView(notaId, auth.currentUser?.uid, referrer)
      const after = await this.getPublicationStats(notaId)
      if (!after.ok) return after
      if (!after.data) return fail(new CloudError('not-found', 'Publication disappeared while recording a view'))
      if (after.data.viewCount <= before.data.viewCount) {
        return fail(new CloudError('unavailable', 'Firebase did not persist the view'))
      }
      return ok({ viewCount: after.data.viewCount, uniqueViewers: after.data.uniqueViewers })
    } catch (error) { return fail(error) }
  },
  async vote(notaId, vote) {
    const userId = auth.currentUser?.uid
    if (!userId) return fail(new CloudError('unauthenticated', 'Sign in is required to vote'))
    try { return ok(await statisticsService.recordVote(notaId, userId, vote)) } catch (error) { return fail(error) }
  },
  async recordClone(notaId) {
    const userId = auth.currentUser?.uid
    if (!userId) return fail(new CloudError('unauthenticated', 'Sign in is required to clone'))
    try {
      const before = await this.getPublicationStats(notaId)
      if (!before.ok) return before
      if (!before.data) return fail(new CloudError('not-found', 'Publication not found'))
      await statisticsService.recordClone(notaId, userId)
      const after = await this.getPublicationStats(notaId)
      if (!after.ok) return after
      if (!after.data) return fail(new CloudError('not-found', 'Publication disappeared while recording a clone'))
      if (after.data.cloneCount <= before.data.cloneCount) {
        return fail(new CloudError('unavailable', 'Firebase did not persist the clone'))
      }
      return ok(after.data.cloneCount)
    } catch (error) { return fail(error) }
  },
}

const newsletter: CloudNewsletterApi = {
  async subscribe(email, displayName) {
    const userId = auth.currentUser?.uid
    if (!userId) return fail(new CloudError('unauthenticated', 'Sign in is required to subscribe'))
    try { await setDoc(doc(firestore, 'newsletterSubscriptions', userId), { uid: userId, email, displayName: displayName ?? '', subscribedAt: serverTimestamp() }); return ok(undefined) } catch (error) { return fail(error) }
  },
  async unsubscribe() {
    const userId = auth.currentUser?.uid
    if (!userId) return fail(new CloudError('unauthenticated', 'Sign in is required to unsubscribe'))
    try { await deleteDoc(doc(firestore, 'newsletterSubscriptions', userId)); return ok(undefined) } catch (error) { return fail(error) }
  },
}

export const firebaseCompatibilityApi: CloudApi = { auth: authApi, profiles, publishing, comments, statistics, newsletter, analytics }
