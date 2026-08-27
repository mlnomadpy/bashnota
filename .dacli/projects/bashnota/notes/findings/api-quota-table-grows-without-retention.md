---
id: f-api-quota-table-grows-without-retention
kind: note
note_kind: finding
created: 2026-08-27T02:15:29Z
created_by: a-root
about: "[[bashnota/046-enforce-typed-api-authentication-request-bounds-and-rate-limits]]"
severity: major
---
# API quota table grows without retention
Migration dfa187b inserts one private.api_rate_limits row per scope/subject/route/window and defines no production pruning or retention. Tests reset with DELETE only. Long-lived traffic causes unbounded table and WAL growth.
