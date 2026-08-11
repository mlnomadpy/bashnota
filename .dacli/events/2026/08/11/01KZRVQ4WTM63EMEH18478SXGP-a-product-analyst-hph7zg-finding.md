---
id: 01KZRVQ4WTM63EMEH18478SXGP
kind: event
event_kind: finding
created: 2026-08-11T16:50:29Z
created_by: a-product-analyst-hph7zg
about: "[[010]]"
origin: agent
applied: false
---
Docs contradict code: README overstates AI providers, file-watching, and PDF; all status docs mis-dated 2024

Contradictions between docs and what ships.

1. AI PROVIDERS. README.md:'AI: OpenAI, Gemini, Claude'. CODE: providers are Gemini, Ollama, WebLLM (providerFactory.ts:26-44,70). OpenAI is a dead reference (config string only, aiActionsStore.ts:517; no openaiProvider.ts, factory throws 'Unknown provider'). Anthropic/Claude: ABSENT entirely. README lists the two providers that do NOT exist and omits the two that do (Ollama, WebLLM in-browser).

2. REAL-TIME FILE WATCHING. README.md key feature: 'Real-time file watching: Edit .nota files with any text editor' and 'Real-time synchronization'. CODE: FileWatcherService is never started in the running app (sibling a-data-reviewer confirmed; fileSystemBackend.ts:264 TODO 'Implement file watching'). The advertised headline capability is inert.

3. PDF EXPORT. Not claimed in README but implied by 'export'; ExportDialog.vue:76-90 shows PDF as 'Coming soon' cursor-not-allowed. HTML/Markdown/.nota work.

4. DATE FALSIFICATION across ALL status docs. COMPLETE_MIGRATION_SUMMARY.md dated 'December 10, 2024'; docs/MISSING_FEATURES.md and docs/UX_UI_IMPROVEMENTS.md dated 'December 2024'. But git first commit is 2025-02-04 -- the codebase did not exist in Dec 2024. The migration these docs describe happened Aug-Dec 2025 (git: 88 commits in 2025-12). Every planning doc is stamped a full year before the code existed; anyone sequencing work by these dates is misled. The real 'last touched' is 2025-12-13.

5. VIBEME.md path rot. VIBEME.md instructs devs to look in 'src/components/editor/blocks/' -- that path does not exist; blocks live under src/features/editor/components/... (FSD layout). The onboarding doc points at a pre-migration tree.

6. BLOCK COUNT. Docs claim '13 block types implemented'. Actual insertable advanced blocks number ~15 (math, theorem, citation, bibliography, subfigure, youtube, table, notaTable, confusionMatrix, mermaid[dead], drawio, pipeline, aiGeneration[orphaned], subNotaLink, markdown-insert) plus primitives. Mermaid is listed as implemented but is a dead no-op (suggestion.ts:589-593).

7. AI SIDEBAR STATE. UX_UI_IMPROVEMENTS.md:23-27 describes the AI sidebar 'Current State: conversation history with streaming responses' as working; in reality its generation path is orphaned/unreachable (see orphaned-capability finding).
