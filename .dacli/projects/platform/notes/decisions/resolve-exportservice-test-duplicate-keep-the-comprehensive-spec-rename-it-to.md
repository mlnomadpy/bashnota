---
id: d-resolve-exportservice-test-duplicate-keep-the-comprehensive-spec-rename-it-to
kind: note
note_kind: decision
created: 2026-08-11T16:58:29Z
created_by: a-fixer-6jvajv
about: "[[004]]"
---
# Resolve exportService test duplicate: keep the comprehensive spec, rename it to exportService.test.ts, delete the small test.ts
## Chose
Resolve exportService test duplicate: keep the comprehensive spec, rename it to exportService.test.ts, delete the small test.ts
## Rejected
Keeping the 80-line exportService.test.ts, or keeping the .spec.ts filename
## Because
The two files test the same function exportNotaToHtml. The .spec.ts (342 lines, 8 cases) drives the real export pipeline with actual TipTap extensions + katex, covering text, sub-nota link rewriting, tables, bibliography+citation numbering, youtube, mermaid, theorem/math, and inline latex. The .test.ts (80 lines, 1 case) fully mocks generateHTML and only asserts citation-number post-processing plus presence of the static defaultTemplate.ts tooltip/event-listener strings — all of which are already covered: citation numbering by the spec bibliography test, and the static template by every spec export. So test.ts is a strict subset. Renamed spec->test to match the repo convention (24 .test.ts files, zero other .spec.ts). One authoritative file remains: exportService.test.ts. Suite stays green (350/350).
