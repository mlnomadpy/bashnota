---
id: f-auth-cutover-lacks-executable-reconciliation-gate-and-truthful-oauth-recovery
kind: note
note_kind: finding
created: 2026-08-14T00:30:17Z
created_by: a-root
about: "[[t-01KZYG4G41ARV7RGQ7GCZCDPCK]]"
severity: major
---
# Auth cutover lacks executable reconciliation gate and truthful OAuth recovery expiry integration
Supabase auth activates unconditionally before task 007 identity/profile reconciliation, allowing existing Firebase users to fail or create duplicate identities/tags. Recovery test does not exchange recovery callback; Google and expired sessions are mocked only. Add versioned rollout gate/fallback tied to reconciliation and executable migrated-account, OAuth callback, recovery exchange, and expiry gates.
