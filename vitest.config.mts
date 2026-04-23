import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', '.next'],
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    },
    server: {
      deps: {
        inline: ['drizzle-orm'],
      },
    },
  },
})
