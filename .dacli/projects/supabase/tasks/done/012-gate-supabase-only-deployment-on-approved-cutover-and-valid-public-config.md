---
id: t-01M0CZE6A7Q5SJG4BM8A7XEX87
kind: task
created: 2026-08-19T12:20:19Z
created_by: a-root
owner: a-root
parent: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
estimate: "{optimistic: 1, probable: 2, pessimistic: 4}"
---
# Gate Supabase-only deployment on approved cutover and valid public config
## Acceptance
- [x] Production deploy fails before build when Supabase URL or publishable key is empty, malformed, secret-like, or inconsistent
- [x] Production deploy fails while runtime_deployment_state.production_cutover is false or required migration/reconciliation evidence is absent
- [x] A Docker-backed positive test proves the same public config and cutover verifier permit a production build only after an explicit local approval fixture
- [x] No Firebase fallback or Firebase credential is reintroduced; typecheck, focused tests, build, and diff-check pass
## Log
- 2026-08-19T12:21:00Z claimed by a-codex-fixer-terra-hqf9ek
- 2026-08-19T13:01:51Z completed by a-root
