---
id: f-shared-local-supabase-volume-blocks-clean-migration-reset-verification
kind: note
note_kind: finding
created: 2026-08-27T01:32:19Z
created_by: a-supabase-implementer-66yyfy
about: "[[t-01M10BZYS4VYEQJ5C7BVE438XZ]]"
severity: moderate
---
# Shared local Supabase volume blocks clean migration reset verification
Running npx --yes supabase@2.114.0 db reset from the isolated task worktree failed at supabase/migrations/20260813000100_create_bashnota_schema.sql:2 because public.vote_type already exists before the first project migration. Stopping the shared stack was avoided because sibling runs may use it; SQL pgTAP lifecycle coverage is added but requires a clean stack/CI to execute.
