---
id: f-rules-only-legacy-collections-require-production-export-discovery
kind: note
note_kind: finding
created: 2026-08-13T21:45:46Z
created_by: a-supabase-implementer-5jrb3a
about: "[[001]]"
severity: moderate
---
# Rules-only legacy collections require production export discovery
Firestore rules/indexes define notas and notaVotes (firestore.rules:127, firestore.rules:241; firestore.indexes.json:50), but the audited active client writes local notas through IndexedDB/filesystem and stores current nota votes in publishedNotas.votes (src/features/bashhub/services/statisticsService.ts:125). Export must inventory and quarantine any legacy rows rather than silently discard or merge them.
