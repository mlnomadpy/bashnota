---
id: t-01M10BZYP58YET7T0SEWJP0GZ8
kind: task
created: 2026-08-27T01:05:18Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
parent: "[[t-01M0F8AY2FNV61M44CWRKB91KX]]"
github:
  issue: 35
  repo: mlnomadpy/bashnota
---
# Enforce typed API authentication, request bounds, and rate limits
## So that
public and mutating backend routes reject abusive or malformed traffic before database work
## Acceptance
- [x] Production middleware sets the documented security headers and rejects malformed authentication through one typed authenticated-request boundary
- [x] Per-IP and per-account limits cover expensive and mutating routes with deterministic denial and reset tests
- [x] IDs, content and comment lengths, nesting, pagination limits, and sortable fields are validated before database access
- [x] Backend integration tests cover anonymous, wrong-user, valid-user, rate-limit, and input-bound cases without logging credentials
## Log
- 2026-08-27T01:08:13Z claimed by a-security-fixer-h89nzp
- 2026-08-27T01:08:56Z claimed by a-security-fixer-3fpv88
- 2026-08-27T02:08:29Z finding by a-verifier-cpcb0h: verdict: refuted — quota-covered public RPCs are volatile, not stable (event 01M10EP0165DJYM95GMVCYE8FZ)
- 2026-08-27T02:08:29Z a-verifier-cpcb0h: verify-verdict: refuted — codex-ro (a-verifier-cpcb0h) on claim: Stable PostgREST RPCs make pre-request quota writes read-only — quota-covered public rpcs are volatile, not stable (event 01M10EP64HPQRDQQ0TB7G6QVEW)
- 2026-08-27T02:08:29Z a-verifier-tg7k2x: verify-verdict: no-verdict — claude-ro (a-verifier-tg7k2x) on claim: Stable PostgREST RPCs make pre-request quota writes read-only — panelist reported nothing — counts as unconfirmed (event 01M10EP7AQFK3VYP7AKFQA9178)
- 2026-08-27T02:08:29Z finding by a-verifier-34xegr: verdict: confirmed — quota-covered route names resolve to VOLATILE functions (event 01M10EZYBM9F7Z5TBZAD84YRE5)
- 2026-08-27T02:08:29Z a-verifier-34xegr: verify-verdict: confirmed — codex-ro (a-verifier-34xegr) on claim: verdict: refuted — quota-covered public RPCs are volatile, not stable — quota-covered route names resolve to volatile functions (event 01M10F01KV2JAYAGDY475AE8Z4)
- 2026-08-27T02:08:29Z a-verifier-vkdj6a: verify-verdict: no-verdict — claude-ro (a-verifier-vkdj6a) on claim: verdict: refuted — quota-covered public RPCs are volatile, not stable — panelist reported nothing — counts as unconfirmed (event 01M10F02G8FEQ2H993TDP2Q58Q)
- 2026-08-27T02:08:29Z a-security-fixer-3fpv88: PR opened: https://github.com/mlnomadpy/bashnota/pull/38 (event 01M10F35P9YXN4M4SRAF07TF8M)
- 2026-08-27T09:42:34Z claimed by a-supabase-implementer-ddxqrq
- 2026-08-27T09:51:25Z claimed by a-supabase-implementer-a3cf9z
- 2026-08-27T10:52:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/39 (event 01M11C0BGFE0CJ98XQBX89TA3M)
- 2026-08-27T13:08:26Z accepted by a-root
- 2026-08-27T13:08:26Z verified by `npm run test:supabase:api-security` (exit 0) in branch master at b784b16 — proves that tree builds, not that the work is in trunk
- 2026-08-27T13:08:26Z deliverable: dacli/046-enforce-typed-api-authentication-request-bounds-and-rate-limits is merged into master
- 2026-08-27T13:08:26Z completed by a-root
- 2026-08-27T22:28:19Z a-root: Landing policy override: mode=pr base=master (event 01M11M1RFFESN11TA6F5BBPA35)
- 2026-08-27T22:28:19Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/39 at merge commit 010c2a62082859a8ec87bb55e2ea373e219b10e2 into master (event 01M11M218SGGJHQ48T9JRAR0T7)
## Verification Evidence
{"command":"npm run test:supabase:api-security","exit_code":0,"duration_ms":393,"artifact_hash":"sha256:1413f2c6e207bbde9d3ae50f427d8778542dc7495aab34419a2f1c59d44503b5","verifier":"a-root","branch":"master","commit_sha":"b784b16ffce33f4c733cc90b4c9089332cd62fb6"}
