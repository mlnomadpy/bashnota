# Firebase to Supabase migration rehearsal and production runbook

This runbook implements task 007 without changing any production rollout flag. Firebase remains authoritative. Task 008 owns any cutover.

## Restricted inputs and export

Run only in the restricted migration runner. Neither browser bundles nor `VITE_*` variables may contain Firebase Admin, Google OAuth, or Supabase service-role credentials. Source files, checkpoints, audit logs, identity maps, approvals, and reports are restricted artifacts encrypted at rest and excluded from source control.

Capture one write-consistent watermark. Export Firebase Auth with the approved Admin/CLI process, and export exactly these Firestore paths into one JSON array per listed filename:

- `users`, `publicProfiles`, `userTags`, `notas`, `publishedNotas`
- `publishedNotaViewers` and collection-group `publishedNotaViewerDocuments` for `publishedNotaViewers/{notaId}/viewers/{firebaseUid}`
- `notaVotes`, `comments`, `newsletterSubscriptions`

Generate `storageManifest.json` separately while copying objects. It contains object path, SHA-256, media type, and optional owner UID. The migration tool hashes paths and owner UIDs in reports; object bytes are copied by the storage workstream and must match this manifest before C3.

Place Firebase Auth output in `authUsers.json`. Assemble a deterministic, mode-0600 envelope:

```sh
npm run migration:firebase:export -- \
  --input-dir "$RESTRICTED_EXPORT_DIR" \
  --watermark "$FIREBASE_WATERMARK" \
  --output "$RESTRICTED_ARTIFACT_DIR/firebase-export.json"
```

The assembler uses a lossless JSON decoder, sorts document IDs, preserves array order and typed nested JSON, normalizes Auth fields, and prints only counts and hashes. Unsafe integers and non-canonical numeric tokens that JavaScript would round are rejected before export; lossy nested publication/comment content is quarantined and therefore blocks apply. Timestamp normalization happens during transform: UTC microseconds are stored alongside the raw source representation, including publication `lastViewedAt`, vote timestamps, and viewer timestamps.

## Dry run and identity boundary

Run dry-run before any target mutation:

```sh
npm run migration:firebase -- \
  --mode dry-run --environment staging --run-id "$RUN_ID" \
  --source "$RESTRICTED_ARTIFACT_DIR/firebase-export.json" \
  --audit "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.audit.ndjson" \
  --checkpoint "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.checkpoint.json" \
  --report "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.dry-run.json" \
  --batch-size 100 --requests-per-second 20 --max-retries 3
```

Dry-run performs no domain writes. Any orphan, counter disagreement, ambiguous vote, hierarchy cycle, malformed tag/referrer, missing identity/profile/tag link, lossy JSON, or quarantined content is a no-go. Transform, relationship/counter validation, manifest hashing, approval matching, checkpoint binding, and read-only target conflict checks all finish before any Auth Admin, provisioning, domain, run, or journal mutation. Production dry-run and apply both require the same complete restricted `--identity-map`, so the approved manifest and `identityPlanHash` include the exact Supabase UUID/provider identities rather than planning placeholders.

Email accounts can be provisioned by the server-side Admin API during apply. Before calling Auth, the tool durably records an immutable Firebase UID → randomly allocated Supabase UUID plan containing only the verified-email hash. Resume therefore finishes the same account even if a process stops between planning, Auth creation, and the atomic profile/tag transaction; it never searches for or links an unrelated account by email alone. Google accounts must first be created and provider-linked by the approved external OAuth harness; pass the resulting restricted Firebase UID → Supabase user/provider UID mapping with `--identity-map`. The tool never invents a Google callback. Stable user tags remain collision-safe through `migrate_firebase_identity`.

## Apply, checkpoint, and resume

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only in the restricted process environment. Never use a publishable key or service role in a browser.

```sh
npm run migration:firebase -- \
  --mode apply --environment staging --run-id "$RUN_ID" \
  --source "$RESTRICTED_ARTIFACT_DIR/firebase-export.json" \
  --identity-map "$RESTRICTED_ARTIFACT_DIR/identity-map.json" \
  --audit "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.audit.ndjson" \
  --checkpoint "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.checkpoint.json" \
  --report "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.apply.json" \
  --batch-size 100 --requests-per-second 20 --max-retries 3
```

Use `--mode resume` with the exact same arguments after a transient interruption. Checkpoints advance only after a complete bounded batch and bind the run ID, manifest, source watermark, and source-to-target identity plan; a checkpoint from run A cannot advance run B. After all validation and read-only conflict checks pass, the database grants one process a manifest-bound five-minute run lease. Identity provisioning, record operations, and reconciliation heartbeat that lease. A second live process fails with `55P03` before it can touch the journal; after an abandoned lease expires, a new process may resume with the exact binding.

The database journal is keyed by entity kind plus opaque source-key hash and also binds the canonical target hash. The same completed source/target skips safely without transferring ownership, while changed source/target or another run's unfinished record fails with a conflict. Each target mutation and its `created`/`preexisting` provenance are committed in one database transaction. This migration never updates pre-existing domain rows: exact canonical equivalence is required, and any difference fails closed. If a completion response is lost after commit, retry re-reserves the record, observes the exact durable `applied` binding, and idempotently confirms completion; a late failure report cannot downgrade `applied` state. Only transient network/serialization/rate-limit failures retry.

