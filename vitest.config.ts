import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@fetch-lite/fetch': resolve(__dirname, 'packages/fetch/index.ts'),
      '@fetch-lite/base': resolve(__dirname, 'packages/base/index.ts'),
      'commmon-fetch': resolve(__dirname, 'packages/fetch/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 100000,
    coverage: {
      enabled: true,
      include: ['packages/fetch/src', 'packages/base/src/', 'packages/preset/src'],
    },
  },
})
