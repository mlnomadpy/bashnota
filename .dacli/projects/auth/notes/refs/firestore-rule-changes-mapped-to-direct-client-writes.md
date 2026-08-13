---
id: r-firestore-rule-changes-mapped-to-direct-client-writes
kind: note
note_kind: ref
created: 2026-08-13T16:27:58Z
created_by: a-root
about: "[[002-tighten-the-firestore-rules-that-over-expose-user-data]]"
origin: src/features/auth/services/auth.ts:93
---
# Firestore rule changes mapped to direct client writes
Private user documents are owner-only because auth.ts:93-109 writes uid/email/displayName/userTag and auth.ts:181-190 reads the signed-in owner's full record. Public profile projection writes are at auth.ts:112-121, auth.ts:156-164, and auth.ts:215-230; its allowlist contains only uid/userTag/photoURL/lastUpdatedAt. UserPublishedView.vue:205-215 uses public userTags only for tag-to-UID lookup and UserPublishedView.vue:630-636 now reads photoURL from publicProfiles. statisticsService.ts:21-63 records bounded viewCount/uniqueViewers changes plus a caller-owned viewer marker; statisticsService.ts:85-198 performs exact caller vote transitions; statisticsService.ts:309-320 now reads voter tags from publicProfiles. commentService.ts:68-101 creates zeroed comment vote/count state and increments comment/reply counts by one; commentService.ts:255-336 changes only the caller's vote with matching +/-1 counters. Rules reject identity changes, invalid vote values, arbitrary deltas, and injected viewer UIDs while accepting these exact client batches.
