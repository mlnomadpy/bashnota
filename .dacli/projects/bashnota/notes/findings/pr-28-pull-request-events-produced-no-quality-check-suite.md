---
id: f-pr-28-pull-request-events-produced-no-quality-check-suite
kind: note
note_kind: finding
created: 2026-08-26T15:28:46Z
created_by: a-root
about: "[[t-01M0Z7KWRE652XYFQ1YXJQX19Q]]"
severity: major
---
# PR 28 pull_request events produced no Quality check suite
GitHub recorded opened and reopened events for same-repo PR 28 at exact head 48f98f8, Actions is enabled and Quality is active with pull_request trigger, but the commit has zero check suites and workflow run queries remain empty. Merge is held fail-closed pending an observable green run.
