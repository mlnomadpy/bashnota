---
id: 01M10EP0165DJYM95GMVCYE8FZ
kind: event
schema_version: 1
event_kind: finding
created: 2026-08-27T01:52:17Z
created_by: a-verifier-cpcb0h
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
origin: agent
applied: true
checksum: sha256:2bbe73fd7d3421e94cf7f9e76ff69e0cd45946f7e174d208b8f3c0a371e2cdab
---
verdict: refuted — quota-covered public RPCs are volatile, not stable

Counterexample in commit dfa187b: supabase/migrations/20260827000100_api_request_security.sql:212-245 recreates query_publications and query_comments—the POST routes charged at lines 152-155—as VOLATILE public wrappers (lines 224 and 245); record_nota_view is likewise VOLATILE at lines 316-325. The renamed prior implementations are execution-revoked at lines 461-474. Thus PostgREST sees VOLATILE for each quota-covered expensive public route, so the claim supplies no stable quota route whose pre-request INSERT would run in a read-only RPC transaction.
