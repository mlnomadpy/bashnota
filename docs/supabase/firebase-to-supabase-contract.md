# Firebase-to-Supabase migration contract

Status: proposed and binding for migration implementation  
Owner: platform migration lead  
Reviewed inventory date: 2026-08-13

This contract must be approved and its pre-cutover verification gate must pass before production data is exported or mutated. Firebase remains authoritative until the cutover checkpoint is signed off. The machine-readable source inventory is [`firebase-inventory.json`](./firebase-inventory.json), and the executable gate catalog is [`firebase-to-supabase-verification.json`](./firebase-to-supabase-verification.json).

## Non-negotiable invariants

1. No acknowledged write is lost. Every mutation during a dual-write phase has one immutable operation ID, a source commit watermark, and a terminal result for both stores.
2. Firebase is the source of truth through checkpoint C2. Supabase becomes the source of truth only at C3 after the write freeze, final delta replay, and pre-cutover gate pass.
3. During the rollback window, every Supabase-authoritative write is synchronously committed to a durable migration journal before acknowledgement and replayed to the Firebase rollback mirror. A mirror lag above 60 seconds or any dead-lettered mutation stops writes.
4. Document IDs for published notas and comments are preserved byte-for-byte. `userTag` values are preserved with original casing, uniqueness, and ownership. Existing `/p/:notaId`, `/@:userTag`, and `/@:userTag/:notaId` URLs must return the same public resource.
5. Source timestamps retain the represented instant and original raw value during staging. No migration job substitutes its own clock for `createdAt`, `updatedAt`, `publishedAt`, `subscribedAt`, `firstViewedAt`, or `lastViewedAt`.
6. Counts are derived and checked against their underlying rows/maps. A mismatch is quarantined and resolved; it is never silently copied as correct.
7. Email, newsletter membership, viewer identity, vote identity, auth metadata, and migration journals are never anonymously readable. Published content and the minimal public profile projection remain public.
8. Firebase admin credentials and Supabase service-role keys exist only in CI secret stores and server-side migration/runtime processes. They never use a `VITE_` prefix, enter a browser bundle, appear in logs, or live in repository files.

## Identity and URL contract

Firebase Auth UIDs are arbitrary strings while Supabase Auth identities are UUIDs. The migration therefore uses translation, not an assumption that the auth primary key can be preserved:

```text
identity_map
  firebase_uid text primary key
  supabase_user_id uuid unique not null references auth.users(id)
  provider_links jsonb not null
  migrated_at timestamptz not null
  source_hash text not null
```

All migrated domain tables use `supabase_user_id` for RLS and foreign keys and retain `firebase_uid` as an immutable, unique legacy key wherever reconciliation or rollback requires it. No code derives one ID from the other. The translation table is server-readable only.

Users are pre-provisioned through the Supabase server-side admin boundary. Email/password users complete a Supabase password-recovery flow; password hashes are not copied unless a separately reviewed, supported import procedure proves provider/hash compatibility in staging. Google users reauthenticate with Google. Linking is allowed only after verified-email/provider checks and an exact `identity_map` match; never link accounts solely because an unverified email string matches. Disabled/deleted Firebase users remain blocked.

The compatibility API accepts either a Firebase ID token (before C3) or Supabase access token (from canary onward), verifies it with the corresponding server SDK, and resolves the same identity-map row. Firebase tokens are rejected after the seven-day compatibility window. Client `localStorage.token` handling is replaced as part of auth implementation; the service-role key is never used for user sessions.

`userTag` is the stable public identity. It becomes `profiles.user_tag text collate "C"` with a unique constraint matching current case-sensitive Firestore document IDs and a check constraint equivalent to `^[a-zA-Z0-9_]{3,30}$`. Tag changes are a single Postgres transaction updating the profile and alias reservation. Existing tags cannot be normalized, lowercased, recycled, or reassigned by migration.

## Representation map

