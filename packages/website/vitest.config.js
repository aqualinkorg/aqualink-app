import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const srcPath = path.resolve(__dirname, 'src');
const aliases = Object.fromEntries(
  fs
    .readdirSync(srcPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()) // Only folders
    .map((dirent) => [dirent.name, path.resolve(srcPath, dirent.name)]),
);

export default defineConfig({
  plugins: [react()],
  test: {
    threads: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.tsx',
    globalSetup: './src/global-setup.js',
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
