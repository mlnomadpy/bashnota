---
id: f-task046-trusted-ip-repair-committed-with-full-green-verification
kind: note
note_kind: finding
created: 2026-08-27T10:00:37Z
created_by: a-supabase-implementer-a3cf9z
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
severity: major
---
# Task046 trusted-IP repair committed with full green verification
Commit e6a9934 on branch dacli/046-enforce-typed-api-authentication-request-bounds-and-rate-limits closes the rotated-XFF bypass at supabase/migrations/20260827000100_api_request_security.sql:109-168 with gateway-owned X-Real-IP parsing and fail-closed validation. The new same-peer poisoning test at supabase/tests/api/api-security.integration.mjs:54-72 failed against the old migration with 200 instead of 429, then passed after reset. Full npm run test:supabase (275 pgTAP plus all integrations), 586 unit tests, type-check, production build, Supabase lint, backend purity, repository hygiene, and git diff --check passed. Branch is intentionally unpushed under owner-only landing policy.
