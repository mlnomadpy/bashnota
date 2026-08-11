---
id: f-block-store-keeps-all-blocks-in-a-deeply-reactive-pinia-map-with-no-shallowref
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
source_event: 01KZRTHPASAHCBYGCEAE4WD688
---
# Block store keeps all blocks in a deeply-reactive Pinia Map with no shallowRef/markRaw; large code outputs are fully proxied
src/features/nota/stores/blockStore.ts:22-27 state holds blocks: new Map<string,Block>() and blockStructures: new Map (grep for shallowRef/markRaw in this file returns nothing). Pinia makes state deeply reactive, so every Block — including executable-code-block outputs, table data, and confusion-matrix/chart payloads — is wrapped in a reactive Proxy recursively. This makes writes (e.g. storing a large execution output) pay proxy-creation cost proportional to output size, and makes deep watchers/computeds over the Map more expensive. Blocks are large value objects that are mutated wholesale, so fine-grained reactivity buys little. Fix: store block payloads via markRaw() or keep the Map in shallowRef and replace-on-write, reserving reactivity for the blockOrder/structure. Risk: moderate (requires auditing mutation sites that rely on deep reactivity).
