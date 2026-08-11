---
id: t-01KZRV1ACEA55QGZ1F9PWFR5CX
kind: task
created: 2026-08-11T16:38:34Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Sanitize every v-html sink that renders execution output
## Acceptance
- [ ] All three v-html sinks in OutputRenderer.vue (lines 590, 596, 623) pass through DOMPurify, which is already a project dependency
- [ ] The misleading safeFormattedContent tag-balance heuristic is replaced by real sanitization, not supplemented by it
- [ ] ErrorDisplay.vue and any other v-html sink reachable from code output or execution errors is likewise sanitized
- [ ] A test proves that a balanced malicious payload such as a script tag is neutralized by each sanitized sink
- [ ] Legitimate output formatting such as syntax highlighting and safe HTML still renders, demonstrated by a passing test
## Log
