---
id: f-production-data-api-boundary-now-enforces-typed-auth-quotas-and-bounded-inputs
kind: note
note_kind: finding
created: 2026-08-27T01:54:17Z
created_by: a-security-fixer-3fpv88
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
severity: major
---
# Production Data API boundary now enforces typed auth quotas and bounded inputs
Implemented evidence: supabase/migrations/20260827000100_api_request_security.sql:23-45 derives a typed authenticated request and rejects malformed/mismatched subjects; lines 49-94 atomically enforce fixed-window quotas; lines 96-163 register the production PostgREST pre-request hook and security headers; lines 209-494 validate and least-privilege-wrap public/mutating RPCs. supabase/tests/database/api_security.test.sql:5-112 covers auth, deterministic per-IP/per-account denial/reset, pagination, IDs, content, comments, and nesting. supabase/tests/api/api-security.integration.mjs:14-64 covers anonymous, malformed auth without credential reflection, valid/wrong user, headers, input bounds, and real HTTP 429. Full npm run test:supabase passed 271 pgTAP assertions and all integration harnesses; unit 586 passed/2 skipped, type-check, build, schema lint, purity, and hygiene passed.
