---
id: 01M10EZYBM9F7Z5TBZAD84YRE5
kind: event
schema_version: 1
event_kind: finding
created: 2026-08-27T01:57:43Z
created_by: a-verifier-34xegr
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
origin: agent
applied: true
checksum: sha256:cbd2d26690bbd3cce19140b20119544fcf2b0324a6a358f6d1fdfb4ab3bfd0db
---
verdict: confirmed — quota-covered route names resolve to VOLATILE functions

The quota route sets are enumerated at supabase/migrations/20260827000100_api_request_security.sql:109-117. The prior STABLE query functions are renamed behind new public query_publications/query_comments wrappers that explicitly declare VOLATILE at :210-245; record_nota_view is explicitly VOLATILE at :316-327; and the recreated mutating wrappers explicitly declare VOLATILE throughout :258-446. The only quota-listed RPC not recreated there, unsubscribe_newsletter, is declared LANGUAGE plpgsql without a STABLE/IMMUTABLE modifier at supabase/migrations/20260813000600_community_interactions.sql:308-316, so PostgreSQL's default is VOLATILE. I found no quota-covered public route retaining STABLE volatility.
