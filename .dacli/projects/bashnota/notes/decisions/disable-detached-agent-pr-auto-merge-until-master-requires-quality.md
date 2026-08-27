---
id: d-disable-detached-agent-pr-auto-merge-until-master-requires-quality
kind: note
note_kind: decision
created: 2026-08-27T02:12:15Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
---
# Disable detached-agent PR auto-merge until master requires Quality
## Chose
Disable detached-agent PR auto-merge until master requires Quality
## Rejected
Pass --pr to the detached task048 spawn
## Because
PR #38 auto-merged before Quality began because master has no required branch protection. Task agents may implement and commit locally; a-root will push/open/merge only after independent review and exact CI.
