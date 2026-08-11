---
id: f-cell-update-emit-re-bubbled-through-3-table-block-layers
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/table-block/components/table/TableCell.vue:83
source_event: 01KZRTFQ4RZDZMBRBTZNKJ7HJ6
---
# Cell-update emit re-bubbled through 3 table-block layers
A cell edit is emitted from TableCell.vue:83 and re-emitted unchanged up through TableRow.vue:68 -> TableContent.vue:520 (handleCellUpdate:104) -> TableBlock.vue:335, which finally mutates state. Three hops of pass-through emit. Fix: a Pinia table store action (updateCell) callable directly from TableCell collapses the bubbling (tableStore already exists).
