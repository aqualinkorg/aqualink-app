import axios from 'axios';

import type { MapboxGeolocationData } from 'store/Homepage/types';

const { VITEMAPBOX_ACCESS_TOKEN: mapboxToken } = import.meta.env;
const mapboxBaseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

const getLocation = (location: string) =>
  axios({
    method: 'GET',
    url: `${mapboxBaseUrl}${location}.json`,
    params: {
      access_token: mapboxToken,
    },
  }).then(({ data }) => {
    const feature = data.features[0];
    const response: MapboxGeolocationData = {
      bbox: {
        southWest: [feature.bbox[1], feature.bbox[0]],
        northEast: [feature.bbox[3], feature.bbox[2]],
      },
      placeName: feature.place_name,
    };
    return response;
  });

export default { getLocation };
