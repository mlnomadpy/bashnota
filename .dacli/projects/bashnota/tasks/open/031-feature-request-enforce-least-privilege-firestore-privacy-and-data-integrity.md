---
id: t-01M0F8AY6WMNRKB7QSYSX33R98
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 2
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Feature request: enforce least-privilege Firestore privacy and data integrity
## Context
Adopted from GitHub issue #2.

## Objective

Make Firestore authorization, public-profile exposure, voting, comments, and analytics counters enforce least privilege and server-validated integrity.

## Primary implementation areas

- `firestore.rules`
- `storage.rules`
- `functions/src/routes/nota.ts`
- `functions/src/routes/comments.ts`
- `functions/src/routes/authors.ts`
- `src/features/auth/services/auth.ts`
- `src/features/bashhub/services/statisticsService.ts`

## Required changes

- Restrict private user documents to their owners.
- Introduce a separate public-profile projection containing only display-safe fields.
- Move aggregate statistics and engagement-counter mutations behind trusted backend transactions.
- Ensure a client cannot directly assign aggregate counter values.
- Validate that viewer records can add only the authenticated viewer and cannot replace existing viewers.
- Enforce one user tag per account using a transaction or server-controlled mapping.
- Define exact allowed fields, types, lengths, timestamps, and immutable ownership fields for every collection.
- Validate parent-note and parent-comment relationships before writes.
- Add Firebase Emulator configuration to the repository instead of relying on untracked local files.
- Add `@firebase/rules-unit-testing` tests for every read/write policy.

Do not publish exploit recipes or production data in this issue.

## Acceptance criteria

- Cross-user reads of private profiles and notes are denied.
- Public profile lookup returns only explicitly public fields.
- Forged ownership, counter inflation, arbitrary viewer insertion, invalid votes, and malformed comments are denied.
- Authors retain documented moderation abilities without gaining access to unrelated private data.
- Rules tests run in CI and fail closed when a new collection is introduced without a policy.

## Acceptance
## Log
