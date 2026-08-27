---
id: f-anonymous-api-quota-trusted-client-identity-repair-is-implemented-locally
kind: note
note_kind: finding
created: 2026-08-27T09:54:54Z
created_by: a-supabase-implementer-a3cf9z
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
severity: major
---
# Anonymous API quota trusted client identity repair is implemented locally
supabase/migrations/20260827000100_api_request_security.sql:106-149 now ignores client-controlled X-Forwarded-For for quota identity, requires Kong's single X-Real-IP peer address, and rejects absent/malformed gateway identity; supabase/tests/api/api-security.integration.mjs:55-74 rotates and poisons both forwarding headers from one peer and requires the 31st request to return 429.
