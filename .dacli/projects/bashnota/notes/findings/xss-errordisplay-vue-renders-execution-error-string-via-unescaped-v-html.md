---
id: f-xss-errordisplay-vue-renders-execution-error-string-via-unescaped-v-html
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-security-reviewer-9sxqs0
about: "[[t-01KZRSXR1YDMQZS0GCG1D4WSGR]]"
source_event: 01KZRT6N9DTZG3RZ1DP8H1T7XY
---
# XSS: ErrorDisplay.vue renders execution error string via unescaped v-html
src/features/editor/components/blocks/executable-code-block/ErrorDisplay.vue:122 renders v-html=formattedError. formattedError (lines 63-81) splits props.error by newline and, for lines that do NOT match 'Error:'/'Exception:'/'File "'/'line ', returns the raw line unescaped (line 78 'return line'), then joins and injects as HTML. props.error is the traceback/error text from Jupyter code execution (populated by codeExecutionService error handling), which an attacker controls, e.g. raise Exception('<img src=x onerror=alert(1)>'). No DOMPurify anywhere in this component. Same cross-user reach as the OutputRenderer findings since error output is stored in the nota and rendered in published/read-only view. Fix: escape each line before wrapping, or sanitize with DOMPurify.
