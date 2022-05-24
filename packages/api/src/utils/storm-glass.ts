import axios from 'axios';
import axiosRetry from 'axios-retry';
import { STORM_GLASS_API_KEY, STORM_GLASS_BASE_URL } from './storm-glass.const';
import {
  StormGlassWeatherProps,
  StormGlassWeatherQueryProps,
} from './storm-glass.types';

axiosRetry(axios, { retries: 3 });

export async function stormGlassGetWeather({
  latitude,
  longitude,
  params,
  source,
  start,
  end,
}: StormGlassWeatherProps) {
  const queryParams: StormGlassWeatherQueryProps = {
    lat: latitude,
    lng: longitude,
    params: params.join(','),
  };

  if (source) {
    // eslint-disable-next-line fp/no-mutation
    queryParams.source = Array.isArray(source) ? source.join(',') : source;
  }

  if (start) {
    // eslint-disable-next-line fp/no-mutation
    queryParams.start = start;
  }

  if (end) {
    // eslint-disable-next-line fp/no-mutation
    queryParams.end = end;
  }

  return axios
    .get(`${STORM_GLASS_BASE_URL}/weather/point`, {
      headers: {
        Authorization: STORM_GLASS_API_KEY,
      },
      params: queryParams,
    })
    .then((response) => {
      return response.data.hours;
    })
    .catch((error) => {
      if (error.response) {
        console.error(
          `StormGlass API /weather/point responded with a ${error.response.status} status. ${error.response.data.message}`,
        );
      } else {
        console.error(
          `An error occurred accessing the StormGlass API /weather/point - ${error}`,
        );
      }
    });
}
