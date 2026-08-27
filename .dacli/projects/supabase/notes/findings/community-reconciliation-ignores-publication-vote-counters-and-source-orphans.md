---
id: f-community-reconciliation-ignores-publication-vote-counters-and-source-orphans
kind: note
note_kind: finding
created: 2026-08-14T09:41:29Z
created_by: a-root
about: "[[t-01KZYG57FETV6T5AGJF939HCCF]]"
severity: major
---
# Community reconciliation ignores publication vote counters and source orphans
Comparator checks publication commentCount only and reads only Supabase orphans. Firebase like/dislike mismatches and Firebase-side orphan reports can still yield ready:true. Compare comment/like/dislike counters and fail on normalized union of source+target orphans; add negative self-tests for each.
