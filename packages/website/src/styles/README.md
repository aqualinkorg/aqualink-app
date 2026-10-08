# Responsive styles

`tokens.json` is the shared source for MUI and SCSS. Rsbuild and Vitest expose
these values through the virtual `aqualink:tokens` Sass module. Use the
`responsive.up(name)` and `responsive.down(name)` mixins in SCSS and
`theme.breakpoints` in React; do not add literal screen-width queries. Changes to `tokens.json` are watched by the build tools and reloaded by Sass.

| Token | Starts at | Purpose                            |
| ----- | --------: | ---------------------------------- |
| xs    |         0 | Mobile                             |
| sm    |     768px | Tablet                             |
| md    |    1024px | Desktop                            |
| lg    |    1280px | Wider desktop / dense data layouts |
| xl    |    1440px | Large desktop design reference     |

1440px is not a viewport limit. Main page containers remain fluid and center
up to 1312px of content, plus their gutters. Gutters are 24px on mobile, 32px
on tablet, and scale up to 64px on desktop. Explicit small MUI containers
retain their narrower width caps for forms and dialogs.

`App.scss` loads the base reset, legacy layout utilities, map overrides, and
carousel overrides once. `_legacy-layout.scss` retains only Bootstrap classes
currently used by About, Buoy, Drones, and FAQ. Use MUI or component styles for
new UI rather than restoring the full Bootstrap bundle.

Leaflet's installed package provides its required runtime styles. Do not copy
or prune those vendor classes; application overrides belong in `_map.scss`.
Other installed library CSS (Slick and LocateControl) stays with its component.

Use `--viewport-height` for dynamic screen-height layouts (100dvh with a 100vh
fallback), `--nav-height` for the regular header, and `--map-nav-height` for the
map's taller mobile search header. A hero can use 100svh to stay steady as the
mobile browser's controls appear and disappear. Use percentages for child
widths instead of 100vw so scrollbars do not create horizontal overflow.
