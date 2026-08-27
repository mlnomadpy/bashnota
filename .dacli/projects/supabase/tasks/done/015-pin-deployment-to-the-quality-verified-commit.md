---
id: t-01M0D2NMJ4XHQDK38TF8JTXNKV
kind: task
created: 2026-08-19T13:16:49Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 1, probable: 1, pessimistic: 2}"
---
# Pin deployment to the Quality-verified commit
## So that
a successful Quality run can deploy only the exact commit it verified, never a newer untested branch tip
## Acceptance
- [x] The workflow_run deploy checkout explicitly uses github.event.workflow_run.head_sha
- [x] The successful-Quality conclusion guard and Supabase cutover/config gates remain enforced before build and deploy
- [x] A versioned regression test inspects the workflow and fails when checkout is unpinned or points at any other ref
- [x] Targeted regression test, typecheck, production build, backend-purity scan, and git diff check pass
## Log
- 2026-08-19T13:17:32Z claimed by a-codex-fixer-terra-aq3mgv
- 2026-08-19T13:32:21Z accepted by a-root
- 2026-08-19T13:32:21Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/supabase-015-pin-deployment-to-the-quality-verified-commit && npm run test:deploy-workflow && npm run type-check && npm run build-only && npm run check:backend-purity && git diff HEAD^ HEAD --check` (exit 0)
- 2026-08-19T13:32:21Z completed by a-root
