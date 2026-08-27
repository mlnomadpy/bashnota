---
id: f-migration-representation-table-had-a-split-analytics-contract-cell
kind: note
note_kind: finding
created: 2026-08-13T21:54:33Z
created_by: a-supabase-local-reviewer-fdmcw2
about: "[[001]]"
severity: minor
---
# Migration representation table had a split analytics contract cell
Confirmed and fixed in docs/supabase/firebase-to-supabase-contract.md:43 and :59: an unescaped pipe made the four-column representation map render as five columns and separated the allowed migration_backend values from their constraint.
