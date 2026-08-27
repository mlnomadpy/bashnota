---
id: t-01M0AN95FCS0QPWGRFK8D6Q7KB
kind: task
created: 2026-08-18T14:44:20Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Make Supabase the sole runtime and remove Firebase
## So that
the application has one production backend and contains no Firebase runtime, fallback, credentials, tooling, or UI assumptions
## Acceptance
- [x] Supabase is the sole auth, publication, community, analytics/view, newsletter, image/storage, and server-operation provider; no runtime/configuration fallback selects Firebase
- [x] Firebase SDK, Admin SDK, firebase-tools, rules-unit-testing, Functions, rules/indexes/emulator scripts, environment variables, direct imports, compatibility adapters, Firebase-specific UI text, and deployment configuration are removed
- [x] Analytics and storage/image workflows have explicit Supabase implementations or recorded intentional removal decisions, with behavior tests
- [x] A clean install and exhaustive forbidden scan prove no Firebase package, import, config key, generated artifact, or browser/server credential path remains
- [x] Fresh local Docker reset, migrations/RLS tests, browser-key integrations, migration rehearsal, generated types, typecheck, full unit suite, production build, bundle budget, and security regressions pass with productionCutover=false until deployment
## Log
- 2026-08-18T14:44:36Z claimed by a-root
- 2026-08-19T13:02:17Z accepted by a-root
- 2026-08-19T13:02:17Z closed WITHOUT verification — no --verify command was given
- 2026-08-19T13:02:17Z completed by a-root
