---
id: d-reconstructed-intent-of-the-bashhub-slice
kind: note
note_kind: decision
created: 2026-08-11T16:40:31Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
---
# Reconstructed intent of the bashhub slice
## Chose
Reconstructed intent of the bashhub slice
## Rejected
Leaving intent implicit
## Because
INTENT: bashhub is the app's 'community + landing' surface, distinct from the local editor. It owns three things: (1) the HOME/landing view a user sees at '/' — a marketing hero (HomeHeader) plus their own local nota list (HomeNotaList) and, when filesystem storage is enabled, filesystem-discovered notas (useFilesystemNotas); (2) PUBLIC PROFILE / portfolio pages at /@:userTag and /u/:userId (UserPublishedView) showing a user's published notas with GitHub-style activity heatmap, aggregate stats, and CSV export; (3) statisticsService, the shared engagement backend (views, unique viewers, referrers, likes/dislikes, clones) that the nota slice calls when rendering public notas. The idea was a lightweight social layer bolted onto a local-first notebook: your notes are yours and local, but you can publish, and published notes get a public portfolio and engagement metrics. The slice is thin because it delegates all list/filter/import logic to the nota slice (useNotaList, useNotaActions, useNotaImport) — bashhub is mostly composition + Firestore stats. The gap between intent and code: rich per-view analytics were designed (daily/weekly/monthly buckets, referrer tracking, getUserNotasStatistics as a Cloud Function) but never surfaced in any UI, and the READMEs describe a much larger analytics/recommendations dashboard that was never built.
