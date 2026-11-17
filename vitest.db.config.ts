import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['src/**/*.db.test.ts'],
    globalSetup: ['src/test/dbGlobalSetup.ts'],
    testTimeout: 30_000,
    fileParallelism: false,
  },
});
