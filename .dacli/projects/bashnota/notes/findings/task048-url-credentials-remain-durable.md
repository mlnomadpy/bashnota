---
id: f-task048-url-credentials-remain-durable
kind: note
note_kind: finding
created: 2026-08-27T10:32:04Z
created_by: a-root
about: "[[bashnota/048-redact-credentials-and-harden-ai-and-jupyter-trust-boundaries]]"
severity: major
origin: src/utils/credentialPersistence.ts:23
---
# Task048 URL credentials remain durable
Primitive URL strings retain userinfo/query/fragment credentials and jupyter-servers persists raw ip. Rewrite consolidated, legacy, and jupyter-servers keys; test sentinel absence across every durable key.
