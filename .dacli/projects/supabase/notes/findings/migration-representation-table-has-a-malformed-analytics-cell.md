---
id: f-migration-representation-table-has-a-malformed-analytics-cell
kind: note
note_kind: finding
created: 2026-08-13T21:57:28Z
created_by: a-codex-fixer-terra-h2p4hk
about: "[[001]]"
severity: minor
---
# Migration representation table has a malformed analytics cell
Confirmed in this worktree: docs/supabase/firebase-to-supabase-contract.md:43-60 declares three columns but line 44 has four separators and line 59 contains an unescaped pipe, splitting the analytics cell. This prevents reliable Markdown rendering.
