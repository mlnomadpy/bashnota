# Community interaction cutover

Firebase remains the default for comments, replies, nota/comment votes, and
newsletter subscriptions. A Supabase candidate requires all public
`VITE_SUPABASE_COMMUNITY_*` comparisons to be exact, an operator-written
`community-c6-*` database marker, zero orphans, and the explicit task-008
cutover flag. The browser then verifies that marker through
`verify_community_rollout`; every missing, stale, or unavailable gate fails
closed to Firebase.

Run `node scripts/reconcile-community.mjs firebase.json supabase.json` against
restricted exports. The report compares comment IDs and timestamps, direct
reply relationships, vote rows, comment/reply/vote counters, subscription
rows, and orphan IDs. Orphans are never silently discarded: repair or
quarantine them and rerun until the report is exact. Archive the two inputs,
report hash, database marker, and reviewer approval with the task-008 cutover
record. Firebase writes and rollback data remain enabled through that gate.

Comment deletion uses an atomic hard-subtree policy: deleting a comment also
deletes every nested reply and vote below it, while triggers decrement the
publication and direct-parent counters once for each removed row.
