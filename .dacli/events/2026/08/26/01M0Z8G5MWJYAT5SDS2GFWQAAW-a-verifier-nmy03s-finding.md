---
id: 01M0Z8G5MWJYAT5SDS2GFWQAAW
kind: event
schema_version: 1
event_kind: finding
created: 2026-08-26T14:45:01Z
created_by: a-verifier-nmy03s
about: "[[t-01M0N6FGNKSD2ESRHJ27A8670Y]]"
origin: agent
applied: true
checksum: sha256:e871e100d2daba0e011296368f46a870994c9110e4f6c16079b675b085b23905
---
verdict: refuted — partial in-memory child state silently drops persisted descendants

Counterexample: persist root with children A and B, then reach a valid partially loaded state via loadNota so store.items contains root and A but not B. getSubPages returns the nonempty in-memory filter and consults the authoritative adapter/database only when that filter is empty (src/features/nota/stores/nota.ts:1121-1136). publishNotaHierarchy recursively trusts that result as the complete ordered child list (src/features/nota/stores/nota.ts:1438-1445), so a first-time publish sends only root+A. The SQL RPC cannot know unpublished local B exists and atomically commits the incomplete hierarchy. loadNota explicitly supports adding individual records to items (src/features/nota/stores/nota.ts:484-502), so this is a reachable production state, not merely a fabricated test mutation.
