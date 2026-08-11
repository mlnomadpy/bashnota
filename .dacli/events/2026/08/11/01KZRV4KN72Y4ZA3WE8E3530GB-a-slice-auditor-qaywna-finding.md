---
id: 01KZRV4KN72Y4ZA3WE8E3530GB
kind: event
event_kind: finding
created: 2026-08-11T16:40:22Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
Gemini API key leaks into the production console via error logging

GeminiProvider builds every endpoint as '...?key=${this.apiKey}' (src/features/ai/services/providers/geminiProvider.ts:40,55,84,132,157,443). On failure it logs the whole axios error: isAvailable() does logger.error('Gemini API not available:', error) at geminiProvider.ts:47, and the axios error object carries error.config.url which embeds the key. logger.error emits in ALL environments -- unlike log/info/warn it is NOT dev-gated (src/services/logger.ts:58-61). USER-VISIBLE: whenever a Gemini request errors (bad key, offline, 429, CORS), the user's Google API key is printed in plaintext to the browser devtools console in production, and to any console-capturing telemetry/session-replay. Parallels the security seat's Jupyter-token-in-URL finding (01KZRT7J0T) but for AI keys.
