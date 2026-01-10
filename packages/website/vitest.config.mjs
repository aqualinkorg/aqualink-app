<<<<<<<< HEAD:packages/website/vitest.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
|||||||| parent of ad3e910f (migrate tests from vitest to rstest):packages/website/vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
========
import { defineConfig } from '@rstest/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
>>>>>>>> ad3e910f (migrate tests from vitest to rstest):packages/website/rstest.config.ts
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
<<<<<<<< HEAD:packages/website/vitest.config.mjs
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
|||||||| parent of ad3e910f (migrate tests from vitest to rstest):packages/website/vitest.config.js
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
========
  globals: true,
  testEnvironment: 'jsdom',
  setupFiles: ['./src/setupTests.tsx'],
  plugins: [pluginReact(), pluginSvgr({ mixedImport: true })],
>>>>>>>> ad3e910f (migrate tests from vitest to rstest):packages/website/rstest.config.ts
  resolve: {
    alias: {
      ...aliases,
      'luxon-extensions': path.resolve(__dirname, 'src/luxon-extensions'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  source: {
    define: {
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(
        'https://programize-dot-ocean-systems.uc.r.appspot.com/api/',
      ),
    },
  },
});
