---
id: f-staging-google-oauth-and-production-rollout-variables-remain-external-gates
kind: note
note_kind: finding
created: 2026-08-14T00:48:37Z
created_by: a-root
about: "[[t-01KZYG4G41ARV7RGQ7GCZCDPCK]]"
severity: major
origin: docs/supabase/auth-identity-migration.md:33
---
# Staging Google OAuth and production rollout variables remain external gates
Local email/password, persisted session, refresh, Mailpit recovery verification, PKCE exchange, password rotation, and Postgres identity/RLS gates are executable and green. The local GoTrue stack has no Google client secret or mock external issuer: it constructs the real authorize URL and then proves GoTrue rejects the unconfigured provider. Full Google callback remains AUTH-02 staging/canary evidence. A read-only gh variable list found no repository Actions variables, so VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be configured before deploy; the new deploy smoke gate intentionally fails until they exist. Supabase production-primary remains disabled by default and additionally needs the C4 build thresholds plus matching restricted DB marker.
