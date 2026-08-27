---
id: d-use-one-final-export-body-allowlist-plus-context-safe-construction-at-earlier
kind: note
note_kind: decision
created: 2026-08-19T14:46:16Z
created_by: a-security-fixer-mg37fd
about: "[[019]]"
---
# Use one final export-body allowlist plus context-safe construction at earlier sinks
## Chose
Use one final export-body allowlist plus context-safe construction at earlier sinks
## Rejected
Rely only on escaping each known interpolation or sanitize each block independently
## Because
The exporter has many current and future block transforms. Context-safe DOM construction removes the known sinks, while one final private DOMPurify instance with URL and class hooks provides a fail-closed trust boundary for raw editor HTML and future transforms.
