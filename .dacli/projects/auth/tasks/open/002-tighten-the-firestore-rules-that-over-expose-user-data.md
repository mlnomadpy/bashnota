---
id: t-01KZRV1AD380Z06CZ04FR8QTPF
kind: task
created: 2026-08-11T16:38:34Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Tighten the Firestore rules that over-expose user data
## Acceptance
- [ ] `/users/{userId}` reads require `request.auth.uid == userId`; public `userTag` and `photoURL` reads use a public-profile document whose allowed keys exclude `email` and private account fields
- [ ] Non-author writes to `publishedNotas`, `publishedNotaViewers`, `notaVotes`, and comment vote/count fields validate identity, immutable identifiers, allowed vote values, and bounded counter changes so one request cannot forge another user's vote or arbitrary counts
- [ ] Rule changes are justified against the direct client call sites in `src/features/auth/services/auth.ts`, `src/features/bashhub/views/UserPublishedView.vue`, `src/features/bashhub/services/statisticsService.ts`, and `src/features/nota/services/commentService.ts`, with file:line citations in the task log
- [ ] Firebase emulator rule tests cover owner/private profile reads, public-profile reads, forged vote identities, arbitrary counter deltas, and viewer-array injection; `npx vite build` and `npx vitest run` remain green
## Log
- 2026-08-13T14:26:57Z claimed by a-security-fixer-9gxkkf
