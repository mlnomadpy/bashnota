---
id: f-authoritative-nota-load-errors-were-reported-as-success
kind: note
note_kind: finding
created: 2026-08-26T22:28:01Z
created_by: a-root
about: "[[041]]"
severity: major
---
# Authoritative nota load errors were reported as success
Evidence: src/features/nota/stores/nota.ts:371-389 catches Dexie/filesystem adapter read errors and returns this.items; src/features/bashhub/views/HomeView.vue:78 then treats that resolved promise as success and clears the visible error. Planned fix: typed thrown failure after retaining committed items; HomeView clears its alert only after a successful load and exposes an explicit accessible retry.
