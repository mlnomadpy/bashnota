---
id: d-task007-keeps-firebase-authoritative-and-retains-inert-identity-translations-on
kind: note
note_kind: decision
created: 2026-08-14T13:25:05Z
created_by: a-root
about: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
---
# Task007 keeps Firebase authoritative and retains inert identity translations on rollback
## Chose
Migration007 never changes auth, publishing, or community rollout versions. Logical rollback removes domain rows in reverse dependency order but retains verified Auth accounts, immutable UID translations, restricted journals, and audit chains so a byte-identical restore remains possible. Production cutover stays false and belongs to task008.
## Rejected
Delete Supabase Auth accounts and identity translations during logical rollback
## Because
Deletion breaks stable account mapping, prevents exact resume, and is unnecessary while Firebase rollout gates keep retained identities inert.
