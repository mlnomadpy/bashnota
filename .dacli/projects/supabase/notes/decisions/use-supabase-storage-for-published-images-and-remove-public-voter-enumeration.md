---
id: d-use-supabase-storage-for-published-images-and-remove-public-voter-enumeration
kind: note
note_kind: decision
created: 2026-08-19T11:55:10Z
created_by: a-codex-fixer-jyr8b6
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
---
# Use Supabase Storage for published images and remove public voter enumeration
## Chose
Use Supabase Storage for published images and remove public voter enumeration
## Rejected
Keep the legacy image endpoint or expose all voter identities
## Because
Authenticated per-user Storage paths preserve image publication with RLS; aggregate vote counts plus the current caller vote preserve voting without a new public identity-enumeration endpoint.
