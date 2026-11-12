import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // esbuild cannot emit decorator metadata, which tsyringe needs for constructor injection.
  plugins: [
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true, useDefineForClassFields: false },
        target: 'es2022',
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/global-setup.ts'],
    setupFiles: ['tests/setup.ts'],
    env: { NODE_ENV: 'test' },
    // The first run downloads a MongoDB binary for mongodb-memory-server.
    hookTimeout: 120_000,
    testTimeout: 20_000,
    coverage: { include: ['src/**/*.ts'], exclude: ['src/main.ts', 'src/database/seed.ts'] },
  },
})