The local NDJSON audit and database audit are append-only hash chains with an allowlist of non-PII fields. Every logical event has a deterministic run-bound idempotency key: retrying a lost response returns the original event hash, while reuse with different content fails closed. Local writers take an exclusive OS lock, verify the full chain again while locked, and recover only locks owned by dead processes (or old ownerless/corrupt locks), so concurrent processes cannot both append the same sequence. The chains record phase, entity kind, opaque key hash, source hash, attempt, class, count, checkpoint, status, and elapsed milliseconds only. The source hash binds canonical fields plus their raw timestamp representations without logging the raw value itself.

## Reconciliation and go/no-go

Every successful apply requires:

- exact target record counts and canonical SHA-256 multisets per entity kind;
- zero publication/comment derived-counter mismatches;
- zero identity-owner, hierarchy, comment-parent, and foreign-key orphans;
- zero public projection/profile URL mismatches;
- valid storage manifest SHA-256 values and a separate completed object-copy comparison;
- deterministic opaque sample hashes for manual/public URL smoke;
- `auth`, `publishing`, and `community` rollout versions still equal `firebase-v1`.

Run the accepted contract verification twice, ten minutes apart at C3:

```sh
node docs/supabase/verify-firebase-supabase.mjs --gate pre-cutover --report "$RESTRICTED_ARTIFACT_DIR/reconciliation-W.json"
```

Zero is the only accepted mismatch/orphan/quarantine/dead-letter threshold. Replication p95 must be below 30 seconds, maximum below 60 seconds for seven days, semantic mismatch zero, error-rate increase at most 0.1 percentage points, API p95 regression below 20%, staging restore below 30 minutes, and the maintenance window below its 60-minute hard stop. The production approval JSON must authorize the exact `productionRunId`, set `c0Approved: true`, include a nonempty `reconciliationMarker`, and match `manifestHash`, `sourceWatermarkHash`, and `identityPlanHash` from the dry-run report. Migration lead, identity owner, data owner, and incident commander sign the later C3 approval evidence before cutover; this tool still leaves cutover false.

## Rollback rehearsal and restore

```sh
npm run migration:firebase -- --mode rollback --environment staging --run-id "$RUN_ID"
npm run migration:firebase -- --mode resume --environment staging --run-id "$RUN_ID" \
  --source "$RESTRICTED_ARTIFACT_DIR/firebase-export.json" \
  --identity-map "$RESTRICTED_ARTIFACT_DIR/identity-map.json" \
  --audit "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.restore.audit.ndjson" \
  --checkpoint "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.restore.checkpoint.json" \
  --report "$RESTRICTED_ARTIFACT_DIR/$RUN_ID.restore.json"
```

Rollback first atomically acquires a unique owner-token lease for the exact run. A live apply or rollback owner causes `55P03` before any target, journal, or run mutation; takeover is possible only after the prior lease expires. Each dependency-reverse target deletion (or pre-existing-row retention) and its provenance transition commits in one server transaction while heartbeating that lease. The next process can therefore resume after the last committed record, while an old owner is fenced. Final `rolled-back` state is refused until every non-identity journal row is terminal.

Logical rollback deletes only domain rows whose atomic journal provenance says they were created by that exact run. Matching rows that predated the run are retained. Updates to pre-existing rows are deliberately unsupported, so there is no unrecorded prior value to reconstruct. Verified Auth identities and stable identity translations are retained but inert behind Firebase rollout gates; this preserves account linkage and permits a byte-identical restore. Do not delete the audit, journal, export, database backup, or storage snapshot. Before any production rollback, freeze writes, drain the durable reverse journal to Firebase, require equal watermarks and zero reverse differences, restore Firebase feature versions, smoke auth/public URLs/comments/votes/views/newsletter, and only then reopen writes.

## Executable local evidence

The task-007 synthetic fixture covers both users, every in-scope collection, nested typed content, ordered citations/edges, votes, viewer aggregate/subdocument coupling, daily/weekly/monthly/referrer metrics, root/reply comments, newsletter, legacy nota quarantine, and a storage manifest.

```sh
npx --yes supabase@2.114.0 db reset
npx --yes supabase@2.114.0 test db
npm run test:migration-engine
npm run test:supabase:migration
```

The recorded 2026-08-18 clean aggregate run imported 18 canonical records, injected lost responses after durable completion and audit append, rejected competing live apply and rollback leases before mutation, exercised expired-lease takeover plus crash-resumed phased rollback, completed same-run and different-run no-op verification, negative reconciliation controls, and provenance-safe restore in 12.551 seconds, and left production cutover false. A separate-process local regression also proves concurrent audit writers produce one ordered hash chain. This is a synthetic local staging-equivalent rehearsal only. No external staging or production credentials, production-shaped volume, Google provider callback, storage object copy, seven-day replication/canary window, or production runtime threshold has been exercised; all remain mandatory no-go gates before task-008 cutover.
