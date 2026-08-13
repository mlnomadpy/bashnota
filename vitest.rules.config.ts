import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

process.env.TZ = 'UTC'

export default defineConfig({
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
    environment: 'node',
    include: ['firestore-tests/**/*.test.ts'],
    fileParallelism: false,
    env: {
      TZ: 'UTC',
    },
  },
})
