---
id: d-serialize-supabase-repair-runs-on-the-shared-docker-stack
kind: note
note_kind: decision
created: 2026-08-27T09:44:20Z
created_by: a-root
about: "[[bashnota/047-validate-uploaded-image-bytes-and-complete-the-image-lifecycle]]"
---
# Serialize Supabase repair runs on the shared Docker stack
## Chose
Serialize Supabase repair runs on the shared Docker stack
## Rejected
Run task046 and task047 Supabase resets concurrently
## Because
Both isolated worktrees target the same local Supabase Docker project and schema cache; concurrent reset/integration would invalidate evidence and can create false failures.
