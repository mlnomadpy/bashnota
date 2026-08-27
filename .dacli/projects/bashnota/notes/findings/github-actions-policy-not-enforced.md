---
id: f-github-actions-policy-not-enforced
kind: note
note_kind: finding
created: 2026-08-26T14:15:11Z
created_by: a-root
about: "[[027]]"
severity: major
---
# github-actions-policy-not-enforced
GitHub API on 2026-08-26 reports no rulesets, unprotected master, allowed_actions=all, sha_pinning_required=false. Default workflow token is read-only and cannot approve PRs (good). Task027 must configure required Quality checks, same-repo review/merge policy, and preferably selected-actions/full-SHA enforcement after task020 lands.
