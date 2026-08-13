---
id: t-01KZYG4W01FYGE10ZF3X9D5CXD
kind: task
created: 2026-08-13T21:23:43Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
depends_on: "[002, 003, 004]"
---
# Migrate published notas, public reads, and viewer statistics to Supabase
## So that
publishing, public nota pages, author pages, unique views, and aggregate statistics run on Supabase without changing public behavior
## Acceptance
- [ ] Publish/update/unpublish and public nota/author/userTag queries use Supabase with equivalent visibility, ordering, pagination, immutable ownership, and public URL behavior
- [ ] Viewer events, unique viewer markers, referrers, daily/weekly/monthly aggregates, and counters update atomically through server-controlled SQL functions/triggers and reject forged deltas
- [ ] Realtime or refresh behavior is defined for public pages without introducing duplicate view events
- [ ] Integration tests cover anonymous public reads, owner writes, other-user denial, exact view/referrer increments, marker coupling, long/dotted referrers, and unpublish behavior
- [ ] A reconciliation report compares Firebase and Supabase published nota counts, IDs, owners, public-profile links, and aggregate metrics before cutover
## Log