| Firebase source                                                        | Supabase representation                     | Conversion and constraints                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Auth user                                                              | `auth.users` + private `identity_map`       | New UUID auth ID; preserve Firebase UID in map; provider link and disabled state audited                                                                                                                                                          |
| `users/{uid}`                                                          | `private_profiles`                          | `user_id uuid` PK/FK; `firebase_uid text unique`; email private; ISO strings parsed to `timestamptz` plus staging raw value                                                                                                                       |
| `publicProfiles/{uid}` + `userTags/{tag}`                              | `profiles`                                  | One public row per user; `user_tag` unique and stable; `photo_url`; reject conflicting tag/UID pairs                                                                                                                                              |
| `notas/{notaId}`                                                       | `legacy_firebase_notas` quarantine          | Inventory/export even though no active Firebase call site exists; do not merge with local IndexedDB notas without a separate product rule                                                                                                         |
| `publishedNotas/{notaId}`                                              | `published_notas`                           | `id text` unchanged; author UUID via map plus legacy UID; content stored as `jsonb` only after lossless parse/serialize hash check, otherwise quarantined as text; timestamps to `timestamptz`; sub-page `parent_id` self-FK deferred during load |
| `publishedNotas.citations`                                             | `published_nota_citations jsonb` initially  | Preserve array order and unknown fields; normalized only in a later migration                                                                                                                                                                     |
| `publishedNotas.publishedSubPages`                                     | `published_nota_edges`                      | Expand array to `(parent_id, child_id, ordinal)`; reconcile against each child's `parentId`; disagreement blocks cutover                                                                                                                          |
| `publishedNotas.votes` and `notaVotes`                                 | `nota_votes`                                | Expand to unique `(nota_id,user_id)`; dedicated `notaVotes` row wins only when newer timestamp proves it; otherwise conflict blocks cutover                                                                                                       |
| Published counters                                                     | columns or transactionally maintained views | `bigint check >= 0`; compare copied value to derived votes/comments/view markers before C3                                                                                                                                                        |
| `stats.*Views`, `referrers`                                            | `nota_metric_buckets`                       | Expand nested map keys to rows `(nota_id, bucket_type, bucket_key, count)`; retain unknown keys in quarantine report                                                                                                                              |
| Legacy `publishedNotaViewers/{notaId}.viewers` and viewer subdocuments | `nota_viewers`                              | Union by translated user identity, unique `(nota_id,user_id)`; earliest valid `first_viewed_at`; never expose via public RLS                                                                                                                      |
| `comments/{commentId}`                                                 | `comments`                                  | `id text` unchanged; author via map; `parent_id` self-FK; content text/JSON preserved without coercion; timestamps to `timestamptz`                                                                                                               |
| `comments.votes`                                                       | `comment_votes`                             | Expand to unique `(comment_id,user_id)`; aggregate counts derived and transactionally maintained                                                                                                                                                  |
| `newsletterSubscriptions/{uid}`                                        | `newsletter_subscriptions`                  | User UUID PK, legacy UID unique, email confidential, `subscribed_at timestamptz`; owner/service RLS only                                                                                                                                          |
| Firebase Analytics events                                              | selected analytics provider                 | Keep names and parameter semantics during compatibility; add `migration_backend=firebase                                                                                                                                                          | supabase`; never dual-send with the same event ID |
| Firebase Storage images                                                | Supabase Storage objects + manifest         | Preserve content hash, media type, owner, and public URL behavior; object migration is a separate implementation workstream but its manifest must reconcile before Firebase Storage retirement                                                    |

Firestore missing values map to SQL `NULL` only when the field is optional. Empty string, empty map, empty array, zero, and `false` remain distinct. Firestore integer counters map to `bigint`. Dynamic/nested map keys are expanded to rows rather than used as SQL identifiers. Imports are idempotent upserts keyed by immutable source path and source hash; an existing target row with a different source hash is a conflict, not an overwrite.

## RLS and mutation boundary

The public can select only public published notas, their public comments, and `profiles(uid/user_tag/photo_url)`; the private profile is never joined into an anonymous view. Owners may mutate their profile, publication, and comment content according to the current Firestore rules. A user may select and mutate only their own vote, viewer marker, and newsletter row. Nota authors may delete comments on their nota. Counter columns, author IDs, legacy IDs, and migration metadata are not client-writable.

Before C1, all direct Firebase mutation sites in the inventory must route through one migration-aware server boundary. In particular, `commentService.ts` and `statisticsService.ts` currently overlap with Firebase Functions routes. Reads may remain adapter-based in the client, but no browser can independently dual-write or hold elevated keys. Postgres functions/transactions atomically change votes, comments, viewer markers, and their derived counters.

