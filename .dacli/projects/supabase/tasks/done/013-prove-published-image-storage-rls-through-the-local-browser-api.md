---
id: t-01M0CZEK273GM0YGGC9YVJ63FX
kind: task
created: 2026-08-19T12:20:32Z
created_by: a-root
owner: a-root
parent: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
estimate: "{optimistic: 1, probable: 2, pessimistic: 4}"
---
# Prove published image Storage RLS through the local browser API
## Acceptance
- [x] Fresh local Supabase Docker creates the published-images bucket and applies its RLS policies
- [x] A publishable-key browser integration proves owner upload/read/delete, rejects anonymous upload, cross-user overwrite/delete, oversized files, and disallowed MIME types
- [x] The image publishing adapter is exercised against the real local Storage API without service-role credentials
- [x] Supabase tests, generated types, focused unit tests, typecheck, build, and diff-check pass
## Log
- 2026-08-19T12:21:00Z claimed by a-codex-fixer-terra-3gfdpn
- 2026-08-19T13:01:51Z completed by a-root
