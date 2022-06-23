import axios from './retry-axios';
import {
  StormGlassWeatherProps,
  StormGlassWeatherQueryProps,
} from './storm-glass.types';
import { STORM_GLASS_BASE_URL } from './constants';
import { ValueWithTimestamp } from './sofar.types';

export async function stormGlassGetWeather({
  latitude,
  longitude,
  params,
  source,
  start,
  end,
  raw = false,
}: StormGlassWeatherProps): Promise<
  Record<StormGlassWeatherQueryProps['params'], ValueWithTimestamp>
> {
  const queryParams: StormGlassWeatherQueryProps = {
    lat: latitude,
    lng: longitude,
    params: params.join(','),
    ...(source && {
      source: Array.isArray(source) ? source.join(',') : source,
    }),
    ...(start && { start }),
    ...(end && { end }),
  };

  return axios
    .get(`${STORM_GLASS_BASE_URL}/weather/point`, {
      headers: {
        Authorization: process.env.STORMGLASS_API_KEY,
      },
      params: queryParams,
    })
    .then((response) => {
      if (raw) return response.data;
      return response.data.hours[0];
    })
    .then((data) => {
      if (raw) return data;

      const { time, ...other } = data;
      const entries = Object.entries(other).map((prop) => {
        const arrValues: number[] = Object.values(prop[1] as {});
        const sum = arrValues.reduce((a, b) => a + b, 0);
        const avgValue = sum / arrValues.length;

        return [
          prop[0],
          {
            timestamp: time,
            value: avgValue,
          },
        ];
      });

      return Object.fromEntries(entries);
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
