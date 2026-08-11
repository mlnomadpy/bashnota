---
id: f-aiassistantsidebar-providercheckinterval-cleanup-registered-after-await-may-not
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/ai/components/components/AIAssistantSidebar.vue:557
source_event: 01KZRT41VHRPWQQSYHSGMMED4W
---
# AIAssistantSidebar providerCheckInterval cleanup registered after await may not bind
Inside async onMounted, onBeforeUnmount(() => clearInterval(providerCheckInterval)) is registered at line 557 AFTER 'await initializeProviders(false)' (539). Vue lifecycle hooks registered after an await lose the active component instance context, so this onBeforeUnmount may not attach — leaking the 30s providerCheckInterval (546) which calls checkAllProviders and network requests indefinitely. Fix: create the interval synchronously and register cleanup in the top-level onBeforeUnmount that already exists at 643.
