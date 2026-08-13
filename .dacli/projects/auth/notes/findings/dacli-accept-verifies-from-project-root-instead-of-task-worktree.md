---
id: f-dacli-accept-verifies-from-project-root-instead-of-task-worktree
kind: note
note_kind: finding
created: 2026-08-13T16:53:38Z
created_by: a-root
about: "[[002-tighten-the-firestore-rules-that-over-expose-user-data]]"
severity: major
scope: workspace
---
# dacli accept verifies from project root instead of task worktree
Reproduced 2026-08-13: invoked dacli accept from auth task worktree with --verify npm run test:rules; npm reported missing script although npm pkg get in that worktree shows it. Linked master lacks the script. Upstream dacli report attempted but gh is unauthenticated, so filing is externally blocked. Workaround: make verify command explicitly cd to task worktree.
