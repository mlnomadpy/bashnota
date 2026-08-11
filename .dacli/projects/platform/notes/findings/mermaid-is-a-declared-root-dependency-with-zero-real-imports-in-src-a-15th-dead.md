---
id: f-mermaid-is-a-declared-root-dependency-with-zero-real-imports-in-src-a-15th-dead
kind: note
note_kind: finding
created: 2026-08-11T17:15:13Z
created_by: a-fixer-kxmqy9
about: "[[008]]"
severity: minor
---
# mermaid is a declared root dependency with zero real imports in src (a 15th dead dep beyond task 007's list)
package.json:79 declares mermaid ^11.4.1, but a whole-repo grep shows NO import of the package: 'grep -rn import src | grep -i mermaid' returns nothing, and there is no 'from mermaid' / import('mermaid') anywhere in src. Every 'mermaid' occurrence in src is the string literal block type (blocks.ts:253, blockStore.ts:756/945, MarkdownParserService.ts:327, notaExtensionService.ts:94, db.ts:144, suggestion.ts:585) — a node type that is defined and inserted but never rendered by the actual mermaid library. Consequently the manualChunks 'mermaid' rule I added (acceptance #2 requires the rule be DEFINED) produces no chunk, because mermaid never enters the module graph. Confirmed by the build: dist/assets has no mermaid-*.js. This is analogous to the 14 dead deps task 007 removed; mermaid rendering is either unwired or was never implemented. Out of scope to remove here (I kept the manualChunks rule so the split is correct the moment mermaid is actually imported). Recommend removing mermaid from package.json OR wiring a real MermaidBlock renderer as a follow-up.
