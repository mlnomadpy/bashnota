---
id: d-sanitize-credential-bearing-url-values-and-object-keys-at-every-durable-boundary
kind: note
note_kind: decision
created: 2026-08-27T10:38:21Z
created_by: a-security-fixer-n8xfga
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
---
# Sanitize credential-bearing URL values and object keys at every durable boundary
## Chose
Sanitize credential-bearing URL values and object keys at every durable boundary
## Rejected
Only blank explicit token and api-key fields
## Because
Legacy Jupyter server addresses, kernel-cache keys, consolidated settings, and compatibility values can encode credentials in URL userinfo, query, or fragment components even when no secret-named field remains.
