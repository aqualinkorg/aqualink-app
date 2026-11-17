import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginEslint } from "@rsbuild/plugin-eslint";

const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });
const websiteRoot = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const maplibreDist = path.join(
  path.dirname(require.resolve('maplibre-gl/package.json')),
  'dist',
);

export default defineConfig((env) => ({
  plugins: [
    pluginReact(),
    pluginSvgr({ mixedImport: true }),
    pluginEslint({ enable: false }),
  ],
  html: {
    template: './public/index.html',
  },
  server: {
    publicDir: [
      { name: path.join(websiteRoot, 'public') },
      // Dev only. The worker imports ./maplibre-gl-shared.mjs from the same directory.
      { name: maplibreDist, copyOnBuild: false },
    ],
  },
  output: {
    distPath: {
      root: 'build',
    },
    sourceMap: env.envMode === 'development',
    copy: ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'].map(
      (fileName) => ({
        from: path.join(maplibreDist, fileName),
        to: fileName,
      }),
    ),
  },
  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
    },
  },
}));
