---
id: 01KZRV67RCYJATW1VZV6VV8HT7
kind: event
event_kind: finding
created: 2026-08-11T16:41:15Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
Raw console.log in production generation path; full Gemini response logged in dev

src/features/ai/components/composables/useAIGeneration.ts:67,71,77,81 use raw console.log (not the env-gated logger), so provider id, model state and readiness are printed to the console on every AI generation in PRODUCTION. Separately, geminiProvider.ts:65 does logger.log('Gemini API response:', JSON.stringify(response.data)) -- dev-gated so it only fires in development, but it dumps the entire model response (including the user's prompt echoes/content) to console. USER-VISIBLE: production console noise and minor prompt/response disclosure to anyone with devtools open. Part of the repo-wide 431 console.* count (perf/tooling seats) but these four are on the hot AI path.
