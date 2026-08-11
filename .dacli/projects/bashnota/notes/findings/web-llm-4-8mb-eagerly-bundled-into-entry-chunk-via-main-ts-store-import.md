---
id: f-web-llm-4-8mb-eagerly-bundled-into-entry-chunk-via-main-ts-store-import
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
source_event: 01KZRT661F9FGFS11KPCVNM6T7
---
# web-llm (~4.8MB) eagerly bundled into entry chunk via main.ts store import
node_modules/@mlc-ai/web-llm/lib/index.js is 5,064,597 bytes (~4.83MB raw) — roughly HALF of the 10,057KB entry chunk. It is eagerly pulled into the entry because the eager import chain is: main.ts:64 imports '@/features/ai/stores/aiSettingsStore' -> aiSettingsStore.ts:3 'import { aiService } from @/features/ai/services' -> services/index.ts:22 re-exports WebLLMProvider -> aiService.ts:14 'import { WebLLMProvider }' -> providers/webLLMProvider.ts:1 'import * as webllm from @mlc-ai/web-llm'. Because this is a top-level static import reachable from main.ts, Rollup places all of web-llm (incl. prebuiltAppConfig model list + tokenizer glue) in the entry chunk that every user downloads on first paint. web-llm is only needed when a user explicitly selects the in-browser WebLLM provider. Fix: convert webLLMProvider.ts to 'const webllm = await import(@mlc-ai/web-llm)' inside the method that first needs it, so it becomes its own lazy chunk. Verified present in build: 'MLCEngine'/'prebuiltAppConfig' markers found only in dist/assets/index-C-xGz-8J.js.
