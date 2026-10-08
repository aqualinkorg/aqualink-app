import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginEslint } from '@rsbuild/plugin-eslint';
import { pluginSass } from '@rsbuild/plugin-sass';
import { sassTokenImporter } from './config/sass-tokens.mjs';

const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig((env) => ({
  plugins: [
    pluginReact(),
    pluginSvgr({ mixedImport: true }),
    pluginEslint({ enable: false }),
    pluginSass({
      sassLoaderOptions: { sassOptions: { importers: [sassTokenImporter] } },
    }),
  ],
  html: {
    template: './public/index.html',
  },
  output: {
    distPath: {
      root: 'build',
    },
    sourceMap: env.envMode === 'development',
  },
  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
    },
  },
}));
