---
id: p-pm
kind: project
created: 2026-08-11T17:49:26Z
created_by: a-root
status: active
stage: definition
---
# ProseMirror migration
## Goal
Remove TipTap entirely and rebuild the editor directly on ProseMirror, owner decision recorded in the editor project. ProseMirror STAYS — it is the actual editor engine; only the TipTap wrapper is removed. Scope: 58 files importing @tiptap/*, 12 custom Node.create definitions, 6 Extension.create definitions, 11 stock extensions, and 3 TipTap-coupled third-party packages (tiptap-markdown, tiptap-unique-id, @rcode-link/tiptap-drawio). The Vue-to-ProseMirror node view bridge must be built in-house and is the highest-risk component.
## Constraints
- ProseMirror is NOT being removed. Only the TipTap wrapper is.
- Vue 3 + TypeScript + Vite + Pinia. No other framework changes.
- The editor must stay working at every commit. No big-bang cutover.
- Every phase ends with a green `npx vite build` and `npx vitest run`.
- One simple command per Bash call — the sandbox rejects compound commands.
- Never run npm ci/install; node_modules is already provisioned in your worktree.

## Out of scope
- Fixing the lossy TipTap-to-block-table persistence bug. It is tracked separately
  and is NOT caused by TipTap. Do not conflate the two migrations.
- Adding Yjs or collaboration. Later, on top of this.
- Redesigning any block's UI or behaviour. This is a like-for-like port.

## Success criteria
- Zero `@tiptap/*` imports remain in src.
- All @tiptap and TipTap-coupled packages removed from package.json.
- prosemirror-* packages become DIRECT dependencies (today they are transitive via @tiptap/pm).
- Every block type behaves as it did before, proven by tests written during the port.

## Codebase map

### What TipTap actually provides here, measured
| API | uses | replacement |
|---|---|---|
| `@tiptap/vue-3` | 52 | in-house Vue node-view bridge + useEditor composable |
| `@tiptap/core` | 27 | in-house defineNode/defineExtension over ProseMirror NodeSpec |
| `parseHTML` / `renderHTML` / `addAttributes` | 116 | compile to ProseMirror NodeSpec parseDOM/toDOM/attrs |
| `VueNodeViewRenderer` / `NodeViewWrapper` | 55 | the in-house bridge — HIGHEST RISK |
| `useEditor` | 17 | thin composable over `new EditorView` |
| `addCommands` | 12 | plain functions over `(state, dispatch)` |
| `addProseMirrorPlugins` | 5 | already native ProseMirror — pass straight through |
| `@tiptap/pm/*` | 11 | already raw ProseMirror; just re-point the import |

### The 12 custom nodes to port
citation-block/CitationExtension.ts, confusion-matrix/ConfusionMatrixExtension.ts,
math-block/math-extension.ts, pipeline/PipelineExtension.ts,
subfigure-block/subfigure-extension.ts, table-block/TableExtension.ts,
theorem-block/theorem-extension.ts, youtube-block/YoutubeExtension.ts,
youtube-block/youtube-extension.ts (NOTE: two youtube extensions exist, 156 and 79 LOC —
resolve which is live before porting), extensions/NotaTitleExtension.ts,
extensions/PageLinkExtension.ts, extensions/SubNotaLinkExtension.ts

### The 6 extensions to port
Commands.ts, ContextMenu.ts, DragHandle.ts, DragHandlePlugin.ts,
MarkdownExtension.ts, SubNotaLinkSlashCommand.ts
ContextMenu/DragHandle already use raw ProseMirror Plugin/PluginKey — those are near-free.

### Stock extensions map almost 1:1 onto official ProseMirror packages
This is the good news and should shape the plan. Already installed transitively:
- prosemirror-schema-basic -> document, paragraph, text, blockquote, code_block,
  horizontal_rule, heading, image, hard_break, and the em/strong/code/link marks
- prosemirror-schema-list -> bullet_list, ordered_list, list_item + list commands
- prosemirror-tables -> the entire table stack (replaces 4 @tiptap/extension-table* packages)
- prosemirror-history -> undo/redo
- prosemirror-dropcursor, prosemirror-gapcursor -> as-is
- prosemirror-commands, prosemirror-keymap, prosemirror-inputrules -> keybindings and markdown-style input rules
- prosemirror-markdown -> markdown serialize/parse

Genuinely missing from ProseMirror and needing hand-written code:
- placeholder (~30 line decoration plugin)
- task list / task item (a checkbox node + list integration)
- suggestion / slash commands (@tiptap/suggestion, 2 call sites) — no PM equivalent
- unique node IDs (tiptap-unique-id) — a plugin appending IDs on transaction
- drawio block (@rcode-link/tiptap-drawio)

### Third-party packages that are TipTap-coupled and must also be replaced
- tiptap-markdown -> depends on prosemirror-markdown + @tiptap/core. Use prosemirror-markdown directly.
- tiptap-unique-id -> depends on @tiptap/core + @tiptap/pm. Hand-write the plugin.
- @rcode-link/tiptap-drawio -> depends on @tiptap/extension-image + core + pm. Port as a PM node.

### Verified baseline on master (do not re-measure)
- Entry chunk 1,938.27 kB / 552.19 kB gzip after the web-llm split.
- type-check passes, 24 test files / 338 tests pass, build succeeds.
- eslint works; 604 violations were triaged on a separate branch.
