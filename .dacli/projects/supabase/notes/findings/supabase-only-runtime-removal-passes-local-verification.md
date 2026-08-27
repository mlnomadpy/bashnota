---
id: f-supabase-only-runtime-removal-passes-local-verification
kind: note
note_kind: finding
created: 2026-08-19T11:55:10Z
created_by: a-codex-fixer-jyr8b6
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: major
---
# Supabase-only runtime removal passes local verification
Removed browser SDK/runtime services, compatibility selectors, Functions/Admin package, rules/indexes/emulator/deploy credentials, and packages. Evidence: npm run check:backend-purity scans 881 runtime/config files plus artifact names; npm ci; 424/424 Vitest; typecheck; production build; 1,881,056-byte entry under 1,941,760 budget; Chrome iframe regression; fresh Supabase reset with 184 pgTAP tests; browser-key auth/publishing/community integrations; upgrade rehearsal; db lint; generated types.
