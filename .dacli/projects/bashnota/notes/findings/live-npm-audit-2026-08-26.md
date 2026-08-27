---
id: f-live-npm-audit-2026-08-26
kind: note
note_kind: finding
created: 2026-08-26T14:13:15Z
created_by: a-root
about: "[[030]]"
severity: major
origin: package-lock.json:1
---
# live-npm-audit-2026-08-26
Live npm advisory check on 2026-08-26: production tree reports 26 vulnerabilities (12 high, 12 moderate, 2 low), including direct/runtime axios and DOMPurify advisories; full tree reports 42 (2 critical, 22 high, 15 moderate, 3 low), including Vitest/Vite/Rollup/build-chain advisories. npm reports non-force fixes for most; @vueuse/head/unhead may require a breaking resolution. Treat task030 as a must-fix dependency wave with clean npm ci, runtime regression gates, and a committed lockfile.
