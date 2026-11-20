import type { SkySpecification, StyleSpecification } from 'maplibre-gl';

const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export const OCEAN_COLOR = '#0b1d2a';

export const satelliteTileUrl = accessToken
  ? `https://api.mapbox.com/styles/v1/eric-ovio/ckesyzu658klw19s6zc0adlgp/tiles/{z}/{x}/{y}@2x?access_token=${accessToken}`
  : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x';

export const satelliteAttribution = accessToken
  ? '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
  : '';

export const globeMapStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'ocean-background',
      type: 'background',
      paint: {
        'background-color': OCEAN_COLOR,
      },
    },
  ],
};

export const globeSky: SkySpecification = {
  'sky-color': '#071018',
  'horizon-color': '#9ec4d4',
  'fog-color': OCEAN_COLOR,
  'sky-horizon-blend': 0.5,
  'horizon-fog-blend': 0.4,
  'fog-ground-blend': 0.15,
  'atmosphere-blend': [
    'interpolate',
    ['linear'],
    ['zoom'],
    1,
    1,
    5,
    0.35,
    8,
    0,
  ],
};
