---
id: g-bashnota
kind: note
note_kind: ref
created: 2026-08-11T16:29:45Z
created_by: a-root
---
# Glossary
- **nota** — The unit document. Persisted as a row in the Dexie 'notas' table AND/OR as a .nota file on disk. Carries a 'content' field holding serialized TipTap JSON. Not a 'note' — the product spells it nota throughout.
- **block** — A typed node inside a nota. Exists in two incompatible representations: as a TipTap node inside Nota.content, and as a row in one of 22 typed Dexie tables indexed by the blockStructures table. Which is authoritative is an open question this review must answer.
- **block structure** — A row in the blockStructures Dexie table describing the ordered tree of blocks belonging to one nota. The index that makes the 22 typed block tables reassemblable into a document.
- **bashhub** — The social/publishing half of the product: home feed, public nota pages at /p/:id, user profiles at /@:userTag. Backed by Firebase, not by local storage.
- **storage mode** — Which backend serves notas: 'db' (Dexie/IndexedDB, the legacy default) or 'filesystem' (File System Access API writing .nota files). Selected in advanced settings; gated by the USE_NEW_STORAGE feature flag.
- **the stranded migration** — Shorthand for the three unfinished forks flagged in useFeatureFlags.ts (storage, navigation, settings), all defaulting to false, plus the older unflagged fork between Nota.content and the normalized block tables.
- **FSD** — Feature-Sliced Design. The intended layout: src/features/<slice>/{components,composables,services,stores,types,views}. Slices should not deep-import each other's internals.
- **executable code block** — A nota block whose contents are sent to a Jupyter kernel and whose output is rendered back inline by OutputRenderer.vue. The product's core differentiator and its largest trust boundary.
