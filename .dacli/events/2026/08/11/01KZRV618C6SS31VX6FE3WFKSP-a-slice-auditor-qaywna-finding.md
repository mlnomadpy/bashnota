---
id: 01KZRV618C6SS31VX6FE3WFKSP
kind: event
event_kind: finding
created: 2026-08-11T16:41:09Z
created_by: a-slice-auditor-qaywna
about: "[[001]]"
origin: agent
applied: false
---
API keys sit in plaintext localStorage; any stored-XSS in a nota can exfiltrate them

AI API keys are stored in exactly one place: localStorage under the 'ai-settings' key, as settings.apiKeys (Record<providerId,string>), written by saveSettings() at src/features/ai/stores/aiSettingsStore.ts:100-102 and read by getApiKey() at aiSettingsStore.ts:53-55. They are never written into Nota content or conversation records (conversations persist only messages, src/features/ai/stores/aiConversationStore.ts:49-59), and are sent only to the selected provider host -- so no leak INTO a published nota. HOWEVER, because the key is same-origin localStorage, it is readable by any injected script. The security seat has confirmed stored-XSS sinks that render nota/output content via unsanitized v-html (01KZRT68YH OutputRenderer, 01KZRT6N9D ErrorDisplay). CHAINED CONSEQUENCE: opening a shared/published nota carrying such a payload lets attacker JS run localStorage.getItem('ai-settings') and exfiltrate the victim's Gemini key. This is the primary reason the two XSS findings are high-impact for AI users.
