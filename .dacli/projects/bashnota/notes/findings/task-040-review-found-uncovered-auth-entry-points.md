---
id: f-task-040-review-found-uncovered-auth-entry-points
kind: note
note_kind: finding
created: 2026-08-26T22:38:25Z
created_by: a-root
about: "[[040]]"
severity: major
scope: project
origin: src/features/auth/views/ProfileView.vue:39
---
# Task 040 review found uncovered auth entry points
Independent review found ProfileView ignores resetPassword(false), and OAuthCallbackView renders callback failure in a bare paragraph instead of the shared accessible boundary. Repair will cover both paths plus mounted success/failure matrices.
