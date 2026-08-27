---
id: f-task-014-clean-install-retains-42-dependency-audit-findings
kind: note
note_kind: finding
created: 2026-08-19T12:32:53Z
created_by: a-codex-fixer-1a6ne8
about: "[[014]]"
severity: moderate
---
# Task 014 clean install retains 42 dependency audit findings
npm ci succeeded from package-lock.json but npm 10.9.8 reported 42 audit findings: 3 low, 15 moderate, 22 high, and 2 critical. No dependency remediation was attempted because npm audit fix --force can introduce unrelated breaking upgrades; application security regressions remain in the verification matrix.
