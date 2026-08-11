import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // 'functions/**' is a separate Firebase Cloud Functions package (its own
      // package.json/tsconfig); its tests run under that package, not the app suite.
      exclude: [...configDefaults.exclude, 'e2e/**', 'functions/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
