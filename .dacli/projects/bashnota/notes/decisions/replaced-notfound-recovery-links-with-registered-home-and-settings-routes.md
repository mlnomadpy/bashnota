---
id: d-replaced-notfound-recovery-links-with-registered-home-and-settings-routes
kind: note
note_kind: decision
created: 2026-08-26T23:00:33Z
created_by: a-root
origin: src/features/nota/components/NotFound.vue
---
# Replaced NotFound recovery links with registered home and settings routes; mounted router coverage resolves each rendered action outside the catch-all.
## Chose
Replaced NotFound recovery links with registered home and settings routes; mounted router coverage resolves each rendered action outside the catch-all.
## Rejected
Keeping the stale /docs, /help, and /contact RouterLinks
## Because
None are registered router destinations.
