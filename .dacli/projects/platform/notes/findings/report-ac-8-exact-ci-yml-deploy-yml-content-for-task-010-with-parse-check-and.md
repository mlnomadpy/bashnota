---
id: f-report-ac-8-exact-ci-yml-deploy-yml-content-for-task-010-with-parse-check-and
kind: note
note_kind: finding
created: 2026-08-11T17:19:40Z
created_by: a-fixer-5jrghe
about: "[[010]]"
severity: minor
---
# REPORT (AC-8): exact ci.yml + deploy.yml content for task 010, with parse-check and gate verification
Branch dacli/010-add-a-github-actions-quality-workflow-separate-from-deploy, commit 6df6990. Files: .github/workflows/ci.yml (new), .github/workflows/deploy.yml (modified), .gitignore (+test-results/).

YAML PARSE CHECK (actionlint unavailable in sandbox; equivalent parse via node 'yaml' package): both files parse OK. ci.yml on=[push, pull_request], job 'quality' with 9 steps (Checkout, Setup Node, Install dependencies, Type check, Lint report-only, Unit tests, Upload test results, Build, Report entry chunk size and enforce budget). deploy.yml on=[workflow_run], job 'build-and-deploy', job-if: ${{ github.event.workflow_run.conclusion == 'success' }}.

=== .github/workflows/ci.yml ===
name: Quality
on:
  push:
    branches:
      - master
  pull_request:
permissions:
  contents: read
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Type check
        run: npm run type-check
      - name: Lint (report-only — see comment above)
        run: npx eslint .
        continue-on-error: true
      - name: Unit tests
        run: npx vitest run --reporter=default --reporter=junit --outputFile.junit=test-results/vitest-junit.xml
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: vitest-results
          path: test-results/vitest-junit.xml
          if-no-files-found: error
      - name: Build
        run: npm run build-only
      - name: Report entry chunk size and enforce budget
        run: |
          set -euo pipefail
          BUDGET_BYTES=10300000
          ENTRY="$(ls -1S dist/assets/index-*.js | head -n1)"
          SIZE="$(stat -c%s "$ENTRY")"
          echo "Entry chunk: ${ENTRY} = ${SIZE} bytes (budget ${BUDGET_BYTES} bytes)"
          if [ "${SIZE}" -gt "${BUDGET_BYTES}" ]; then
            echo "::error::Entry chunk ${SIZE} bytes exceeds budget ${BUDGET_BYTES} bytes"
            exit 1
          fi
          echo "Entry chunk within budget."
(comment blocks omitted here for brevity; present in the committed file.)

=== .github/workflows/deploy.yml (key changes) ===
on:
  workflow_run:
    workflows: ["Quality"]
    types: [completed]
    branches: [master]
permissions:
  contents: write
jobs:
  build-and-deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    ...
      - name: Build 🔧
        run: npm run build     # was: npm run build-only (no longer bypasses type-check)
      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
(Removed from deploy.yml: the in-line type-check / lint / vitest gate steps — now owned by ci.yml.)

VERIFICATION (local, installed node_modules): vue-tsc --build clean/0 .js; vitest 24 files/338 tests pass + junit artifact; vite build OK, entry chunk 10,057,889 bytes < 10,300,000 budget; eslint . = 601 errors (report-only). Budget selector 'ls -1S dist/assets/index-*.js' resolves to the single index-*.js entry chunk. NOTE inherited blocker: npm ci will fail until package-lock.json is regenerated (separate finding).
