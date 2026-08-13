/** Provider-neutral values exposed to product code. */
export type CloudTimestamp = string
export type CloudJson = string | number | boolean | null | { [key: string]: CloudJson } | CloudJson[]
export type VoteKind = 'like' | 'dislike'

export interface CloudUser {
  id: string
  email: string | null
  displayName: string | null
  photoUrl: string | null
  emailVerified: boolean
  createdAt: CloudTimestamp | null
  lastSignInAt: CloudTimestamp | null
}

export interface CloudSession {
  user: CloudUser
  accessToken: string | null
  expiresAt: CloudTimestamp | null
}

export interface CloudProfile {
  userId: string
  userTag: string
  photoUrl: string
  updatedAt: CloudTimestamp
}

export interface CloudPublication {
  id: string
  authorId: string
  title: string
  content: CloudJson | null
  authorName: string
  isPublic: boolean
  isSubPage: boolean
  parentId: string | null
  tags: string[]
  citations: CloudJson[]
  publishedAt: CloudTimestamp
  updatedAt: CloudTimestamp
}

export interface CloudComment {
  id: string
  notaId: string
  authorId: string
  authorName: string
  authorTag: string | null
  content: CloudJson
  parentId: string | null
  createdAt: CloudTimestamp
  updatedAt: CloudTimestamp
}

export interface CloudVoteResult {
  likeCount: number
  dislikeCount: number
  userVote: VoteKind | null
}

export interface CloudPublicationStats {
  viewCount: number
  uniqueViewers: number
  likeCount: number
  dislikeCount: number
  cloneCount: number
  commentCount: number
  lastViewedAt: CloudTimestamp | null
}

export interface CloudPage<T> {
  items: T[]
  nextCursor: string | null
}

export interface CloudPageRequest {
  limit: number
  cursor?: string | null
}

export interface CloudSubscription {
  unsubscribe(): void
}

export type CloudResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CloudError }

/** Stable errors callers may branch on, independent of any backend SDK. */
export class CloudError extends Error {
  constructor(
    public readonly code: 'unauthenticated' | 'forbidden' | 'not-found' | 'conflict' | 'invalid' | 'unavailable' | 'unknown',
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'CloudError'
  }
}

export const cloudNow = (): CloudTimestamp => new Date().toISOString()
