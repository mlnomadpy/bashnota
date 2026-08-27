---
id: f-verdict-refuted-lost-response-reconciliation-accepts-stale-author-metadata-as-a
kind: note
note_kind: finding
created: 2026-08-27T01:04:13Z
created_by: a-verifier-najx4b
about: "[[t-01M0N6FGNKSD2ESRHJ27A8670Y]]"
source_event: 01M0ZA7N0EG25CJRDMR3SYN8G2
---
# verdict: refuted — lost-response reconciliation accepts stale author metadata as a successful commit
Counterexample at HEAD 91038c6: an already-published hierarchy has the same title/content/parent/tags/citations/ordered children but author_name='Old'; the signed-in user's displayName is now 'New', so publishNotaHierarchy includes authorName='New' in the requested write (src/features/nota/stores/nota.ts:1498-1509), and the RPC is specified to update author_name (supabase/migrations/20260826000100_atomic_publication_hierarchies.sql:97-115). If the RPC returns CloudError('unavailable') before executing, getPublication reads the stale rows, yet publicationMatchesWrite compares title/content/hierarchy fields and omits authorName (src/features/nota/stores/nota.ts:50-58). The loop therefore counts every stale row as reconciled and reports local publish success (src/features/nota/stores/nota.ts:1520-1536,1546-1564) even though the requested author metadata was never committed. Thus the ambiguous completion is not soundly reconciled.
