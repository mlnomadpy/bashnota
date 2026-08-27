---
id: t-01M0CZEK2ZEEQQ7004ND8ZVGNQ
kind: task
created: 2026-08-19T12:20:32Z
created_by: a-root
owner: a-root
parent: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Port and rehearse the legacy-data migration without Firebase runtime dependencies
## Acceptance
- [x] The branch contains a provider-neutral JSON export-transform-import engine for all accepted legacy Auth, publication, community, analytics, newsletter, and storage-manifest records, with no Firebase SDK/Admin/tool dependency
- [x] A fresh local Docker rehearsal imports the fixture, verifies identities/owners/URLs/order/counters/hashes/orphans, reruns with zero duplicate mutations, and proves rollback/restore
- [x] Checkpoint, lease, provenance, retry, audit, and rollback safety regressions from task 007 remain executable and pass
- [x] productionCutover remains false; external production volume, Google provider, storage-byte copy, and canary gates are documented honestly
- [x] Clean install, exhaustive backend-purity scan, Supabase tests, generated types, migration engine tests, typecheck, full unit suite, build, bundle budget, and diff-check pass
## Log
- 2026-08-19T12:21:00Z claimed by a-codex-fixer-ssj5r3
- 2026-08-19T12:53:45Z status done proposed by a-codex-fixer-1a6ne8, applied (event 01M0D0W9G52WACK15MQRHT6YVE)
- 2026-08-19T13:03:32Z accepted by a-root
- 2026-08-19T13:03:32Z closed WITHOUT verification — no --verify command was given
- 2026-08-19T13:03:32Z completed by a-root
