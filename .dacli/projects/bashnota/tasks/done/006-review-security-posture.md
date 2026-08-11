---
id: t-01KZRSXR1YDMQZS0GCG1D4WSGR
kind: task
created: 2026-08-11T16:19:08Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Review: security posture
## Acceptance
- [x] Traces every path where untrusted content reaches innerHTML or v-html and states whether DOMPurify actually covers it, with file:line
- [x] Audits firestore.rules and storage.rules against the read/write patterns the client actually performs, naming any rule that is more permissive than the client needs
- [x] Assesses the code-execution path (codeExecutionService, jupyterService) for injection and for what a malicious .nota file could do when opened
- [x] Assesses File System Access API handle persistence in directoryHandleStorage.ts for scope-escalation and stale-permission risk
- [x] Confirms no secrets are committed and that .env handling in deploy.yml does not leak into the built bundle
- [x] Every finding is filed via 'dacli note add finding' with an --origin of file:line, severity stated as critical/high/medium/low
## Log
- 2026-08-11T16:20:16Z claimed by a-security-reviewer-9sxqs0
- 2026-08-11T16:37:36Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T16:37:36Z closed WITHOUT verification — no --verify command was given
- 2026-08-11T16:37:36Z deliverable: no dacli/006-review-security-posture branch — nothing to check against master
- 2026-08-11T16:37:36Z completed by a-root
- 2026-08-11T16:37:41Z finding by a-security-reviewer-9sxqs0: Stored XSS: code-output v-html sinks in OutputRenderer.vue are unsanitized (event 01KZRT68YHM6455JJS4NZFA948)
- 2026-08-11T16:37:41Z finding by a-security-reviewer-9sxqs0: Safety iframe is not a sandbox: allow-scripts + allow-same-origin on same-origin doc.write (event 01KZRT6H0CM394RDY40JAT3D5D)
- 2026-08-11T16:37:41Z finding by a-security-reviewer-9sxqs0: XSS: ErrorDisplay.vue renders execution error string via unescaped v-html (event 01KZRT6N9DTZG3RZ1DP8H1T7XY)
- 2026-08-11T16:37:41Z finding by a-security-reviewer-9sxqs0: Firestore /users read rule leaks every user's document to any authenticated user (event 01KZRT6XKEA3G6APCCCY5WFSYD)
- 2026-08-11T16:37:41Z finding by a-security-reviewer-9sxqs0: Firestore: any authenticated user can inflate stats/votes and forge viewer records (event 01KZRT75X39NQ6322HFYPVZAFT)
- 2026-08-11T16:37:41Z finding by a-security-reviewer-9sxqs0: Jupyter token sent in URL query, forced over http, and logged (event 01KZRT7J0TRMTN1M2PSDVM3M5P)
- 2026-08-11T16:37:41Z finding by a-security-reviewer-9sxqs0: No committed secrets; VITE_ Firebase config in bundle is public-by-design, not a leak (event 01KZRT7SEJ87SFVGBV0BE387KZ)
- 2026-08-11T16:37:41Z finding by a-security-reviewer-9sxqs0: FSA directory-handle persistence: no scope escalation; minor over-broad readwrite request (event 01KZRT7ZC1XDPDGPE4X4Q2FPD5)
