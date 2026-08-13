import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const projectId = 'bashnota-rules-test'
let testEnv: RulesTestEnvironment

const privateProfile = {
  uid: 'alice',
  email: 'alice@example.test',
  displayName: 'Alice',
  userTag: 'alice_tag',
}

const publishedNota = {
  id: 'nota-1',
  authorId: 'author',
  authorName: 'Author',
  title: 'Rules fixture',
  content: '{}',
  isPublic: true,
  publishedAt: '2026-08-13T00:00:00.000Z',
  updatedAt: '2026-08-13T00:00:00.000Z',
  viewCount: 0,
  uniqueViewers: 0,
  likeCount: 0,
  dislikeCount: 0,
  commentCount: 0,
  cloneCount: 0,
  votes: {},
}

const comment = {
  id: 'comment-1',
  notaId: 'nota-1',
  content: 'hello',
  authorId: 'author',
  authorName: 'Author',
  authorTag: 'author_tag',
  createdAt: '2026-08-13T00:00:00.000Z',
  updatedAt: '2026-08-13T00:00:00.000Z',
  parentId: null,
  likeCount: 0,
  dislikeCount: 0,
  replyCount: 0,
  votes: {},
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(fileURLToPath(new URL('../firestore.rules', import.meta.url)), 'utf8'),
    },
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'users', 'alice'), privateProfile)
    await setDoc(doc(db, 'publicProfiles', 'alice'), {
      uid: 'alice',
      userTag: 'alice_tag',
      photoURL: 'https://example.test/alice.png',
    })
    await setDoc(doc(db, 'publishedNotas', 'nota-1'), publishedNota)
    await setDoc(doc(db, 'comments', 'comment-1'), comment)
    await setDoc(doc(db, 'publishedNotaViewers', 'nota-1'), {
      notaId: 'nota-1',
      viewers: ['bob'],
      lastUpdated: new Date('2026-08-13T00:00:00.000Z'),
    })
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('private and public profiles', () => {
  it('allows only the owner to read a private account document', async () => {
    const ownerDb = testEnv.authenticatedContext('alice').firestore()
    const otherDb = testEnv.authenticatedContext('bob').firestore()
    const anonymousDb = testEnv.unauthenticatedContext().firestore()

    await assertSucceeds(getDoc(doc(ownerDb, 'users', 'alice')))
    await assertFails(getDoc(doc(otherDb, 'users', 'alice')))
    await assertFails(getDoc(doc(anonymousDb, 'users', 'alice')))
  })

  it('allows public reads but rejects private fields in the public projection', async () => {
    const anonymousDb = testEnv.unauthenticatedContext().firestore()
    const ownerDb = testEnv.authenticatedContext('alice').firestore()

    await assertSucceeds(getDoc(doc(anonymousDb, 'publicProfiles', 'alice')))
    await assertFails(
      setDoc(doc(ownerDb, 'publicProfiles', 'alice'), {
        uid: 'alice',
        userTag: 'alice_tag',
        photoURL: 'https://example.test/alice.png',
        email: 'alice@example.test',
      }),
    )
  })
})

describe('identity and counter validation', () => {
  it('rejects forged nota vote identities and accepts an exact own-vote transition', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore()
    const notaRef = doc(aliceDb, 'publishedNotas', 'nota-1')

    await assertFails(
      updateDoc(notaRef, {
        'votes.bob': 'like',
        likeCount: 1,
      }),
    )
    await assertFails(
      setDoc(doc(aliceDb, 'notaVotes', 'nota-1_bob'), {
        notaId: 'nota-1',
        userId: 'bob',
        voteType: 'like',
      }),
    )
    await assertSucceeds(
      updateDoc(notaRef, {
        'votes.alice': 'like',
        likeCount: 1,
      }),
    )
  })

  it('rejects arbitrary published-nota counter deltas', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore()
    const notaRef = doc(aliceDb, 'publishedNotas', 'nota-1')

    await assertFails(updateDoc(notaRef, { commentCount: 100 }))
    await assertFails(
      updateDoc(notaRef, {
        'votes.alice': 'like',
        likeCount: 100,
      }),
    )
    await assertSucceeds(updateDoc(notaRef, { commentCount: 1 }))
  })

  it('rejects forged comment votes and arbitrary comment counts', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore()
    const commentRef = doc(aliceDb, 'comments', 'comment-1')

    await assertFails(
      updateDoc(commentRef, {
        'votes.bob': 'dislike',
        dislikeCount: 1,
      }),
    )
    await assertFails(
      updateDoc(commentRef, {
        'votes.alice': 'like',
        likeCount: 50,
      }),
    )
    await assertFails(updateDoc(commentRef, { replyCount: 50 }))
    await assertSucceeds(
      updateDoc(commentRef, {
        'votes.alice': 'like',
        likeCount: 1,
      }),
    )
  })
})

describe('viewer identity validation', () => {
  it('rejects viewer-array injection and permits adding only the caller UID', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore()
    const viewersRef = doc(aliceDb, 'publishedNotaViewers', 'nota-1')

    await assertFails(
      updateDoc(viewersRef, {
        viewers: arrayUnion('mallory'),
        lastUpdated: serverTimestamp(),
      }),
    )
    await assertSucceeds(
      updateDoc(viewersRef, {
        viewers: arrayUnion('alice'),
        lastUpdated: serverTimestamp(),
      }),
    )
  })

  it('records a unique view atomically without exposing another viewer marker', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore()
    const bobDb = testEnv.authenticatedContext('bob').firestore()
    const viewerRef = doc(aliceDb, 'publishedNotaViewers', 'nota-1', 'viewers', 'alice')
    const batch = writeBatch(aliceDb)

    await assertFails(getDoc(doc(bobDb, 'publishedNotaViewers', 'nota-1', 'viewers', 'alice')))

    batch.set(viewerRef, {
      notaId: 'nota-1',
      userId: 'alice',
      firstViewedAt: serverTimestamp(),
    })
    batch.update(doc(aliceDb, 'publishedNotas', 'nota-1'), {
      viewCount: 1,
      uniqueViewers: 1,
      lastViewedAt: serverTimestamp(),
    })

    await assertSucceeds(batch.commit())
    await assertSucceeds(getDoc(viewerRef))
  })

  it('permits the client comment batch with a one-step nota counter update', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore()
    const batch = writeBatch(aliceDb)

    batch.set(doc(aliceDb, 'comments', 'comment-2'), {
      ...comment,
      id: 'comment-2',
      authorId: 'alice',
      authorName: 'Alice',
      authorTag: 'alice_tag',
    })
    batch.update(doc(aliceDb, 'publishedNotas', 'nota-1'), {
      commentCount: 1,
    })

    await assertSucceeds(batch.commit())
  })
})
