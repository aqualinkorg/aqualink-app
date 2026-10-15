import fs from 'node:fs';

const tokensUrl = new URL('../src/styles/tokens.json', import.meta.url);

// A file URL lets Sass/build tools watch the JSON source for changes.
export const sassTokenImporter = {
  canonicalize(url) {
    return url === 'aqualink:tokens' ? tokensUrl : null;
  },
  load() {
    const tokens = JSON.parse(fs.readFileSync(tokensUrl, 'utf8'));
    const contents = [
      `$breakpoints: (${Object.entries(tokens.breakpoints)
        .map(([name, value]) => `${name}: ${value}px`)
        .join(', ')});`,
      `$content-max-width: ${tokens.contentMaxWidth}px;`,
      `$desktop-design-width: ${tokens.desktopDesignWidth}px;`,
      `$nav-height: ${tokens.navHeight}px;`,
      `$map-nav-height-mobile: ${tokens.mapNavHeightMobile}px;`,
    ].join('\n');
    return { contents, syntax: 'scss' };
  },
};
