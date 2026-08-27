---
id: f-missing-master-branch-protection
kind: note
note_kind: finding
created: 2026-08-26T14:10:58Z
created_by: a-root
about: "[[027]]"
severity: major
---
# missing-master-branch-protection
GitHub API returned 404 Branch not protected for master on 2026-08-26. dacli pr --auto therefore merged PR #22 immediately instead of waiting for Quality. Until task 027 configures required stable checks and protected-branch enforcement, all PRs must be opened without --auto and merged only after explicitly observed CI success.
