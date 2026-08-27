---
id: f-ai-and-jupyter-credentials-crossed-durable-and-url-boundaries
kind: note
note_kind: finding
created: 2026-08-27T02:31:34Z
created_by: a-security-fixer-rr8a25
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
severity: major
---
# AI and Jupyter credentials crossed durable and URL boundaries
Original evidence: src/features/ai/stores/aiSettingsStore.ts serialized apiKeys, src/features/editor/stores/aiActionsStore.ts serialized providerSettings.apiKeys, src/stores/settingsStore.ts serialized and exported unified AI/Jupyter credentials, src/features/jupyter/stores/jupyterStore.ts serialized server tokens, and src/features/jupyter/services/jupyterService.ts plus src/services/codeExecutionService.ts appended tokens to URLs.
