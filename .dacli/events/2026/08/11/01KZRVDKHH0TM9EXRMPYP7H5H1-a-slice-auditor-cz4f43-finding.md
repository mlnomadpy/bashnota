---
id: 01KZRVDKHH0TM9EXRMPYP7H5H1
kind: event
event_kind: finding
created: 2026-08-11T16:45:17Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
UPGRADE: fix empty-table HTML export by adding a one-attribute renderHTML that emits the data-table-data the exporter already parses

The exporter ALREADY contains a full notaTable-to-HTML-table post-processor (exportService.ts:227-252) that reads a data-table-data attribute. The table extension just never emits it (TableExtension.ts:60-66 renders an empty div). Adding a minimal renderHTML that writes JSON.stringify(tableData) into data-table-data closes the loop with zero new export logic. The same one-attribute-renderHTML pattern fixes the executableCode (output/kernel/session attrs, ExecutableCodeBlockExtension.ts:10-55) and pipeline (nodes/edges/viewport, PipelineExtension.ts:34-76) HTML round-trip gaps. Cheap because the export CONSUMER already exists; only the producing attribute is missing. BONUS: add a TipTap-to-markdown serializer by inverting MarkdownParserService.convertToTiptap's existing node-type map, enabling the currently-missing markdown export path.
