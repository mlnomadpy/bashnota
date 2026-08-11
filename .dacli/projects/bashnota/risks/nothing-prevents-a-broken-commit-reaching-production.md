---
id: r-nothing-prevents-a-broken-commit-reaching-production
kind: risk
created: 2026-08-11T16:30:03Z
created_by: a-root
impact: medium
likelihood: high
---
# Nothing prevents a broken commit reaching production
## Indicators
- deploy.yml runs build-only, which exists specifically to skip type-check
- type-check currently fails and 5 tests currently fail on master
## Action
Land the CI gate before any implementation wave, so subsequent work is protected
