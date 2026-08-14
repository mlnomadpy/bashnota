# Publishing and viewer-statistics cutover

Firebase remains the production publishing provider by default. A Supabase
candidate build requires every `VITE_SUPABASE_PUBLISHING_*` comparison flag,
the reconciled Supabase auth rollout, and a `publishing-c5-*` marker. Postgres
then independently verifies the same marker in `publishing_rollout_state`.
Missing configuration, network failures, count drift, owner/link drift, or
metric drift all fail closed to Firebase.

Before enabling, export one JSON row per publication from each provider with
`id`, canonical migrated `owner`, public `link`, and all six counters. Run
`node scripts/reconcile-publishing.mjs firebase.json supabase.json`; archive the
report and enable the marker only when `ready` is true. Firebase publishing and
Auth must stay enabled through a monitored rollback window.

Browser publication writes use `publish_nota`/`unpublish_nota`; ownership,
timestamps, and counters are server controlled. Public reads use the safe
`query_publications` projection and ordered keyset pagination. Refresh uses
projection polling and never calls `record_nota_view`; the page-load path owns
that call and guards it once per mount. We intentionally do not subscribe to
the base table because realtime payloads would include migration-only fields.
