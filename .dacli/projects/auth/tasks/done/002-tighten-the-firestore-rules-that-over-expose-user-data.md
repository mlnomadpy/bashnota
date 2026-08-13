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
- [x] `/users/{userId}` reads require `request.auth.uid == userId`; public `userTag` and `photoURL` reads use a public-profile document whose allowed keys exclude `email` and private account fields
- [x] Non-author writes to `publishedNotas`, `publishedNotaViewers`, `notaVotes`, and comment vote/count fields validate identity, immutable identifiers, allowed vote values, and bounded counter changes so one request cannot forge another user's vote or arbitrary counts
- [x] Rule changes are justified against the direct client call sites in `src/features/auth/services/auth.ts`, `src/features/bashhub/views/UserPublishedView.vue`, `src/features/bashhub/services/statisticsService.ts`, and `src/features/nota/services/commentService.ts`, with file:line citations in the task log
- [x] Firebase emulator rule tests cover owner/private profile reads, public-profile reads, forged vote identities, arbitrary counter deltas, and viewer-array injection; `npx vite build` and `npx vitest run` remain green
## Log
- 2026-08-13T14:26:57Z claimed by a-security-fixer-9gxkkf
- 2026-08-13T16:54:30Z accepted by a-root
- 2026-08-13T16:54:30Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/auth-002-tighten-the-firestore-rules-that-over-expose-user-data && npm run test:rules && npm run type-check && npx vitest run && npx vite build` (exit 0)
- 2026-08-13T16:54:30Z deliverable: dacli/002-tighten-the-firestore-rules-that-over-expose-user-data exists but is NOT in master — closed anyway
- 2026-08-13T16:54:30Z completed by a-root
