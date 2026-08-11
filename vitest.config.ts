import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

// Pin the timezone for the whole test run so that date-based tests are
// deterministic regardless of the host machine's local timezone. Several
// suites build dates from UTC literals (e.g. new Date('2024-01-15')) and then
// assert against implementations that use local-time methods (getHours,
// getFullYear, getDay). Without a fixed TZ those assertions pass in UTC-ish
// zones but fail in negative-offset zones. Set it here (main + worker
// processes both inherit process.env.TZ) rather than loosening the assertions.
process.env.TZ = 'UTC'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      // Ensure the pinned timezone reaches the test worker processes too.
      env: {
        TZ: 'UTC',
      },
    },
  }),
)
