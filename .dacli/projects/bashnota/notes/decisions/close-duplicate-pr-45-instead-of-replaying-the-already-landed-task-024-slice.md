---
id: d-close-duplicate-pr-45-instead-of-replaying-the-already-landed-task-024-slice
kind: note
note_kind: decision
created: 2026-08-28T11:42:39Z
created_by: a-root
about: "[[024-feature-request-harden-apis-uploads-credentials-and-jupyter-trust-boundaries]]"
---
# Close duplicate PR 45 instead of replaying the already-landed task-024 slice
## Chose
Close duplicate PR 45 instead of replaying the already-landed task-024 slice
## Rejected
Merge PR 45 after PR 43 and PR 46
## Because
PR 45 contains the same two task-024 commits already delivered by PR 43, while master has newer provider changes from PR 46; closing avoids duplicate or regressive history and leaves the broader task open.
