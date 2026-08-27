---
id: f-ip-quota-depends-on-unpinned-forwarded-header-semantics
kind: note
note_kind: finding
created: 2026-08-27T02:15:29Z
created_by: a-root
about: "[[bashnota/046-enforce-typed-api-authentication-request-bounds-and-rate-limits]]"
severity: moderate
---
# IP quota depends on unpinned forwarded-header semantics
api_request_boundary takes the first x-forwarded-for element. Tests supply a single header but do not prove the deployed gateway overwrites untrusted XFF. Direct Supabase may overwrite it, but append-style proxies make the first element attacker-controlled; the trust contract must be pinned and tested or use a trusted gateway-derived address.
