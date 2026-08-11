---
id: r-the-in-house-vue-node-view-bridge-is-the-single-point-of-failure-for-the-whole
kind: risk
created: 2026-08-11T17:49:42Z
created_by: a-root
impact: high
likelihood: high
---
# The in-house Vue node-view bridge is the single point of failure for the whole migration
## Indicators
- 55 call sites depend on VueNodeViewRenderer/NodeViewWrapper
- Node view bugs present as cursor jumps, swallowed keystrokes and lost selection — the hardest class of editor bug to diagnose
## Action
If the bridge cannot be made solid in Phase 0, stop and report rather than porting 12 nodes onto a shaky foundation
