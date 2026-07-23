import { defineConfig } from '@rstest/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.resolve(__dirname, 'src');
const aliases = Object.fromEntries(
  fs
    .readdirSync(srcPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()) // Only folders
    .map((dirent) => [dirent.name, path.resolve(srcPath, dirent.name)]),
);

export default defineConfig({
  globals: true,
  testEnvironment: 'jsdom',
  setupFiles: ['./src/setupTests.tsx'],
  plugins: [pluginReact(), pluginSvgr({ mixedImport: true })],
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
