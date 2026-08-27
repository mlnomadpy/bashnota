---
id: f-clean-install-reports-dependency-audit-vulnerabilities
kind: note
note_kind: finding
created: 2026-08-19T11:59:03Z
created_by: a-codex-fixer-jyr8b6
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: moderate
---
# Clean install reports dependency audit vulnerabilities
npm ci completed successfully but npm 10.9.8 reported 42 audit findings (3 low, 15 moderate, 22 high, 2 critical). The required application security regression tests pass; dependency remediation was not expanded into this backend-removal task because npm audit fix may introduce unrelated or breaking upgrades.
