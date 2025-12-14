import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginEslint } from '@rsbuild/plugin-eslint';

const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig((env) => ({
  plugins: [
    pluginReact(),
    pluginSvgr({ mixedImport: true }),
    pluginEslint({ enable: false }),
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
