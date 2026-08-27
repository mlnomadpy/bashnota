---
id: f-rich-text-persistence-truncates-inline-runs-and-nested-containers
kind: note
note_kind: finding
created: 2026-08-19T14:38:34Z
created_by: a-root
about: "[[012]]"
severity: major
---
# Rich text persistence truncates inline runs and nested containers
PM-to-block and import paths at src/features/nota/composables/useBlockEditor.ts:137-225 and src/features/nota/stores/blockStore.ts:892-966 retain only content[0].text or flatten containers, losing marks, links, later runs, nested lists, and quotes.
