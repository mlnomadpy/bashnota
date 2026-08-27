---
id: d-use-one-strict-table-explicit-versioned-json-archive-restored-in-a-single-dexie
kind: note
note_kind: decision
created: 2026-08-19T14:47:21Z
created_by: a-codex-fixer-2w4cvm
about: "[[014]]"
---
# Use one strict table-explicit versioned JSON archive restored in a single Dexie transaction
## Chose
Use one strict table-explicit versioned JSON archive restored in a single Dexie transaction
## Rejected
Reuse the legacy metadata array export and reconstruct normalized blocks from TipTap content during import
## Because
Reconstruction is lossy and cannot preserve all 22 typed payloads, composite canonical order, or stored version snapshots; table-explicit rows permit complete preflight reference validation and atomic rollback.
