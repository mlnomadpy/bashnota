---
id: d-do-not-certify-task046-until-rotated-xff-bypass-is-closed
kind: note
note_kind: decision
created: 2026-08-27T09:51:25Z
created_by: a-root
about: "[[bashnota/046-enforce-typed-api-authentication-request-bounds-and-rate-limits]]"
---
# Do not certify task046 until rotated-XFF bypass is closed
## Chose
Do not certify task046 until rotated-XFF bypass is closed
## Rejected
Accept 08613e3 after retention-only repair
## Because
Independent local Kong reproduction proves changing only client-supplied X-Forwarded-For bypasses the anonymous IP quota. A trusted-source design and same-peer rotation/poisoning tests remain mandatory.
