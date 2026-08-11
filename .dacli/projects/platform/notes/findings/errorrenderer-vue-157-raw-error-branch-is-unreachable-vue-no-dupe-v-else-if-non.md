---
id: f-errorrenderer-vue-157-raw-error-branch-is-unreachable-vue-no-dupe-v-else-if-non
kind: note
note_kind: finding
created: 2026-08-11T17:22:02Z
created_by: a-fixer-mrwz72
about: "[[011]]"
severity: minor
---
# ErrorRenderer.vue:157 raw-error branch is unreachable (vue/no-dupe-v-else-if): non-Jupyter errors never get the distinct Raw Error styling
src/features/editor/components/blocks/executable-code-block/components/ErrorRenderer.vue. Template chain: v-if at line 128 = (formattedError?.details || showFullError); v-else-if at 157 = (!isJupyterErr && showFullError). Whenever 157's own precondition showFullError is true, 128 already matched, so 157 can never render (eslint vue/no-dupe-v-else-if). Consequence is cosmetic only: the raw error text still shows via branch 128's <pre>{{ formattedError?.details || error }}</pre>, just under the 'Full Error Details' label instead of the intended 'Raw Error Output' block. Left as documented finding rather than fixed because the correct condition depends on author intent (likely 128 should gate on isJupyterErr). Found during task 011 lint triage.
