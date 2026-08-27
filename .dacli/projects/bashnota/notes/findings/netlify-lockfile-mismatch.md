---
id: f-netlify-lockfile-mismatch
kind: note
note_kind: finding
created: 2026-08-26T14:11:15Z
created_by: a-root
about: "[[027]]"
severity: moderate
origin: netlify.toml:1
---
# netlify-lockfile-mismatch
Netlify invokes pnpm although the repository authority is package-lock.json/npm and no pnpm-lock.yaml or pinned packageManager exists. Use npm ci && npm run build or commit/pin the pnpm toolchain and frozen lock.
