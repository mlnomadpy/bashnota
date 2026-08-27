---
id: f-auth-ui-currently-lacks-a-shared-visible-error-boundary
kind: note
note_kind: finding
created: 2026-08-26T22:26:09Z
created_by: a-root
about: "[[040]]"
severity: major
scope: project
origin: src/features/auth/views/LoginView.vue:1
---
# Auth UI currently lacks a shared visible error boundary
Task 040 baseline: the four auth views handle failures independently or only through toasts. The implementation will centralize a single accessible, actionable error surface and add mounted coverage for each flow.
