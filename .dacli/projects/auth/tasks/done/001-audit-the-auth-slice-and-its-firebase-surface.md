---
id: t-01KZRTN4ZE1EPX31X4ENSCBJ3V
kind: task
created: 2026-08-11T16:31:55Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Audit the auth slice and its Firebase surface
## Acceptance
- [x] Traces sign-in, sign-out and the router guard with file:line, and states what an unauthenticated user can reach
- [x] Maps every Firestore collection the client reads or writes and checks each against firestore.rules, naming any rule broader than the client needs
- [x] States what user data is exposed on public profile and public nota pages and whether any of it is unintended
- [x] States whether functions/ is deployed, what it does, and whether its dependencies drift from the root package.json
- [x] Reports at least 4 defects with file:line and user-visible consequence
- [x] Every finding filed via 'dacli note add finding --project auth --about <task>' with a file:line origin
## Log
- 2026-08-11T16:34:47Z claimed by a-slice-auditor-gncw20
- 2026-08-11T19:45:11Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:45:11Z verified by `grep -rlq t-01KZRTN4ZE1EPX31X4ENSCBJ3V .dacli/events` (exit 0)
- 2026-08-11T19:45:11Z deliverable: no dacli/001-audit-the-auth-slice-and-its-firebase-surface branch — nothing to check against master
- 2026-08-11T19:45:11Z completed by a-root
