---
id: 01KZRT6P2T52NNJPH5GWJ62MKW
kind: event
event_kind: finding
created: 2026-08-11T16:24:01Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/nota/stores/nota.ts:126
applied: true
---
Nota store items is a deep-reactive array of full nota trees

Options-store state items: [] as Nota[] (126) holds every loaded Nota with nested config, versions[] (each version embeds a full serialized nota — serializeNota recurses at 40), citations[], and blockStructure. Pinia deep-reactive-wraps the whole array, so large notebooks pay deep-proxy cost on every nota and nested version. Getters like rootItems/getChildren also re-filter the full array on each access. Consider markRaw for the immutable version snapshots inside items, or a shallow structure keyed by id.
