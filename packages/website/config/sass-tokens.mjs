import fs from 'node:fs';

// Both build tools and the MUI theme read the same responsive values.
const tokens = JSON.parse(
  fs.readFileSync(
    new URL('../src/styles/tokens.json', import.meta.url),
    'utf8',
  ),
);

export const sassTokens = [
  `$breakpoints: (${Object.entries(tokens.breakpoints)
    .map(([name, value]) => `${name}: ${value}px`)
    .join(', ')});`,
  `$content-max-width: ${tokens.contentMaxWidth}px;`,
  `$desktop-design-width: ${tokens.desktopDesignWidth}px;`,
  `$nav-height: ${tokens.navHeight}px;`,
  `$map-nav-height-mobile: ${tokens.mapNavHeightMobile}px;`,
].join('\n');

// Virtual Sass module keeps JSON as the source of truth without generated files.
export const sassTokenImporter = {
  canonicalize(url) {
    return url === 'aqualink:tokens' ? new URL(url) : null;
  },
  load() {
    return { contents: sassTokens, syntax: 'scss' };
  },
};
