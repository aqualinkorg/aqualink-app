/** Utility function to access the Sofar APIand retrieve relevant data. */
import { get } from 'lodash';
import axios from 'axios';
import geoTz from 'geo-tz';
import moment from 'moment-timezone';
import {
  SOFAR_API_TOKEN,
  SOFAR_MARINE_URL,
  // SOFAR_SPOTTER_URL,
} from './constants';

type SofarValue = {
  timestamp: string;
  value: number;
};

export async function sofarHindcast(
  modelId: string,
  variableID: string,
  latitude: number,
  longitude: number,
  start: string,
  end: string,
) {
  const response = await axios.get(
    `${SOFAR_MARINE_URL}${modelId}/hindcast/point`,
    {
      params: {
        variableIDs: [variableID],
        latitude,
        longitude,
        start,
        end,
        token: SOFAR_API_TOKEN,
      },
    },
  );
  return response.data.hindcastVariables[0];
}

export async function getSofarDailyData(
  modelId: string,
  variableID: string,
  latitude: number,
  longitude: number,
  date: Date,
) {
  // Get day equivalent in timezone using geo-tz to compute "start" and "end".
  // We fetch daily data from midnight to midnight LOCAL time.
  const timezone = get(geoTz(latitude, longitude), 0, '') as string;
  const m = moment.tz(date, timezone);
  const start = m.clone().startOf('day').utc().format();
  const end = m.clone().endOf('day').utc().format();
  // Get data for model and return values
  const hindcastVariables = await sofarHindcast(
    modelId,
    variableID,
    latitude,
    longitude,
    start,
    end,
  );

  return hindcastVariables.values as SofarValue[];
}

type SpotterData = {
  surfaceTemperature: number;
  bottomTemperature: number[];
};

export async function getSpotterData(
  spotterId: string,
  date: Date,
): Promise<SpotterData> {
  // TODO - Implement Spotter Data Retrieval
  // https://docs.sofarocean.com/spotter-sensor
  // getSofarSpotterData()
  // using SOFAR_SPOTTER_URL
  return { surfaceTemperature: 20, bottomTemperature: [0] };
}

/** Utility function to get the closest available data given a date in UTC. */
export function getValueClosestToDate(sofarValues: SofarValue[], date: Date) {
  const timeDiff = (timestamp: string) =>
    Math.abs(new Date(timestamp).getTime() - date.getTime());

  return sofarValues.reduce((prevClosest, nextPoint) =>
    timeDiff(prevClosest.timestamp) > timeDiff(nextPoint.timestamp)
      ? nextPoint
      : prevClosest,
  ).value;
}
