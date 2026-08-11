---
id: f-safety-iframe-is-not-a-sandbox-allow-scripts-allow-same-origin-on-same-origin
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-security-reviewer-9sxqs0
about: "[[t-01KZRSXR1YDMQZS0GCG1D4WSGR]]"
source_event: 01KZRT6H0CM394RDY40JAT3D5D
---
# Safety iframe is not a sandbox: allow-scripts + allow-same-origin on same-origin doc.write
src/features/editor/components/blocks/executable-code-block/IframeOutputRenderer.vue:191 sets sandbox='allow-scripts allow-same-origin' on an iframe whose document is written same-origin via doc.write (lines 150-152), with untrusted props.content injected raw into <body> at line 105. Per the HTML spec/MDN, combining allow-scripts with allow-same-origin on content you frame from your own origin lets the framed document reach its own origin and remove its sandboxing - so this is NOT an isolation boundary. OutputRenderer.vue routes any output it deems 'unsafe HTML' (tables at :603, images at :612, and text with unsafe HTML at :583) into this iframe believing it is sandboxed; instead arbitrary <script> in a code output executes with full access to the app origin: localStorage/IndexedDB (Firebase auth tokens), cookies, and window.parent DOM. Because published notas render outputs (NotaContentViewer -> ExecutableCodeBlock isPublishedView) and publishedNotas is world-readable (firestore.rules:61), this is a cross-user account-takeover vector. Fix: drop allow-same-origin (and/or serve output from a distinct sandboxed origin); the resize postMessage handler at :161 already uses '*' and cross-origin postMessage, so removing allow-same-origin does not break resize.
