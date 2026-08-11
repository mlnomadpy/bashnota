---
id: f-fix-exact-corrected-eslint-config-ts-that-registers-the-ts-parser-add
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-tooling-reviewer-mfed01
about: "[[t-01KZRSXR3BZN6YK9YG0VCZMVPW]]"
origin: eslint.config.ts:12
source_event: 01KZRTJSB6XCCK0MZHD0V6WW4G
---
# FIX: exact corrected eslint.config.ts that registers the TS parser (add vueTsConfigs.recommended)
Why current fails: defineConfigWithVueTs only injects the TS-parser setup (createBasicSetupConfigs) when at least one vueTsConfigs.* entry is present (dist/index.mjs:250-252 early-returns when none found). The current file passes none, so no parser is set and every .ts / <script lang=ts> throws 'Parsing error: Unexpected token'. Corrected file in full:\n\nimport pluginVue from 'eslint-plugin-vue'\nimport { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'\nimport pluginVitest from '@vitest/eslint-plugin'\nimport skipFormatting from '@vue/eslint-config-prettier/skip-formatting'\n\nexport default defineConfigWithVueTs(\n  {\n    name: 'app/files-to-lint',\n    files: ['**/*.{ts,mts,tsx,vue}'],\n  },\n  {\n    name: 'app/files-to-ignore',\n    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/components/ui/**'],\n  },\n\n  pluginVue.configs['flat/essential'],\n  vueTsConfigs.recommended,\n\n  {\n    ...pluginVitest.configs.recommended,\n    files: ['src/**/__tests__/*'],\n  },\n\n  skipFormatting,\n\n  {\n    rules: {\n      '@typescript-eslint/no-explicit-any': 'off',\n      '@typescript-eslint/ban-ts-comment': 'off',\n    },\n  },\n)\n\nChanges vs current: (1) import defineConfigWithVueTs + vueTsConfigs instead of the deprecated defineConfig alias; (2) pass args as a variadic list, not one array; (3) ADD vueTsConfigs.recommended right after pluginVue essential — this is the fix that anchors parser injection; (4) DROP '@typescript-eslint/no-implicit-any-catch' and 'vue/no-implicit-any' from the rules block (neither exists in the active plugins; once the TS plugin actually loads they become hard 'rule not found' errors); (5) remove the now-unneeded 'as any' casts and @ts-ignore.