## Phased read/write plan

| Phase/checkpoint        | Reads                                                                                     | Writes                                                           | Entry/exit rule                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| C0 inventory lock       | Firebase                                                                                  | Firebase                                                         | Inventory, schema, RLS, event map, and this contract approved; no production export yet                                                         |
| C1 shadow backfill      | Firebase                                                                                  | Firebase primary; journal to Supabase shadow                     | Staging dry run passes; client mutations use server boundary; initial export records a source watermark                                         |
| C2 compatibility/canary | Firebase for normal users; 1%, 10%, then 50% deterministic read canaries compare Supabase | Firebase primary; journaled idempotent replay to Supabase        | At least 7 consecutive days, replication p95 <30s, max <60s, zero dead letters, error/latency gates green                                       |
| C3 maintenance cutover  | Maintenance response                                                                      | Writes paused for 30-minute planned window (60-minute hard stop) | Freeze at watermark W; drain journal; final delta export; pre-cutover matrix passes twice 10 minutes apart; backup/restore drill confirmed      |
| C4 Supabase primary     | Supabase                                                                                  | Supabase transaction + durable journal; Firebase rollback mirror | Canary matrix passes; start 7-day rollback clock; observe 1%, 10%, 50%, 100% cohorts                                                            |
| C5 retire compatibility | Supabase                                                                                  | Supabase                                                         | Seven green days; Firebase mirror and token acceptance disabled only after final reconciliation and owner sign-off; backups retained per policy |

The migration journal stores operation ID, actor legacy/new IDs, entity type/key, canonical payload hash, source and target commit timestamps, retry count, and terminal state. Requests retry by operation ID and return the original result. Analytics failures never roll back domain writes, but analytics delivery has its own idempotent event ID.

## Reconciliation report

Every run emits an immutable JSON report identified by migration ID and watermarks. For each collection/table it includes source count, target count, canonical SHA-256 multiset hash, missing IDs, extra IDs, field mismatches, quarantined rows, duplicate mappings, orphan foreign keys, and journal lag/dead-letter totals. It separately derives and compares:

- nota like/dislike counts from `nota_votes`;
- comment like/dislike counts from `comment_votes`;
- nota comment counts and comment reply counts from relationships;
- unique viewers from deduplicated viewer rows;
- public URL responses from a deterministic sample plus every row with invalid/mixed timestamps, unresolved parents, malformed content, or tag conflicts.

Canonical hashes sort by immutable ID, normalize timestamps to UTC microseconds while retaining raw staging values, sort object keys, preserve array order, and distinguish missing from null. Reports and exported identity data are restricted artifacts; logs contain counts and opaque IDs, not emails, tokens, content, or secrets.

## Go/no-go gates

Production export/backfill is **no-go** until C0 is approved. C3 is **go** only when all of these are true:

- all required `pre-cutover` cases pass with attached evidence;
- zero missing/extra/conflicting domain rows, duplicate identities/tags, orphan foreign keys, negative counters, quarantined rows, and dead-lettered writes;
- source and target canonical hashes match for identity maps, profiles, notas, comments, votes, viewers, subscriptions, and storage manifest;
- replication p95 is below 30 seconds and maximum below 60 seconds for seven days;
- read-canary semantic mismatch is zero and Supabase error rate is no more than Firebase +0.1 percentage points; p95 API latency regression is below 20%;
- RLS tests pass for anon, owner, authenticated non-owner, and server roles;
- backup restore and rollback rehearsal completed in staging using the same scripts and measured under 30 minutes;
- the migration lead, identity owner, data owner, and incident commander record approval.

Any failed required check, report without evidence, or elapsed 60-minute maintenance hard stop is a no-go and returns to C2 without changing the source of truth.

## Rollback checkpoints and runbook

Artifacts are taken at C1 initial watermark, C3 freeze watermark, immediately after C4 activation, and at each 24-hour point in the rollback window. Each checkpoint contains encrypted Firebase exports, Supabase database/storage backups, identity-map export, journal bounds, deployment/config versions, DNS/feature-flag values, and reconciliation report hashes.

Rollback triggers are any confirmed data loss/corruption, identity misbinding, authorization bypass, dead letter, mirror lag over 60 seconds for five minutes, sustained error increase over 0.1 percentage points, p95 latency regression over 20%, or public URL mismatch. The incident commander may trigger rollback for a lower-severity unknown.

