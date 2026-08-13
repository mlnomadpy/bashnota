---
id: r-second-security-re-review-repair
kind: note
note_kind: ref
created: 2026-08-13T16:50:44Z
created_by: a-root
about: "[[002-tighten-the-firestore-rules-that-over-expose-user-data]]"
origin: second-independent-review/86920c5
---
# Second security re-review repair
Closed all three follow-up findings. The stats envelope now constrains the enclosing stats map diff to dailyViews/weeklyViews/monthlyViews before validating each exact nested +1 transition (firestore.rules:49). The unique no-change branch now requires the caller viewer-marker existence state to be identical before/after, while false-to-true marker creation remains coupled to uniqueViewers +1 (firestore.rules:161). Emulator regressions reject unrelated stats sibling smuggling and marker creation with unchanged unique count (firestore-tests/firestore.rules.test.ts:269 and :290). normalizeReferrer now sanitizes and truncates parsed URL hostnames and plain referrers through the same <=50-character path (src/features/bashhub/services/statisticsService.ts:450), covered by a long valid hostname test (src/features/bashhub/services/__tests__/statisticsService.test.ts:222).
