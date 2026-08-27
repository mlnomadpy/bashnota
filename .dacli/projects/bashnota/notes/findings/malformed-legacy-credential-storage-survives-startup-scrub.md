---
id: f-malformed-legacy-credential-storage-survives-startup-scrub
kind: note
note_kind: finding
created: 2026-08-27T11:20:12Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: moderate
origin: src/features/ai/stores/aiSettingsStore.ts:106
---
# Malformed legacy credential storage survives startup scrub
Malformed ai-settings and jupyter-servers JSON is logged but retained durably, so embedded credentials survive indefinitely outside successful parsing. Repair must remove/reset malformed values and test both legacy keys.
