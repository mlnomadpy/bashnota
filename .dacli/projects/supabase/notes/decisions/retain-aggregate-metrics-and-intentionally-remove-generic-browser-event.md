---
id: d-retain-aggregate-metrics-and-intentionally-remove-generic-browser-event
kind: note
note_kind: decision
created: 2026-08-19T11:55:10Z
created_by: a-codex-fixer-jyr8b6
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
---
# Retain aggregate metrics and intentionally remove generic browser event analytics
## Chose
Retain aggregate metrics and intentionally remove generic browser event analytics
## Rejected
Add a generic event warehouse during backend removal
## Because
Views, unique viewers, referrers, votes, clones, and counts already use Supabase RPCs; no feature consumes generic events, so a tested no-op avoids unrequired behavioral-data collection.
