import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': 'D:/Dev/AI/tracking_aw/client_nextjs',
    }
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
