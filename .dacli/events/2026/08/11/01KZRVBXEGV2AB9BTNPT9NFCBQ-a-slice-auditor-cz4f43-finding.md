---
id: 01KZRVBXEGV2AB9BTNPT9NFCBQ
kind: event
event_kind: finding
created: 2026-08-11T16:44:21Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
HTML export: notaTable exports EMPTY in production (attribute mismatch, silently swallowed); a unit test masks it by mocking a different render shape

exportService.ts:228 reads the DOM attr data-table-data, but the real TableExtension stores its data in a tableData OBJECT attribute with no custom renderHTML (TableExtension.ts:39-50, renderHTML :60-66 emits an empty div). So generateHTML serializes the object to tableData='[object Object]'; the exporter's fallback JSON.stringify(getAttribute('tableData')) yields '[object Object]', JSON.parse throws, and the error is silently caught at exportService.ts:250 -> the output is an empty div[data-type=data-table]. USER-VISIBLE: exporting any nota containing a data table produces an empty table. This is NOT caught by tests because __tests__/exportService.spec.ts:103 mocks notaTable to emit data-table-data (a shape the real extension never produces). Same test-masking pattern hides two more: spec :119 mocks drawIo with a .drawio-diagram class and :132 adds a mermaid node -- neither reflects reality (see the export-placeholders finding).
