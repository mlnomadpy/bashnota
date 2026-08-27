---
id: f-case-folded-public-tag-queries-blend-distinct-stable-identities
kind: note
note_kind: finding
created: 2026-08-14T01:25:43Z
created_by: a-root
about: "[[t-01KZYG4W01FYGE10ZF3X9D5CXD]]"
severity: major
---
# Case-folded public tag queries blend distinct stable identities
Contract preserves case-sensitive COLLATE C tags, but query_publications lowercases both sides, merging Alice/alice author pages. Use exact equality and test two case-differing owners.
