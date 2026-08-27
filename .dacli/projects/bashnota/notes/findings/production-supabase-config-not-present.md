---
id: f-production-supabase-config-not-present
kind: note
note_kind: finding
created: 2026-08-26T14:15:11Z
created_by: a-root
about: "[[027]]"
severity: major
---
# production-supabase-config-not-present
gh variable/secret name listings returned no repository-level VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, migration evidence, or reconciliation evidence configuration. Current deploy gate should fail closed, but production cannot deploy until approved public config/evidence variables are set. No secret values were read or logged.
