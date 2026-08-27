---
id: t-01M0F8AY1W3R455ZG5SPV8Z4R2
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 10
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Feature request: consolidate duplicate services and complete storage migration
## Context
Adopted from GitHub issue #10.

## Objective

Reduce duplicated systems, complete the storage migration, and define stable module boundaries for the editor, storage, AI, Jupyter, publishing, and settings domains.

## Known consolidation areas

- `src/features/ai/stores/aiActionsStore.ts` and `src/features/editor/stores/aiActionsStore.ts`
- `src/features/jupyter/services/jupyterService.ts` and `src/services/codeExecutionService.ts`
- Legacy and unified settings components
- Legacy nota persistence and the storage/database adapters
- Feature-flagged navigation and migration paths

## Required changes

- Write a current-state dependency map before moving code.
- Choose one owner and public interface for each domain.
- Define storage backend contracts and versioned `.nota` schemas.
- Finish block-based create, update, copy, search, word-count, and migration TODOs.
- Add migration checkpoints, rollback, resumability, and compatibility tests.
- Consolidate AI action state without changing user-visible behavior.
- Consolidate Jupyter connection, kernel, execution, cancellation, and output parsing responsibilities.
- Remove legacy paths only after parity tests prove equivalence.
- Replace broad `any` and duplicated models with shared domain types.
- Record major decisions as ADRs and keep refactors split into reviewable PRs.

## Acceptance criteria

- Each domain has one documented entry point and clear dependency direction.
- Storage backends pass the same contract suite.
- Existing user data migrates forward and can recover from interrupted migration.
- Duplicate stores/services are removed without reducing tested functionality.
- Architecture documentation matches the actual tree and includes failure/recovery flows.

## Acceptance
## Log
