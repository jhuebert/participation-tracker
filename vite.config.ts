import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));
const version = readFileSync(resolve(rootDir, 'VERSION'), 'utf8').trim();

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/jszip')) return 'jszip';
          if (id.includes('/features/slides/')) return 'slides';
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
