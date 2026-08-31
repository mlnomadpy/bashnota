---
id: t-01M1CQJ1F9PGSJ7T9WMA8BAK2S
kind: task
created: 2026-08-31T20:18:18Z
created_by: a-root
owner: a-root
github:
  issue: 82
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 82
  body_digest: sha256:d13c35efb6fd37e1f271a8c3dff9c79b76ab62ea7c292c27188659b431cde0fe
  actor: a-root
  imported_at: 2026-08-31T20:18:18Z
---
# Bug: nota selection checkboxes do not activate batch actions
## Context
Adopted from GitHub issue #82.

## Confirmed browser finding

On Home with three notas, selecting an individual row changes the checkbox to checked, but no selected-count label or BatchActionsToolbar appears. The state remains visually checked after waiting, while the parent still behaves as if nothing is selected.

## Source path

NotaTable emits select-nota from src/features/nota/components/NotaTable.vue:119-122. HomeNotaList expects useNotaList selection state and only mounts BatchActionsToolbar when hasSelection is true at src/features/bashhub/components/HomeNotaList.vue:407-421.

## Acceptance criteria

- Row and select-all checkboxes update the canonical selection set.
- Checked visual state, selected count, indeterminate state, and toolbar visibility remain synchronized.
- Batch favorite/tag/delete actions receive the exact selected IDs.
- Add Playwright coverage for one row, select all, clear selection, and selection after filtering/pagination.

## Acceptance
- [ ] Row and select-all checkboxes update the canonical selection set.
- [ ] Checked visual state, selected count, indeterminate state, and toolbar visibility remain synchronized.
- [ ] Batch favorite/tag/delete actions receive the exact selected IDs.
- [ ] Add Playwright coverage for one row, select all, clear selection, and selection after filtering/pagination.
## Log
