---
id: t-01M0F8AY5KY376RZ0NBRFH4N9P
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 4
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Feature request: restore a clean type-checked production build
## Context
Adopted from GitHub issue #4.

## Objective

Restore a clean, reproducible production build in which bundling and TypeScript verification both pass.

## Current failures

- `src/features/editor/components/blocks/citation-block/Bibliography.vue` contains an undefined `editor` reference and an editor-type mismatch.
- `src/features/settings/components/advanced/UnifiedAdvancedSettings.vue` passes narrow callbacks to select components whose values may be broader or nullable.
- The deployment workflow runs `build-only`, allowing deployment to bypass type checking.

## Required changes

- Type the bibliography editor prop as TipTap `Editor`.
- Remove the duplicate bibliography refresh using the undefined identifier.
- Type the editor-command transaction and node traversal without blanket `any` where practical.
- Narrow select values before passing them to `StorageMode` and `LogLevel` handlers.
- Decide whether invalid/null select values are ignored or surfaced as explicit errors.
- Make `npm run build` the canonical production command.
- Ensure deployment never calls `build-only` directly.
- Include tests in an appropriate TypeScript project instead of excluding all tests from meaningful type verification.
- Pin the supported Node version in `package.json` and `.node-version`.

## Acceptance criteria

- `npm ci && npm run build` succeeds from a clean checkout on Node 22.
- `functions/` installs and builds from a clean checkout.
- No deployment workflow bypasses type checking.
- CI retains the compiler output as an artifact when a type check fails.
- The README documents one verified build path and the required environment variables.

## Acceptance
## Log
