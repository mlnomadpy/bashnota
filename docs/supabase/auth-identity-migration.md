# Supabase authentication and identity migration

This implementation moves BashNota email/password sessions, Google sign-in, sign-out, password recovery, session restoration, public profile lookup, and user-tag mutation behind the provider-neutral `CloudApi`. Browser code receives only the Supabase URL and publishable key. It never receives an admin key, database password, Firebase Admin credential, or Supabase service-role credential.

## Identity and account linking

Firebase and Supabase user IDs are different identity namespaces. The immutable `identity_map(firebase_uid, supabase_user_id)` remains the only authoritative mapping for migrated accounts. A server-side reconciliation job pre-provisions Supabase identities and writes that pair only after all of these checks pass:

1. The Firebase account is enabled and its source provider is recorded.
2. Email ownership is verified by the source provider and by the Supabase recovery or OAuth flow.
3. No existing `identity_map` row already claims either identity.
4. Provider identifiers and normalized verified email agree with the staged reconciliation record.

An email string alone never links accounts. Conflicts are quarantined for manual identity-owner review; the browser cannot resolve them and has no privileged credential. Existing email/password users establish a new Supabase password through the recovery flow because Firebase password hashes are not copied. Google users reauthenticate with Google and return through the explicit PKCE callback route. A user who originally used one provider must authenticate that existing account before a second provider is linked, preventing a duplicate account from being silently merged.

## Profiles and stable tags

`provision_user_profile` creates the private profile, allowlisted public profile, and tag reservation in one transaction. `rename_user_tag` locks the caller's profile and replaces its reservation atomically. Both functions derive the account from `auth.uid()`, use an empty fixed search path, and are executable only by `authenticated`. Direct browser inserts, updates, and deletes on all three tables are revoked. Unique constraints are the final collision authority, so simultaneous requests cannot claim the same case-sensitive tag.

Anonymous and authenticated public lookup uses only `public_profiles(user_id, user_tag, photo_url, updated_at)`. Email, display name, Firebase UID, source timestamps, provider links, and migration metadata remain inaccessible through that projection. Private-profile RLS limits reads to the owner.

## Session and recovery behavior

The Supabase SDK persists and refreshes its own session; application code no longer copies access tokens into `localStorage`. Startup restores the SDK session and subscribes to auth-state changes. An already-expired session is refreshed once and otherwise treated as signed out. Auth errors are normalized to provider-neutral codes and user-safe messages.

Google and recovery redirects are allowlisted in local Supabase configuration. The callback exchanges the one-time code explicitly. Post-login navigation accepts only a single-slash internal path, blocking protocol-relative and external redirects. Recovery establishes a short-lived authenticated session before `updateUser({ password })` changes the password.

## Rollout, reconciliation, and rollback

Firebase Auth remains enabled and its token-verification path remains deployable through checkpoints C0–C4 in the approved [Firebase-to-Supabase migration contract](./firebase-to-supabase-contract.md). It must not be disabled merely because the Supabase UI paths are live.

The identity owner may advance auth traffic only when the signed reconciliation report shows:

- 100% of enabled Firebase accounts have exactly one Supabase identity-map row and zero duplicate provider identities;
- 100% of profiles and case-sensitive tags match canonical hashes, with zero quarantined collision or identity-misbinding cases;
- email login, confirmation, Google callback, recovery, sign-out, session restore, expired-session, owner/other/anonymous RLS, tag rename/collision, and public lookup gates pass;
- seven consecutive canary days meet the contract's zero dead-letter, replication-lag, error-rate, and latency thresholds.

During C4, Supabase is primary but the durable journal and Firebase rollback mirror continue for seven additional green days. Any identity mismatch, duplicate account, authorization bypass, dead letter, or contract rollback trigger returns auth traffic to the versioned Firebase configuration. Firebase Auth and token acceptance are disabled only at C5 after the final reconciliation hashes match and the migration lead, identity owner, data owner, and incident commander sign off.
