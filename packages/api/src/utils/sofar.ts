/** Utility function to access the Sofar APIand retrieve relevant data. */
import { get } from 'lodash';
import * as superagent from 'superagent';
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
  const response = await superagent
    .get(`${SOFAR_MARINE_URL}${modelId}/hindcast/point`)
    .query({
      variableIDs: [variableID],
      latitude,
      longitude,
      start,
      end,
      token: SOFAR_API_TOKEN,
    });
  return response.body.hindcastVariables[0];
}

export async function getSofarDailyData(
  modelId: string,
  variableID: string,
  latitude: number,
  longitude: number,
  date: Date,
) {
  // Get day equivalent in timezone using geo-tz to compute "start" and "end".
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

export function getValueClosestToDate(sofarValues: SofarValue[], date: Date) {
  const index = sofarValues.reduce((r, a, i, aa) => {
    return i &&
      Math.abs(new Date(aa[r].timestamp).getTime() - date.getTime()) <
        Math.abs(new Date(a.timestamp).getTime() - date.getTime())
      ? r
      : i;
  }, -1);
  return sofarValues[index].value;
}
