---
id: d-prune-expired-quota-buckets-during-successful-quota-consumption
kind: note
note_kind: decision
created: 2026-08-27T09:44:10Z
created_by: a-supabase-implementer-ddxqrq
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
---
# Prune expired quota buckets during successful quota consumption
## Chose
Prune expired quota buckets during successful quota consumption
## Rejected
Depend on an external cron scheduler or retain every fixed-window bucket forever
## Because
The Data API boundary must remain self-contained on every supported Supabase deployment; an indexed one-hour retention cutoff bounds storage without requiring optional production scheduling
