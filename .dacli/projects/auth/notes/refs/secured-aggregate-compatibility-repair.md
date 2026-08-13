---
id: r-secured-aggregate-compatibility-repair
kind: note
note_kind: ref
created: 2026-08-13T16:45:57Z
created_by: a-root
about: "[[002-tighten-the-firestore-rules-that-over-expose-user-data]]"
origin: independent-review/335293e
---
# Secured aggregate compatibility repair
Restored recordView compatibility without reopening count forgery. The client atomically increments viewCount plus stats.dailyViews, stats.weeklyViews, stats.monthlyViews, and a normalized referrer key using literal Firestore FieldPath segments (src/features/bashhub/services/statisticsService.ts:17). It supplies last-view bucket metadata so rules can bind each nested-map transition to exactly one selected key. Rules require an exact +1 transition for only that key in every aggregate map, an exact request.time timestamp, constrained bucket/referrer formats, and retain uniqueViewers coupling to creation of the caller-owned viewer marker (firestore.rules:44 and firestore.rules:137). Emulator coverage proves the valid client-shaped aggregate/viewer batch succeeds and a literal FieldPath daily +100 forgery fails (firestore-tests/firestore.rules.test.ts:216 and :248). Unit compatibility coverage proves recordView emits daily, weekly, monthly, and literal dotted-domain referrer updates (src/features/bashhub/services/__tests__/statisticsService.test.ts:53).
