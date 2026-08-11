---
id: t-01KZRTMJ4NMK607XZWNZDF5M9M
kind: task
created: 2026-08-11T16:31:36Z
created_by: a-root
owner: a-root
priority: should
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Audit the AI slice
## Acceptance
- [x] Maps the provider abstraction: every file in services/providers, what each provider supports, and which are wired to UI versus defined but unreachable
- [x] States exactly where AI API keys are stored and every path they can travel, and whether any path can leak them into a published nota, a log, or a request to a non-provider host
- [x] Grades every AI capability complete/partial/stubbed/dead/orphaned: conversations, code actions, the assistant sidebar, WebLLM in-browser inference, generation blocks
- [x] States the bundle cost of @mlc-ai/web-llm and whether it loads for users who never enable it
- [x] Reports at least 5 defects with file:line and user-visible consequence
- [x] Every finding filed via 'dacli note add finding --project ai --about <task>' with a file:line origin
## Log
- 2026-08-11T16:34:47Z claimed by a-slice-auditor-e25q3q
- 2026-08-11T19:45:11Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:45:11Z verified by `grep -rlq t-01KZRTMJ4NMK607XZWNZDF5M9M .dacli/events` (exit 0)
- 2026-08-11T19:45:11Z deliverable: no dacli/001-audit-the-ai-slice branch — nothing to check against master
- 2026-08-11T19:45:11Z completed by a-root
