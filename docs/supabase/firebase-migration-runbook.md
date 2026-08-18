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

The assembler sorts document IDs, preserves array order and typed nested JSON, normalizes Auth fields, and prints only counts and hashes. Timestamp normalization happens during transform: UTC microseconds are stored alongside the raw source representation.

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

Dry-run performs no domain writes. Any orphan, counter disagreement, ambiguous vote, hierarchy cycle, malformed tag/referrer, missing identity/profile/tag link, or quarantined publication content is a no-go. Production dry-run and apply both require the same complete restricted `--identity-map`, so the approved manifest hash includes the exact randomly allocated Supabase UUIDs rather than planning placeholders.

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

Use `--mode resume` with the exact same arguments after a transient interruption. Checkpoints advance only after a complete bounded batch. The database journal is keyed by entity kind plus opaque source-key hash: the same source hash skips safely; a changed source hash fails with a conflict. Only transient network/serialization/rate-limit failures retry. Permanent validation and identity conflicts stop the run.

The local NDJSON audit and database audit are append-only hash chains with an allowlist of non-PII fields. They record phase, entity kind, opaque key hash, attempt, class, count, checkpoint, status, and elapsed milliseconds only.

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

Zero is the only accepted mismatch/orphan/quarantine/dead-letter threshold. Replication p95 must be below 30 seconds, maximum below 60 seconds for seven days, semantic mismatch zero, error-rate increase at most 0.1 percentage points, API p95 regression below 20%, staging restore below 30 minutes, and the maintenance window below its 60-minute hard stop. The production approval JSON must authorize the exact `productionRunId`, set `c0Approved: true`, include a nonempty `reconciliationMarker`, and match both `manifestHash` and `sourceWatermarkHash` from the dry-run report. Migration lead, identity owner, data owner, and incident commander sign the later C3 approval evidence before cutover; this tool still leaves cutover false.

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

Logical rollback deletes imported domain rows in dependency-reverse order and marks their journal entries rolled back. Verified Auth identities and stable identity translations are retained but inert behind Firebase rollout gates; this preserves account linkage and permits a byte-identical restore. Do not delete the audit, journal, export, database backup, or storage snapshot. Before any production rollback, freeze writes, drain the durable reverse journal to Firebase, require equal watermarks and zero reverse differences, restore Firebase feature versions, smoke auth/public URLs/comments/votes/views/newsletter, and only then reopen writes.

## Executable local evidence

The task-007 synthetic fixture covers both users, every in-scope collection, nested typed content, ordered citations/edges, votes, viewer aggregate/subdocument coupling, daily/weekly/monthly/referrer metrics, root/reply comments, newsletter, legacy nota quarantine, and a storage manifest.

```sh
npx --yes supabase@2.114.0 db reset
npx --yes supabase@2.114.0 test db
npm run test:migration-engine
npm run test:supabase:migration
```

The recorded 2026-08-18 local run imported 18 canonical records, completed apply + no-op re-execution + negative reconciliation controls + rollback/restore in 1.638 seconds, and left production cutover false. This measures the deterministic fixture only; staging must use production-shaped volume to establish the actual runtime and maintenance-window budget.
