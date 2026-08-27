---
id: f-public-base-table-reads-expose-private-migration-identity-and-quarantine-fields
kind: note
note_kind: finding
created: 2026-08-13T22:43:22Z
created_by: a-root
about: "[[t-01KZYG3W31CADGKFQMD86D1VYY]]"
severity: major
---
# Public base-table reads expose private migration identity and quarantine fields
Independent review reproduced anon SELECT of published_notas.legacy_author_uid, content_quarantine_text, source_*_raw, and author_id through whole-table grants/policies in supabase/migrations/20260813000200_rls_and_privileged_mutations.sql:371-378,425-426. Contract requires server-only identity translation and allowlisted public exposure. Replace public base-table reads with restricted invoker views/column grants and pgTAP forbidden-column assertions.
