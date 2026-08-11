---
id: f-texteditingsettings-observer-disconnected-only-on-beforeunload-not-onunmounted
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/settings/components/editor/TextEditingSettings.vue:125
source_event: 01KZRT41V24E1SGZRAEAQW48HT
---
# TextEditingSettings observer disconnected only on beforeunload, not onUnmounted
onMounted creates a MutationObserver on document.documentElement (125, observe at 133). Cleanup (139-142) registers window.addEventListener('beforeunload', cleanup) instead of onUnmounted. So when the settings tab is switched away / component unmounts, the observer keeps firing applyTextColor on every documentElement class change, AND the beforeunload listener itself leaks. Fix: disconnect in onUnmounted(() => observer.disconnect()) and drop the beforeunload wiring.
