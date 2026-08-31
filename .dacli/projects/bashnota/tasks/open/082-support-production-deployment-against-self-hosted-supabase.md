---
id: t-01M1CQJ2QAHR3H5HKVH75E029T
kind: task
created: 2026-08-31T20:18:20Z
created_by: a-root
owner: a-root
github:
  issue: 50
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 50
  body_digest: sha256:16ad10b725869f2f9dc78d8b73f62a7c54eff7c57b6632cce93dcf5bd0e13a21
  actor: a-root
  imported_at: 2026-08-31T20:18:20Z
---
# Support production deployment against self-hosted Supabase
## Context
Adopted from GitHub issue #50.

## Objective

Make BashNota safely support an explicitly configured self-hosted Supabase HTTPS endpoint in addition to managed `*.supabase.co` projects.

## Problem

`scripts/check-supabase-deploy-config.mjs` currently rejects every remote Supabase URL whose hostname does not end with `.supabase.co`. This blocks the intended production endpoint at `https://supabase.apps.tahabouhsine.com`.

## Required work

- Allow an explicit, valid HTTPS self-hosted Supabase origin without weakening validation to allow remote HTTP.
- Continue rejecting service-role keys, secret keys, malformed publishable keys, credentials embedded in URLs, URL fragments, and unexpected paths.
- Make the allowed production Supabase origin explicit and auditable rather than inferred from an unrestricted wildcard.
- Preserve local-development support only behind `SUPABASE_DEPLOY_GATE_ALLOW_HTTP_LOCAL=true`.
- Add unit tests for managed Supabase, the approved self-hosted origin, hostile lookalike hosts, HTTP endpoints, embedded credentials, and secret-key leakage.
- Verify `verifyProductionCutover` against the self-hosted REST/RPC gateway.
- Document the browser-safe variables required for a self-hosted deployment.
- Confirm Auth, REST, Storage, and Edge Function URLs work through the same public gateway.

## Acceptance criteria

- [ ] The deployment gate accepts `https://supabase.apps.tahabouhsine.com` when it is explicitly configured.
- [ ] The gate still fails closed for insecure, malformed, or unapproved endpoints.
- [ ] Only a browser-safe Supabase publishable key can reach the frontend bundle.
- [ ] Unit and integration tests cover managed and self-hosted configurations.
- [ ] The production cutover RPC succeeds against the approved self-hosted endpoint.
- [ ] Deployment documentation includes the required environment variables and trust assumptions.

## Acceptance
- [ ] The deployment gate accepts `https://supabase.apps.tahabouhsine.com` when it is explicitly configured.
- [ ] The gate still fails closed for insecure, malformed, or unapproved endpoints.
- [ ] Only a browser-safe Supabase publishable key can reach the frontend bundle.
- [ ] Unit and integration tests cover managed and self-hosted configurations.
- [ ] The production cutover RPC succeeds against the approved self-hosted endpoint.
- [ ] Deployment documentation includes the required environment variables and trust assumptions.
## Log
