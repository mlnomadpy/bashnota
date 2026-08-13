---
id: f-notatable-tabledata-does-not-round-trip-the-tracked-lossy-table-persistence-bug
kind: note
note_kind: finding
created: 2026-08-11T20:44:04Z
created_by: a-pm-porter-ztd7jc
about: "[[003]]"
severity: major
---
# notaTable.tableData does not round-trip (the tracked lossy table-persistence bug); port preserves it verbatim
table-block/TableExtension.ts: parseHTML is just { tag: 'div[data-type="data-table"]' } with NO getAttrs, and the tableData attr has no parseHTML, so on parse tableData always resets to its default (empty table). renderHTML serialises tableData only as TipTap's default attribute stringification (object -> '[object Object]'). This is the tracked, out-of-scope lossy TipTap-to-block-table persistence bug — NOT caused by TipTap. The like-for-like port reproduces it exactly; the notaTable round-trip test asserts the SURVIVING behavior (data-type + configured class) and documents that tableData is intentionally not preserved, rather than fixing it.
