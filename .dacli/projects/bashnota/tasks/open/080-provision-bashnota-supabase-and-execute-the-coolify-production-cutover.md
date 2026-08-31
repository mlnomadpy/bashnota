---
id: t-01M1CQJ2M05DGC76JP630SX758
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 52
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 52
  body_digest: sha256:5473af09d8da55fad4eee80d7606bceee9893920e7ed77897ea31509be796d5a
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Provision BashNota Supabase and execute the Coolify production cutover
## Context
Adopted from GitHub issue #52.

## Objective

Provision the BashNota backend on the Coolify-managed VPS, migrate and validate its schema and functions, deploy the frontend, and complete a reversible production cutover.

## Dependencies

- Blocked by #50 for self-hosted Supabase compatibility.
- Blocked by #51 for the production Docker image.
- Coordinate deployment gating with #6 and PWA behavior with #11.

## Target resources

- Supabase gateway: `https://supabase.apps.tahabouhsine.com`
- BashNota staging: `https://bashnota-staging.apps.tahabouhsine.com`
- BashNota production: `https://bashnota.apps.tahabouhsine.com`

## Required work

- Provision a persistent self-hosted Supabase service through Coolify.
- Expose only the HTTPS API gateway; keep PostgreSQL and internal service ports private.
- Configure `SUPABASE_PUBLIC_URL`, `API_EXTERNAL_URL`, Auth site URL, and allowed redirects for staging and production.
- Configure a production transactional SMTP provider for signup, confirmation, invitation, and password-reset email.
- Generate and securely store Postgres, JWT, dashboard, publishable, and secret credentials in Coolify.
- Apply every repository migration in order and record immutable migration evidence.
- Deploy the `published-images` Edge Function and verify upload, validation, cleanup, and authorization behavior.
- Verify RLS, Auth, REST, Storage, publishing, community interactions, and API-security integration tests.
- Configure encrypted off-host PostgreSQL and Storage backups, retention, monitoring, and a tested restore procedure.
- Record reconciliation evidence and approve the production cutover RPC for the exact public configuration.
- Deploy the frontend to staging, run browser/PWA smoke tests, then promote the same verified revision to production.
- Document rollback for both the frontend image and database migration/cutover state.
- Record CPU, memory, and disk baselines on the shared 4-core, 8 GB VPS and disable unused Supabase components where safe.

## Acceptance criteria

- [ ] Supabase is healthy behind valid TLS and PostgreSQL is not Internet-accessible.
- [ ] Auth emails and approved redirects work for the production domain.
- [ ] All migrations and the `published-images` Edge Function are deployed from version-controlled sources.
- [ ] RLS and backend integration suites pass against the self-hosted stack.
- [ ] Remote database and storage backups complete and a restore drill succeeds.
- [ ] Migration and reconciliation evidence hashes match the production cutover approval.
- [ ] BashNota staging passes login, password reset, storage, publishing, deep-link, and PWA tests.
- [ ] The verified revision is deployed at the production domain.
- [ ] Rollback steps are documented and rehearsed before automatic deployment is enabled.

## Acceptance
- [ ] Supabase is healthy behind valid TLS and PostgreSQL is not Internet-accessible.
- [ ] Auth emails and approved redirects work for the production domain.
- [ ] All migrations and the `published-images` Edge Function are deployed from version-controlled sources.
- [ ] RLS and backend integration suites pass against the self-hosted stack.
- [ ] Remote database and storage backups complete and a restore drill succeeds.
- [ ] Migration and reconciliation evidence hashes match the production cutover approval.
- [ ] BashNota staging passes login, password reset, storage, publishing, deep-link, and PWA tests.
- [ ] The verified revision is deployed at the production domain.
- [ ] Rollback steps are documented and rehearsed before automatic deployment is enabled.
## Log
