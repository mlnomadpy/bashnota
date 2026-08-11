---
name: tdd
summary: test-driven delivery — a stage cannot close until the suite is green and covered
cost: "four gates, two of which run your real build; use when correctness is the product"
---
# tdd

Test-driven development, enforced rather than encouraged. Every other template
gates on documents; this one gates on the software. The `command:` and
`coverage:` predicates run your real build, so a stage cannot be advanced by
writing prose about tests that do not exist.

Set the three commands below to your stack's real ones before you rely on this
template — `dacli template add tdd` vendors an editable copy into the workspace.
The defaults assume Go.

## stage: design
cone: definition
phase: planning
allow: researcher, planner, reviewer
- project_sections: Goal | Success criteria
- tasks: all_have_acceptance

## stage: red
cone: approach
phase: implementation
allow: implementer, reviewer
- artifact: package.json
- artifact: .github/workflows/ci.yml
- command: npx vue-tsc --build

## stage: green
cone: design
phase: implementation
allow: implementer, reviewer
- command: npx vue-tsc --build
- command: npx vitest run
- command: npx vite build
# The tree must stay free of JavaScript emitted into src/ by a misconfigured
# vue-tsc --build. This regressed once and cost a full debugging cycle, so it
# is a gate, not a convention. Fails if any .js exists under src/.
- command: sh -c "test -z \"$(find src -name '*.js')\""
# Entry-chunk budget, mirroring the CI job. 2,200,000 bytes is ~13% headroom
# over the post-web-llm-split figure of 1,938,450. If a stage advance makes the
# bundle balloon again, this catches it here rather than in CI.
- command: sh -c "test $(stat -f%z $(ls -S dist/assets/index-*.js | head -1)) -lt 2200000"

## stage: ship
cone: design
phase: release
allow: implementer, reviewer
- tasks: musts_done
- command: npx vue-tsc --build
- command: npx vitest run
- command: npx vite build
- retro: required
