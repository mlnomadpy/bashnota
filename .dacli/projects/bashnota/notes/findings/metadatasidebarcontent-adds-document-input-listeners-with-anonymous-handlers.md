---
id: f-metadatasidebarcontent-adds-document-input-listeners-with-anonymous-handlers
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/nota/components/MetadataSidebarContent.vue:182
source_event: 01KZRT41VA18SDMXYX5SXFVX29
---
# MetadataSidebarContent adds document/input listeners with anonymous handlers, never removed
onMounted (180-197) registers document.addEventListener('click', anon) at 182 and tagsInput.addEventListener('input', anon) at 194. Both handlers are anonymous inline functions, so they cannot be removed, and there is no onUnmounted at all. The global document click handler (mutating showSuggestions) leaks on every unmount of the metadata sidebar. Fix: use named handlers and removeEventListener in onUnmounted.
