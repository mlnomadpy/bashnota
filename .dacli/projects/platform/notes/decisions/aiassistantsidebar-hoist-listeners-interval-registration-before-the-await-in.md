---
id: d-aiassistantsidebar-hoist-listeners-interval-registration-before-the-await-in
kind: note
note_kind: decision
created: 2026-08-11T17:15:02Z
created_by: a-fixer-n3pbdx
about: "[[009]]"
---
# AIAssistantSidebar: hoist listeners+interval registration before the await in onMounted, and capture providerCheckInterval in a top-level ref
## Chose
AIAssistantSidebar: hoist listeners+interval registration before the await in onMounted, and capture providerCheckInterval in a top-level ref
## Rejected
Leaving cleanup registered via onBeforeUnmount nested inside the async onMounted (after await initializeProviders)
## Because
Vue only attaches lifecycle hooks registered synchronously during setup or before the first await inside an async hook; the nested onBeforeUnmount ran after 'await initializeProviders(false)', so on a component instance that changed active-instance context the cleanup could silently fail to register, leaking a 30s interval. Named the activate-ai-assistant handler so removeEventListener can detach it, and moved listener/interval setup ahead of the await so the handles are always captured.
