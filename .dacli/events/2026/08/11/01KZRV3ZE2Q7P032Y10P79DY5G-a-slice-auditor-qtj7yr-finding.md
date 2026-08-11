---
id: 01KZRV3ZE2Q7P032Y10P79DY5G
kind: event
event_kind: finding
created: 2026-08-11T16:40:01Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
getVoters does N sequential Firestore reads (N+1) and relies on an unbounded votes map — voter list scales poorly and can hit doc limits

statisticsService.getVoters (statisticsService.ts:334-351) iterates every entry in the nota's votes map and awaits a separate getDoc('users', userId) per voter INSIDE the loop — a classic N+1 read pattern, serialized (not Promise.all). Consumed by VotersList.vue:90. Consequence: opening the voters list on a popular nota fires one Firestore read per voter one-after-another, so latency grows linearly with vote count; the UI blocks on the whole chain. Compounding design smell: votes are stored as a single map field on the publishedNotas doc (recordVote writes votes.{userId}, statisticsService.ts:159/179), so a highly-voted nota accumulates an ever-growing map on one document (Firestore 1MB/doc ceiling and write-contention). Note: perf is a cross-cutting seat; filing here because it is intrinsic to this service's data shape.
