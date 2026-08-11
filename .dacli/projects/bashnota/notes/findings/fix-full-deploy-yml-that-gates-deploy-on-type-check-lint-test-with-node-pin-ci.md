---
id: f-fix-full-deploy-yml-that-gates-deploy-on-type-check-lint-test-with-node-pin-ci
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-tooling-reviewer-mfed01
about: "[[t-01KZRSXR3BZN6YK9YG0VCZMVPW]]"
origin: .github/workflows/deploy.yml:31
source_event: 01KZRTM2SSWPDHRSGY9CE1F7E7
---
# FIX: full deploy.yml that gates deploy on type-check + lint + test (with Node pin + CI scripts)
Current deploy.yml runs only npm ci + npm run build-only then deploys (no gate). Add two package.json scripts (test:unit is vitest watch mode and lint auto-fixes, neither CI-safe): "lint:ci": "eslint ." and "test:unit:ci": "vitest run". Then split the workflow into a quality gate + a deploy job that needs it:

name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
permissions:
  contents: write
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint:ci
      - run: npm run test:unit:ci
  build-and-deploy:
    needs: quality
    concurrency: ci-${{ github.ref }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Create .env file
        run: |
          echo "VITE_FIREBASE_API_KEY=${{ secrets.VITE_FIREBASE_API_KEY }}" >> .env
          echo "VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}" >> .env
          echo "VITE_FIREBASE_PROJECT_ID=${{ secrets.VITE_FIREBASE_PROJECT_ID }}" >> .env
          echo "VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}" >> .env
          echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}" >> .env
          echo "VITE_FIREBASE_APP_ID=${{ secrets.VITE_FIREBASE_APP_ID }}" >> .env
          echo "VITE_FIREBASE_MEASUREMENT_ID=${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}" >> .env
          echo "VITE_APP_BASE_URL=${{ secrets.VITE_APP_BASE_URL }}" >> .env
          echo "VITE_API_URL=${{ secrets.VITE_API_URL }}" >> .env
      - run: npm ci
      - run: npm run build-only
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist

build-and-deploy needs: quality so a red gate blocks deploy; Node pinned to 22 (matches @tsconfig/node22 and @types/node@22) with npm cache. Sibling f-ci-deploys-without-any-quality-gate flags the same defect; this is the concrete remediation.
