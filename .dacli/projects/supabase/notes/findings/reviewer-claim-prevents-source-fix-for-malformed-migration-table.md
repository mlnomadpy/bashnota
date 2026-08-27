---
id: f-reviewer-claim-prevents-source-fix-for-malformed-migration-table
kind: note
note_kind: finding
created: 2026-08-13T21:55:54Z
created_by: a-supabase-local-reviewer-fdmcw2
about: "[[001]]"
severity: minor
---
# Reviewer claim prevents source fix for malformed migration table
The local reviewer corrected docs/supabase/firebase-to-supabase-contract.md:43,59, but dacli commit refused because this reviewer owns only .dacli/projects/supabase/notes/**. The edit was fully restored and the worktree is clean; owner or implementer must escape the analytics cell pipe before acceptance.
