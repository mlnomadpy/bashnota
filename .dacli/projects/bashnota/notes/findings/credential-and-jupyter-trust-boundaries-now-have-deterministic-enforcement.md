---
id: f-credential-and-jupyter-trust-boundaries-now-have-deterministic-enforcement
kind: note
note_kind: finding
created: 2026-08-27T02:31:34Z
created_by: a-security-fixer-rr8a25
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
severity: major
---
# Credential and Jupyter trust boundaries now have deterministic enforcement
src/utils/redactSensitiveData.ts:3-67 recursively redacts keyed secrets, provider-key formats, bearer tokens, identity JWTs, URL query/fragment credentials, Error stacks and causes; src/utils/credentialPersistence.ts:1-25 strips AI/Jupyter credentials from durable settings; src/features/jupyter/services/jupyterSecurity.ts:21-68 requires HTTPS/WSS, explicit remote confirmation, and execution authority disclosure; src/features/ai/services/providers/geminiProvider.ts:38-95 uses x-goog-api-key headers. Mutation test reintroduced AI serialization and the persistence regression failed. Full Vitest: 601 passed/2 skipped; type-check, build, backend purity, repository hygiene, and focused 41/41 passed.
