---
id: 01KZRV6Z1SEX2PM8864FA739DP
kind: event
event_kind: finding
created: 2026-08-11T16:41:39Z
created_by: a-slice-auditor-m6eb9n
about: "[[001]]"
origin: agent
applied: false
---
Broken toast API across active settings panels: object-form toast({title,description,variant}) with vue-sonner import shows no title/description

vue-sonner's toast() signature is toast(message, data?) -- title/description/variant is the shadcn/ui useToast API, not vue-sonner. Many components import { toast } from 'vue-sonner' then call the object form, so the message arg is an object and the intended text never renders. ACTIVE (registry-reachable) offenders: DataManagementSettings.vue:42,48,70,91,103,129,135,157,163,175 (export/import/clear-all/reset feedback all blank), SystemInfoSettings.vue:84,102,108 (copy diagnostics), JupyterSettings.vue:48,63,76 (connect/test feedback). Also in keyboard/EditorShortcutsSettings.vue:49,113 and Global/NavigationShortcutsSettings.vue:8. Contrast the CORRECT usage in settingsStore.ts:128 toast.error('msg',{description}). USER-VISIBLE: successful/failed data export, import, reset, and Jupyter connection show an empty or malformed toast, so users get no confirmation or error text.