1. Stop new writes and record the Supabase watermark. Do not simply flip reads while writes continue.
2. Drain the durable journal into Firebase. Resolve every retry; a dead letter keeps the service read-only.
3. Run the `rollback` verification gate and require equal source/target watermarks plus zero reverse-reconciliation differences.
4. Switch API/read/auth feature flags to the versioned Firebase configuration. Firebase token acceptance remains available throughout C4 specifically for this step.
5. Run auth, public URL, comment, vote, view, and newsletter smoke tests; then reopen writes.
6. Preserve Supabase and journal snapshots for forensics. Do not destroy or overwrite either store.

Rollback is not allowed after C5 without a new incident plan because Firebase token acceptance and the synchronous mirror have ended.

## Environments, CLI, and key boundaries

Required Supabase projects are `bashnota-supabase-staging` and `bashnota-supabase-production`; developers use a local Supabase CLI stack. Staging uses synthetic data plus a redacted production-shaped fixture. Production exports may run only in the approved restricted migration runner.

Local setup contract (implementation may pin a newer reviewed CLI version):

```sh
npx supabase init
npx supabase start
npx supabase db reset
npm run test:unit -- --run
node docs/supabase/verify-firebase-supabase.mjs
```

The committed Supabase directory will contain ordered SQL migrations, seed fixtures without personal data, and RLS tests. CI creates an ephemeral local stack, runs migrations from zero, generates types, and runs RLS plus migration verification. Staging and production are linked/deployed only from protected CI environments with approvals; developers do not reuse production secrets locally.

| Secret/key                                  | Location                            | Browser allowed                                       | Boundary                                                          |
| ------------------------------------------- | ----------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| Supabase project URL + anon/publishable key | environment-specific client config  | yes                                                   | Safe only with complete RLS; never grants elevated access         |
| Supabase service-role key                   | CI/server secret store              | **never**                                             | Migration runner and trusted server only; rotate after migration  |
| Database password/direct URL                | CI/server secret store              | **never**                                             | Migration/backup jobs only; TLS required                          |
| Firebase web config                         | compatibility client config         | temporarily                                           | Not an admin secret; rules remain enforced                        |
| Firebase Admin credential/export key        | restricted CI/server secret store   | **never**                                             | Export, token verification, rollback mirror only; revoke after C5 |
| Analytics write credential                  | server secret store when privileged | only publishable client token if provider supports it | Event ingestion only; no database privilege                       |

CI scans built assets for service-role/admin key fingerprints. Server logs redact authorization headers, cookies, reset links, database URLs, and export paths.

## Executable verification matrix

The catalog covers auth, profiles, published notas, comments, votes, views, newsletter, analytics, RLS, and rollback. Contract coverage runs without credentials:

```sh
node docs/supabase/verify-firebase-supabase.mjs
```

Migration jobs then attach evidence to a report and execute the applicable gate:

```sh
node docs/supabase/verify-firebase-supabase.mjs --gate pre-cutover --report artifacts/reconciliation-W.json
node docs/supabase/verify-firebase-supabase.mjs --gate canary --report artifacts/canary-W.json
node docs/supabase/verify-firebase-supabase.mjs --gate rollback --report artifacts/rollback-W.json
```

A report has top-level `migrationId`, `generatedAt`, `sourceWatermark`, `targetWatermark`, and `cases`. Every case entry has `id`, `status: "pass"|"fail"`, and a non-empty `evidence` array of restricted artifact references. Missing, skipped, failed, or evidence-free required cases make the command exit non-zero. The rollback command additionally requires identical source and target watermarks.

## Known pre-implementation blockers

- The `notas` Firestore collection has rules/index coverage but no active Firebase call site. A production export must prove whether documents exist; any rows stay quarantined until product ownership is established.
- `notaVotes` and legacy top-level viewer arrays coexist with newer embedded vote maps/viewer subdocuments. Conflict rules above must be implemented and exercised on production-shaped staging data.
- Direct browser and Functions mutations overlap. C1 cannot begin until the server boundary owns every mutation.
- `lastViewedAt` is read as either a Firestore Timestamp or string, and comment content types disagree between client and Functions. Mixed representations require lossless staging, not eager coercion.
