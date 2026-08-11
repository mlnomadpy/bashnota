---
id: d-reviewed-vue-idiom-reactivity-by-direct-grep-read-for-the-4-concrete-criteria
kind: note
note_kind: decision
created: 2026-08-11T16:26:40Z
created_by: a-vue-reviewer-ppn7gy
about: "[[007]]"
---
# Reviewed Vue idiom/reactivity by direct grep+read for the 4 concrete criteria, delegating the two exploratory traces (computed/watch anti-patterns, prop-drilling/emit chains) to read-only subagents
## Chose
Reviewed Vue idiom/reactivity by direct grep+read for the 4 concrete criteria, delegating the two exploratory traces (computed/watch anti-patterns, prop-drilling/emit chains) to read-only subagents
## Rejected
Run a single monolithic pass or a Workflow fan-out over all 459 .vue files
## Because
The lifecycle-cleanup, reactivity-primitive, and store-overlap criteria are answerable with precise file:line evidence from targeted greps (addEventListener/setInterval/observer pairing, markRaw/shallowRef absence, defineStore id collisions). The two open-ended pattern hunts (watcher-should-be-computed / computed-with-side-effects, and prop/emit chain depth) need tree-tracing across many files, so I delegated those to focused read-only agents while I filed the deterministic findings — cheaper and keeps evidence concrete.
