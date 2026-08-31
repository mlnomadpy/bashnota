---
id: t-01M1CQJ14J4WNTG3E279ANMEVT
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 88
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 88
  body_digest: sha256:4bdc8d077ceef266fb659aad38435f18a38ef6b9ac8615016addb6046c96f7c9
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: hydrate and refresh public votes and comment counts correctly
## Context
Adopted from GitHub issue #88.

## Confirmed defects

- Reloading a public nota resets the signed-in user's vote to neutral even when a vote exists; clicking the advertised Upvote can actually remove it.
- Comments header reports loaded top-level rows (initially at most 20), not the true total.
- CommentItem copies vote/reply counts from props once and has no watcher, so Refresh and reply deletion leave keyed children stale.

## Evidence

- Public vote reset: src/features/nota/views/PublicNotaView.vue:411-460.
- Loaded-page comment count: src/features/nota/components/CommentSection.vue:19-23,52-98,131-138.
- Stale child refs: src/features/nota/components/CommentItem.vue:36-52,103-115; keyed reuse at CommentSection.vue:203-211.

## Acceptance criteria

- Load the authenticated user's current vote with aggregate stats.
- Return/render an authoritative total comment count with clearly defined reply semantics.
- Prop changes refresh child counts/vote state; reply deletion decrements immediately.
- Add two-session refresh, reload-vote, pagination-total, and reply-delete tests.

## Acceptance
- [ ] Load the authenticated user's current vote with aggregate stats.
- [ ] Return/render an authoritative total comment count with clearly defined reply semantics.
- [ ] Prop changes refresh child counts/vote state; reply deletion decrements immediately.
- [ ] Add two-session refresh, reload-vote, pagination-total, and reply-delete tests.
## Log
