---
id: t-01KZYG4G41ARV7RGQ7GCZCDPCK
kind: task
created: 2026-08-13T21:23:31Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
depends_on: "[002, 003]"
---
# Migrate authentication, sessions, profiles, and user tags to Supabase
## So that
registration, login, OAuth, profile editing, public profiles, and stable userTag URLs no longer depend on Firebase Auth or Firestore
## Acceptance
- [x] Email/password and Google sign-in, sign-out, password reset, session restore, auth-state updates, and user-facing error mapping use Supabase Auth
- [x] Private profiles, allowlisted public profiles, and unique mutable user tags use Postgres/RLS with collision-safe transactional changes and stable existing public URLs
- [x] Existing Firebase identities have a documented UID/account-linking migration path that prevents duplicate accounts and identifies flows requiring password reset
- [x] Auth and profile integration tests cover owner/other/anonymous reads and writes, tag collisions/renames, OAuth callback, expired sessions, and public-profile lookups
- [x] Firebase Auth is disabled only after reconciliation proves migrated accounts and profile/tag mappings meet the contract thresholds
## Log
- 2026-08-13T23:56:39Z claimed by a-supabase-implementer-fy4j42
- 2026-08-14T00:53:47Z accepted by a-root
- 2026-08-14T00:53:47Z verified by `cd '/Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/supabase-004-migrate-authentication-sessions-profiles-and-user-tags-to-supabase' && npm run test:supabase && npm run supabase:lint && npm run check:firebase-imports && npm run check:auth-deploy-config:self-test && npm run type-check && npm run test:unit -- --run && npm run build-only && git diff --check` (exit 0)
- 2026-08-14T00:53:47Z completed by a-root
