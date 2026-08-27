---
id: f-stable-postgrest-rpcs-make-pre-request-quota-writes-read-only
kind: note
note_kind: finding
created: 2026-08-27T01:32:17Z
created_by: a-security-fixer-3fpv88
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
severity: moderate
trust: refuted
---
# Stable PostgREST RPCs make pre-request quota writes read-only
The real API integration initially returned SQLSTATE 25006 because PostgREST executes STABLE RPC wrappers in a read-only transaction, so api_request_boundary could not increment private.api_rate_limits. supabase/migrations/20260827000100_api_request_security.sql:209-252 now marks only the public bounded query wrappers VOLATILE while delegating result reads to the renamed stable implementations; HTTP quota denial then returns 429 deterministically.
