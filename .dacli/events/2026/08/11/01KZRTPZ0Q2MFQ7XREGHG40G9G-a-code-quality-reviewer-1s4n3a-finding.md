---
id: 01KZRTPZ0Q2MFQ7XREGHG40G9G
kind: event
event_kind: finding
created: 2026-08-11T16:32:55Z
created_by: a-code-quality-reviewer-1s4n3a
about: "[[t-01KZRSX02H6GV2QTB510YBAD3D]]"
origin: src/features/editor/services/exportService.ts:185
applied: true
---
Error handling: 66 catches swallow the error via console-only; 3 empty catches; unguarded WS parse

749 catch blocks across src. Systematic gaps:
SWALLOWED (console-only, no user feedback, no rethrow, no recovery): 66 catch blocks across 36 files only call console.error/warn/log then continue. Hotspots: CodeBlockWithExecution.vue (6), ExecutableCodeBlock.vue (6), subfigure-block/SubfigureBlock.vue (3), referenceValidationService.ts (3), stores/sidebarStore.ts (3), SubNotaLinkSlashCommand.ts (3), AIErrorAnalyzer.vue (3). For code-execution blocks this means a failed run is logged to devtools but the user sees no error state.
EMPTY CATCH (error fully discarded): src/features/editor/services/exportService.ts:185 (katex render), :250, :282 — 'catch (e) { }'. Export silently drops content that fails to render with zero diagnostics.
COMMENT-ONLY CATCH (relies on side effects elsewhere, fragile): src/features/nota/components/references/ReferenceDialog.vue:75-77 ('// Error handling is done in saveBatch'); src/features/editor/components/blocks/executable-code-block/OutputRenderer.vue:257-259 ('// Use original content if parsing fails').
UNGUARDED PROMISE / NO try-catch: src/services/codeExecutionService.ts ws.onmessage (138-209) parses JSON.parse(event.data) and derefs content.data/content.traceback with no try-catch inside a Promise — a malformed kernel message rejects nothing and hangs the cell. 18 '.then(' call sites lack a paired '.catch(' (potential unhandled rejections).
RECOMMENDATION: route through the existing 'logger' service (already imported in many files) + surface user-facing error state; forbid empty/console-only catch via eslint no-empty + a custom rule.
