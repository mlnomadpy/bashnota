---
id: f-schema-drifts-from-accepted-citation-and-subpage-ordering-contract
kind: note
note_kind: finding
created: 2026-08-13T22:43:22Z
created_by: a-root
about: "[[t-01KZYG3W31CADGKFQMD86D1VYY]]"
severity: moderate
---
# Schema drifts from accepted citation and subpage ordering contract
Schema migration lines 55-58 uses citations and published_sub_pages arrays instead of contract representations published_nota_citations order-preserving JSON and published_nota_edges(parent_id, child_id, ordinal) at docs/supabase/firebase-to-supabase-contract.md:50-51. Implement contract representation, constraints, generated types, and tests or explicitly supersede contract before acceptance.
