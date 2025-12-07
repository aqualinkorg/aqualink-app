import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, URL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.resolve(__dirname, 'src');
const aliases = Object.fromEntries(
  fs
    .readdirSync(srcPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()) // Only folders
    .map((dirent) => [dirent.name, path.resolve(srcPath, dirent.name)]),
);

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'node18',
  },
  test: {
    threads: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.tsx',
    globalSetup: './src/global-setup.mjs',
    retry: 0, // Don't retry failed tests
    env: {
      REACT_APP_API_BASE_URL:
        'https://programize-dot-ocean-systems.uc.r.appspot.com/api/',
    },
  },
  resolve: {
    alias: {
      ...aliases,
      'luxon-extensions': path.resolve(__dirname, 'src/luxon-extensions'),
    },
  },
});
