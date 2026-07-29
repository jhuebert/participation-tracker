import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify('test'),
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.{test,spec}.ts', 'tests/integration/**/*.{test,spec}.ts'],
    globals: false,
  },
});
