import path from 'path';
import fs from 'fs';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

const srcPath = path.resolve(__dirname, 'src');

const aliases = Object.fromEntries(
  fs.readdirSync(srcPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()) // Only folders
    .map((dirent) => [dirent.name, path.resolve(srcPath, dirent.name)])
);

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      ...aliases,
      'luxon-extensions': path.resolve(__dirname, 'src/luxon-extensions'),
    },
  },
});
