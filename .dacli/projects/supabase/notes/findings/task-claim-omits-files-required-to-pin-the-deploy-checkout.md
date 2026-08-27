---
id: f-task-claim-omits-files-required-to-pin-the-deploy-checkout
kind: note
note_kind: finding
created: 2026-08-19T13:22:46Z
created_by: a-codex-fixer-terra-a6k9dx
about: "[[015]]"
severity: major
---
# Task claim omits files required to pin the deploy checkout
dacli commit refused the completed change because this task claims only scripts/check-deploy-workflow-pin.self-test.mjs, but acceptance requires .github/workflows/deploy.yml to set the checkout ref and package.json to expose the regression command. Evidence: dacli commit output on this branch.
