---
id: r-unprotected-master-can-merge-before-quality
kind: risk
created: 2026-08-26T14:10:58Z
created_by: a-root
impact: high
likelihood: high
---
# unprotected-master-can-merge-before-quality
## Indicators
- GitHub branch protection API returns 404
## Action
Task 027 must configure required stable Quality checks; meanwhile prohibit dacli pr --auto and manually observe CI before merge
