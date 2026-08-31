---
id: t-01M1CQJ2J5JFHCJP38YCKH9Y1A
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
priority: must
github:
  issue: 61
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 61
  body_digest: sha256:7092fad0431cee8542cd1b2be7501064abe24232bd54e26117d5a232e43da22c
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Bug: editor autosave drops edits after the queue reaches 50
## Context
Adopted from GitHub issue #61.

## Reproduction

1. Open a nota and generate more than 50 editor updates.
2. Allow queued edits to be processed.
3. Continue editing after the queue reaches its cap.

## Observed

NotaEditor processes the queue and returns without enqueueing the edit that triggered the cap. Applied entries are retained instead of removed, so the queue remains full and later edits are silently discarded.

Relevant code: src/features/editor/components/NotaEditor.vue around the edit queue cap and processEditQueue cleanup.

## Expected

No user edit is dropped. Successfully applied entries leave the queue, backpressure preserves the triggering edit, and failures remain observable/retryable.

## Acceptance criteria

- More than 50 consecutive edits persist after reload.
- Queue cleanup removes applied entries.
- The triggering edit at the queue boundary is retained.
- Regression tests cover burst editing, failures, retry, and reload.

## Acceptance
- [ ] More than 50 consecutive edits persist after reload.
- [ ] Queue cleanup removes applied entries.
- [ ] The triggering edit at the queue boundary is retained.
- [ ] Regression tests cover burst editing, failures, retry, and reload.
## Log
- 2026-08-31T20:22:05Z claimed by a-bashnota-implementer-7ermpb
