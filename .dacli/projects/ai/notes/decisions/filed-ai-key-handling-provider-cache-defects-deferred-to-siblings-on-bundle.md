---
id: d-filed-ai-key-handling-provider-cache-defects-deferred-to-siblings-on-bundle
kind: note
note_kind: decision
created: 2026-08-11T16:41:38Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
---
# Filed AI-key handling + provider-cache defects; deferred to siblings on bundle/leaks I only corroborated
## Chose
Filed AI-key handling + provider-cache defects; deferred to siblings on bundle/leaks I only corroborated
## Rejected
Re-report web-llm bundle size, sidebar listener leaks, and console.* count as fresh findings
## Because
Perf (01KZRT661F/01KZRTCXCT), vue (01KZRT3KHS/01KZRTK6CP/01KZRT9MXW) and tooling seats already own those. My unique lane is AI API-key storage/travel and the provider abstraction, so I filed the key-in-URL production log leak, the never-evicted provider cache (key/endpoint changes ignored until reload), the localStorage-key exfil chain with the confirmed XSS sinks, and the dual aiService facade -- and only CONFIRMED the bundle/collision items with the exact ai-slice import chain and consequence rather than re-filing them.
