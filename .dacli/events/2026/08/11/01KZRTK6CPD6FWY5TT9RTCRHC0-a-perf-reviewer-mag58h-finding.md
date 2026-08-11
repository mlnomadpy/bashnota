---
id: 01KZRTK6CPD6FWY5TT9RTCRHC0
kind: event
event_kind: finding
created: 2026-08-11T16:30:51Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
origin: agent
applied: true
---
AIAssistantSidebar registers onBeforeUnmount after an await, so the 30s provider-check interval (with network calls + console.log) can leak

src/features/ai/components/components/AIAssistantSidebar.vue:537 onMounted(async () => { try { await initializeProviders(false) ... }). The cleanup hook onBeforeUnmount(() => clearInterval(providerCheckInterval)) is registered at :557 AFTER the await at :539. In Vue 3, lifecycle hooks registered after an await lose the active component-instance context, so this onBeforeUnmount may not register — leaking the 30s window.setInterval created at :546, which keeps calling updateWebLLMState() + checkAllProviders(true) (network requests) + console.log every 30s forever, once per sidebar mount/unmount cycle. Compounds if the sidebar is toggled repeatedly. Additionally logProviderAvailability (:530-534) and :547 use raw console.log (not the dev-gated logger), so this polling spams the console in production too. Fix: create the interval synchronously (or store its id in a ref and clear it in a top-level onBeforeUnmount like the webLLMStateInterval at :643-650), and route logs through logger. Risk: low.
