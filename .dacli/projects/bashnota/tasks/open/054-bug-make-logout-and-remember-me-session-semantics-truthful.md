---
id: t-01M1CQJ1687M62030YH7V1SJM3
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 87
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 87
  body_digest: sha256:4cd52d71b1c6dc694e9a7e46d7272228ef862b0089a4507bbb92fc447693d381
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: make logout and Remember me session semantics truthful
## Context
Adopted from GitHub issue #87.

## Confirmed defects

Profile ignores the boolean result of authStore.logout and always routes home. If Supabase sign-out fails, the user remains authenticated with no error. The Remember me checkbox only controls whether the email is saved; Supabase session persistence remains enabled for every login, so an unchecked session still survives browser restart.

## Evidence

- Logout failure converted to false: src/features/auth/stores/auth.ts:162-176.
- Result ignored and unconditional navigation: src/features/auth/views/ProfileView.vue:67-74.
- Remember-me implementation: src/features/auth/views/LoginView.vue:27,70-76,128-138,216-223.
- Supabase client always persists sessions: src/services/cloud/supabaseBrowser.ts:32-38.

## Acceptance criteria

- Failed sign-out keeps the user in place and shows a retryable error.
- Remember me either genuinely controls durable session persistence or is relabeled to Save email.
- Add local Supabase browser tests for checked/unchecked restart behavior and forced sign-out failure.
- Guard async auth/profile hydration against stale results restoring a signed-out client.

## Acceptance
- [ ] Failed sign-out keeps the user in place and shows a retryable error.
- [ ] Remember me either genuinely controls durable session persistence or is relabeled to Save email.
- [ ] Add local Supabase browser tests for checked/unchecked restart behavior and forced sign-out failure.
- [ ] Guard async auth/profile hydration against stale results restoring a signed-out client.
## Log
