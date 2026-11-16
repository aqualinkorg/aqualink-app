import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginEslint } from "@rsbuild/plugin-eslint";

const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });
const websiteRoot = path.dirname(fileURLToPath(import.meta.url));
const maplibreDist = path.resolve(
  websiteRoot,
  '../../node_modules/maplibre-gl/dist',
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
      // Dev only. The worker imports ./maplibre-gl-shared.mjs, so both files
      // have to be served from the same directory. Production copies them below.
      { name: maplibreDist, copyOnBuild: false },
    ],
  },
  output: {
    distPath: {
      root: 'build',
    },
    sourceMap: env.envMode === 'development',
    copy: [
      {
        from: path.join(maplibreDist, 'maplibre-gl-worker.mjs'),
        to: 'maplibre-gl-worker.mjs',
      },
      {
        from: path.join(maplibreDist, 'maplibre-gl-shared.mjs'),
        to: 'maplibre-gl-shared.mjs',
      },
    ],
  },
  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
    },
  },
}));
