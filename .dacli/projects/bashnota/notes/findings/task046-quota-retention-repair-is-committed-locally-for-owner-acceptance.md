---
id: f-task046-quota-retention-repair-is-committed-locally-for-owner-acceptance
kind: note
note_kind: finding
created: 2026-08-27T09:50:27Z
created_by: a-supabase-implementer-ddxqrq
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
severity: major
---
# Task046 quota-retention repair is committed locally for owner acceptance
Commit 08613e3 on branch dacli/046-enforce-typed-api-authentication-request-bounds-and-rate-limits adds an indexed one-hour retention cutoff at supabase/migrations/20260827000100_api_request_security.sql:16-17,69-72 and deterministic expired/current-bucket coverage at supabase/tests/database/api_security.test.sql:54-66. Removing the cleanup caused assertions 11-12 to fail; restored full Supabase, 586-unit-test, type-check/build, backend purity, repository hygiene, and database lint gates all passed. Branch is intentionally unpushed and one commit ahead of origin under owner-only landing policy.
