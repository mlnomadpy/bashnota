---
id: 01KZRTC1D5WB2TVE5JN5VA2E16
kind: event
event_kind: finding
created: 2026-08-11T16:26:57Z
created_by: a-tooling-reviewer-mfed01
about: "[[t-01KZRSXR3BZN6YK9YG0VCZMVPW]]"
origin: agent
applied: true
---
eslint.config.ts never registers a TS parser: no vueTsConfigs.* entry means @vue/eslint-config-typescript skips its parser-injection step, so 425/426 lint 'errors' are Parsing error: Unexpected token

eslint.config.ts:12 wraps the config array in defineConfig, which @vue/eslint-config-typescript@14.3.0 aliases to defineConfigWithVueTs (node_modules/@vue/eslint-config-typescript/dist/index.d.mts:38). defineConfigWithVueTs (dist/index.mjs:237) delegates to insertAndReorderConfigs (dist/index.mjs:246). That function computes lastExtendedConfigIndex = configs.findLastIndex(c => c instanceof TsEslintConfigForVue) and, at dist/index.mjs:250-252, RETURNS THE CONFIGS UNCHANGED when the index is -1. TsEslintConfigForVue instances are exactly the vueTsConfigs.* entries (dist/index.mjs:52). eslint.config.ts passes NONE of them (it imports pluginVue, pluginVitest, skipFormatting — never vueTsConfigs). So the index is -1, the early return fires, and createBasicSetupConfigs (dist/index.mjs:261 -> 108-156, which sets languageOptions.parser = tseslint.parser for .ts/.tsx/.mts and the vue-script TS parser for .vue) is NEVER inserted. With no TS parser, every .ts file and every <script lang=ts> is parsed by espree and fails on TS syntax -> 'Parsing error: Unexpected token'. FIX: include vueTsConfigs.recommended (a TsEslintConfigForVue) in the array so lastExtendedConfigIndex != -1 and the parser setup is injected. Secondary: once the TS plugin actually loads, the rules block (eslint.config.ts:36-38) references @typescript-eslint/no-implicit-any-catch (removed from typescript-eslint since v6) and vue/no-implicit-any (not a real rule) which will then hard-error as unknown rules and must be dropped.
