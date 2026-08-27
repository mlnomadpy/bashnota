---
id: f-credential-bearing-url-strings-survive-durable-settings-and-jupyter-persistence
kind: note
note_kind: finding
created: 2026-08-27T10:33:54Z
created_by: a-security-fixer-n8xfga
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
severity: major
---
# Credential-bearing URL strings survive durable settings and Jupyter persistence
src/utils/credentialPersistence.ts:39 returns primitive strings unchanged; src/features/jupyter/stores/jupyterStore.ts:38-40 persists raw server.ip and kernel-cache keys. Thus URL userinfo/query/fragment credentials can remain in consolidated, legacy, jupyter-servers, and jupyter-kernels storage.
