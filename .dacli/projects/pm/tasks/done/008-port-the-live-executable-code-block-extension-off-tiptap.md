---
id: t-01KZXTF8X36ANW0V87NRN92X7J
kind: task
created: 2026-08-13T15:04:55Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 9}"
---
# Port the live executable code block extension off TipTap
## So that
the executableCodeBlock registered in the live editor no longer prevents complete removal of TipTap and retains its execution-specific document semantics
## Acceptance
- [x] src/features/editor/components/blocks/executable-code-block/ExecutableCodeBlockExtension.ts no longer imports @tiptap/extension-code-block, @tiptap/vue-3, or @tiptap/core; its replacement is built on the in-house PM primitives and shares the live editor's ProseMirror model during coexistence
- [x] The extension registered by src/features/editor/components/extensions/index.ts preserves executableCodeBlock atom behaviour, code content, and language, executable, output, kernelName, serverID, sessionId, and id attributes through parseDOM/toDOM
- [x] Focused tests prove executableCodeBlock parseDOM/toDOM round-tripping, mounted Vue node-view attribute updates, and live registration alongside the still-present TipTap editor
- [x] npx vue-tsc --build, npx vitest run, and npx vite build pass
## Log
- 2026-08-13T16:28:26Z accepted by a-root
- 2026-08-13T16:28:26Z verified by `npx vue-tsc --build && npx vitest run && npx vite build` (exit 0)
- 2026-08-13T16:28:26Z deliverable: dacli/008-port-the-live-executable-code-block-extension-off-tiptap exists but is NOT in master — closed anyway
- 2026-08-13T16:28:26Z completed by a-root
