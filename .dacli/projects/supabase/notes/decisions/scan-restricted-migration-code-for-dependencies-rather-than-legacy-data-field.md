---
id: d-scan-restricted-migration-code-for-dependencies-rather-than-legacy-data-field
kind: note
note_kind: decision
created: 2026-08-19T12:43:34Z
created_by: a-codex-fixer-1a6ne8
about: "[[014]]"
---
# Scan restricted migration code for dependencies rather than legacy data-field names
## Chose
Scan restricted migration code for dependencies rather than legacy data-field names
## Rejected
Apply the browser runtime keyword ban to offline migration adapters and existing database legacy columns
## Because
The exhaustive runtime scan must reject every retired SDK/tool/config reference, while the offline adapter must legitimately translate immutable legacy_uid database columns. A dedicated scanner rejects imports, Admin packages, and CLI commands without treating inert JSON/SQL field names as runtime dependencies.
