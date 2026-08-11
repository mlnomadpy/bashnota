---
id: t-01KZRV1V96PDBZRC2TQW97HACS
kind: task
created: 2026-08-11T16:38:51Z
created_by: a-root
owner: a-root
priority: must
---
# Resolve the duplicate aiActions Pinia store id
## Acceptance
- [ ] The two stores currently registered under the Pinia id aiActions are given distinct ids, or merged if they are genuinely the same store duplicated
- [ ] States which store was winning the id collision at runtime and what behaviour was therefore being silently lost
- [ ] Every import site of both stores is updated and listed
- [ ] npx vite build succeeds and npx vitest run stays green
## Log
