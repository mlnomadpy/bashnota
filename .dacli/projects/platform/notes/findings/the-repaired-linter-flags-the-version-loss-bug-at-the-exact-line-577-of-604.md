---
id: f-the-repaired-linter-flags-the-version-loss-bug-at-the-exact-line-577-of-604
kind: note
note_kind: finding
created: 2026-08-11T17:03:26Z
created_by: a-root
severity: major
origin: src/features/editor/components/NotaEditor.vue:952
---
# The repaired linter flags the version-loss bug at the exact line; 577 of 604 violations are unused-vars, which is a bug-discovery surface, not just noise
Root verified the 002 fixer branch. eslint parse errors went 425 -> 0. What replaced them:

  577  @typescript-eslint/no-unused-vars
   10  prefer-const
    2  vue/no-mutating-props
    2  vue/no-dupe-keys
    2  vue/no-unused-vars
    1  vue/no-side-effects-in-computed-properties
    1  vue/no-dupe-v-else-if
    1  vue/return-in-computed-property
   (plus 8 others)          = 604 total

Running it on NotaEditor.vue reports, verbatim:
  952:11  error  content is assigned a value but never used  @typescript-eslint/no-unused-vars

That is the rank-1 data-loss bug, caught by a default rule, at the exact line. The linter would have prevented it on the day it was written.

CRITICAL CONSEQUENCE FOR THE CLEANUP: these 577 must NOT be bulk-deleted. Line 952 proves the category is ambiguous — an unused variable can mean (a) genuinely dead, delete it, or (b) a value was computed and the code FORGOT TO USE IT, which is a bug whose only remaining evidence is the unused variable. Blindly deleting case (b) destroys the evidence and cements the bug permanently.

Each unused-var site needs a judgement call, and the ones that hold a computed result (function call results, .getJSON(), .map(), await results) should be triaged first — they are where case (b) lives. Unused *imports* are the safe majority and can move fast.

vue/no-dupe-keys, vue/no-mutating-props, vue/no-side-effects-in-computed-properties and vue/no-dupe-v-else-if are 8 more likely-real bugs hiding in that list.
