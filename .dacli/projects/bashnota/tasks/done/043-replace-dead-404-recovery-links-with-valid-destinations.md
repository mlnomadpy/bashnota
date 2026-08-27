---
id: t-01M0N6FGT8JVTVYV36RJ52HVC9
kind: task
created: 2026-08-22T16:57:18Z
created_by: a-root
owner: a-root
priority: should
estimate: "{optimistic: 0.5, probable: 1, pessimistic: 2}"
github:
  issue: 19
  repo: mlnomadpy/bashnota
blocked_by: "[[bashnota/045]]"
---
# Replace dead 404 recovery links with valid destinations
## Acceptance
- [x] Every action rendered by NotFound resolves to a registered route or an explicit valid external support destination
- [x] A router-mounted regression proves the recovery actions do not return to the catch-all page
- [x] Typecheck, focused tests, build, and diff-check pass
## Log
- 2026-08-26T22:56:33Z claimed by a-root
- 2026-08-26T23:05:38Z blocked: blocked_by [[bashnota/045]] Independent review passed; GitHub publication/landing waits for the deterministic export-security gate repair to avoid known false-red Quality.
- 2026-08-27T00:23:41Z claimed by a-root
- 2026-08-27T00:47:59Z accepted by a-root
- 2026-08-27T00:47:59Z closed WITHOUT verification — no --verify command was given
- 2026-08-27T00:47:59Z deliverable: dacli/043-replace-dead-404-recovery-links-with-valid-destinations is merged into master
- 2026-08-27T00:47:59Z completed by a-root
- 2026-08-27T01:04:13Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/33 (event 01M10AF14Y5G31QDZZQWDFV03H)
- 2026-08-27T01:04:13Z a-root: Landing policy override: mode=pr base=master (event 01M10AZEZ9745TY2TRM0TR655S)
- 2026-08-27T01:04:13Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/33 at merge commit 7208cbaeb30b9a5053e230cb9f801ba5f500a3a2 into master (event 01M10AZQ7J1DRYT224TF0CAR4Y)
