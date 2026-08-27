---
id: t-01M0D6HV8T5KTAT6ANWT241XPY
kind: task
created: 2026-08-19T14:24:39Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Audit editor and nota persistence for data loss and recovery defects
## So that
unsupported content, failed transactions, reloads, versioning, and storage-mode transitions cannot silently lose user work
## Acceptance
- [x] Trace editor hydration/autosave, normalized block conversion, deletion/version history, Dexie/filesystem paths, import/export, and recovery without editing source
- [x] Reproduce and prioritize actionable data-loss or corruption findings with exact file/line evidence
- [x] For each major finding, propose a deduplicated task with regression-focused acceptance and a three-point estimate
- [x] Report an explicit ACCEPT/BLOCK verdict and verification commands run
## Log
- 2026-08-19T14:25:29Z claimed by a-data-reviewer-wj35zq
- 2026-08-19T14:40:56Z accepted by a-root
- 2026-08-19T14:40:56Z closed WITHOUT verification — no --verify command was given
- 2026-08-19T14:40:56Z completed by a-root
