---
id: f-new-ci-yml-and-existing-deploy-yml-both-run-npm-ci-which-will-fail-until
kind: note
note_kind: finding
created: 2026-08-11T17:17:47Z
created_by: a-fixer-5jrghe
about: "[[010]]"
severity: major
---
# New ci.yml and existing deploy.yml both run 'npm ci', which will FAIL until package-lock.json is regenerated after the 007 dep removals
This worktree (merges 002/003/004/007) has package.json with the 14 deps removed by task 007, but package-lock.json still lists them (grep: 0 in package.json vs 5+ in lock for radix-vue/localforage/vue-toast-notification/mathjax/remark-parse). 'npm ci' requires lock and package.json to be in sync and will error out. My ci.yml uses 'npm ci' per AC-2 (correct choice), and deploy.yml already used it before this task, so this is a PRE-EXISTING inherited blocker, not introduced here. My fixer sandbox forbids npm install, so I could not regenerate the lock. Every gate command was verified locally against the already-installed node_modules (type-check clean, vitest 338/338 + junit artifact, vite build OK, budget logic OK). OPERATOR: run 'npm install' at integration to regenerate package-lock.json, then commit it, before these workflows can go green on GitHub. Duplicate/overlap with sibling finding f-package-lock-json-is-now-out-of-sync-with-package-json-after-removing-14-deps.
