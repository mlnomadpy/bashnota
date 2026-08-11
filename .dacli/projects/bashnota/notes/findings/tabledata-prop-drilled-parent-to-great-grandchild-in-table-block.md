---
id: f-tabledata-prop-drilled-parent-to-great-grandchild-in-table-block
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/table-block/TableBlock.vue:328
source_event: 01KZRTFAX19MWKHGZ7WP9W36BQ
---
# tableData prop drilled parent-to-great-grandchild in table-block
The full TableData object is passed through 4 levels: TableBlock.vue:328 -> components/TableContent.vue:516 -> components/table/TableRow.vue:67 -> components/table/TableCell.vue:24, where TableCell only uses it to compute unique column values. Fix: provide the table data or a Pinia table store (one already exists: editor/stores/tableStore.ts) so TableCell reads it directly instead of re-binding at each of the 3 intermediate layers.
