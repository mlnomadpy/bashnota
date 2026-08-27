---
id: f-backend-purity-scanner-misses-ignored-firebase-artifacts-and-stale-setup
kind: note
note_kind: finding
created: 2026-08-19T12:04:19Z
created_by: a-supabase-local-reviewer-m9v0p1
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: moderate
---
# Backend purity scanner misses ignored Firebase artifacts and stale setup configuration
scripts/check-backend-purity.mjs:24-25 enumerates with rg --files, which respects .gitignore; .gitignore:141-147 ignores .firebaserc, firebase.json, .firebase/, and emulator-data/, so generated legacy artifacts can exist while npm run check:backend-purity passes. The scan roots also omit .gitignore and CONTRIBUTING.md, while CONTRIBUTING.md:71-76 still instructs installing the removed functions package. Expand enumeration/config coverage and remove stale setup entries.
