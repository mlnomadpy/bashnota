---
id: 01KZRVQQNGBNGJA5B1S4CQ70HH
kind: event
event_kind: finding
created: 2026-08-11T16:50:49Z
created_by: a-product-analyst-hph7zg
about: "[[010]]"
origin: agent
applied: false
---
MISSING_FEATURES.md and UX_UI_IMPROVEMENTS.md are partly stale: line refs drifted, block-system premise now false

Evaluating the two prior attempts at this job.

WERE THEY RIGHT WHEN WRITTEN? Largely yes as a wishlist -- most 'missing' items (collaboration, workspaces, more export formats, mobile, a11y, global command palette, saved searches) are genuinely absent and still absent. The UX pain points (no bubble menu, flat AI-action list, no skeletons, search not instant) are real and mostly still true.

WHAT IS NOW STALE / WAS WRONG:

1. STALE LINE REFERENCES (doc written against an older tree). MISSING_FEATURES.md:31-33 cites the legacy-conversion TODOs at nota.ts lines 297/331/426; they are now at 1319/1379/1439. useNotaFilters content-search TODO cited at line 89, actually line 118. useNotaFiltering cited line 52, actually line 34. Anyone grepping those line numbers finds nothing.

2. BLOCK-SYSTEM PREMISE NOW FALSE. MISSING_FEATURES.md:24-27 says 'Block-based storage exists but not fully utilized / Legacy content conversion to blocks incomplete', listing block completion as CRITICAL/blocking (line 705). Reality: the 22-table block system is now the AUTHORITATIVE and live persistence path (blockStore.ts + db.ts wired through NotaEditor.vue:237-254; Nota has no persisted content field). Block storage IS fully utilized. Only the clone-published->blocks sub-path remains stubbed (nota.ts:1319/1379/1439). So the single biggest 'critical' item is effectively done.

3. STUBS THE DOCS DID NOT FLAG (regressions/incompleteness introduced by the migration, invisible to a Dec-labeled doc): mermaid slash command is a dead no-op; aiGeneration block is orphaned; the entire AI chat sidebar generation path is orphaned; /favorites route orphaned; migration engine orphaned. These are more urgent than most wishlist items because they are *broken existing surfaces*, not absent features.

4. ITEMS SINCE PARTIALLY ADDRESSED: 'Code Generation / error explanation / fix suggestions' (MISSING_FEATURES AI section) now EXIST and are reachable (editor/stores/aiActionsStore.ts:171-382, fix-error at :240). ipynb IMPORT now exists (useNotaImport.ts:83) though the doc lists it as missing.

RECOMMENDATION: do not plan from these docs' line numbers or their 'block system incomplete' framing. Their feature *wishlist* is still a valid backlog; their *status assessment* is a year stale and predates the block migration completing.
