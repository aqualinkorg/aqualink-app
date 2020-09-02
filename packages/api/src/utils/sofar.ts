/** Utility function to access the Sofar API and retrieve relevant data. */
import axios from 'axios';
import axiosRetry from 'axios-retry';
import moment from 'moment-timezone';
import { SOFAR_MARINE_URL, SOFAR_SPOTTER_URL } from './constants';

type SofarValue = {
  timestamp: string;
  value: number;
};

axiosRetry(axios, { retries: 3 });

export async function sofarHindcast(
  modelId: string,
  variableID: string,
  latitude: number,
  longitude: number,
  start: string,
  end: string,
) {
  return axios
    .get(`${SOFAR_MARINE_URL}${modelId}/hindcast/point`, {
      params: {
        variableIDs: [variableID],
        latitude,
        longitude,
        start,
        end,
        token: process.env.SOFAR_API_TOKEN,
      },
    })
    .then((response) => {
      return response.data.hindcastVariables[0];
    })
    .catch((error) => {
      if (error.response) {
        console.error(
          `Sofar API responded with a ${error.response.status} status. ${error.response.message}`,
        );
      } else {
        console.error(`An error occured accessing the Sofar API - ${error}`);
      }
    });
}

export async function sofarSpotter(
  spotterId: string,
  start: string,
  end: string,
) {
  return axios
    .get(SOFAR_SPOTTER_URL, {
      params: {
        spotterId,
        startDate: start,
        endDate: end,
        limit: 500,
        token: process.env.SOFAR_API_TOKEN,
        includeSmartMooringData: true,
        includeSurfaceTempData: true,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        console.error(
          `Sofar API responded with a ${error.response.status} status. ${error.response.message}`,
        );
      } else {
        console.error(`An error occured accessing the Sofar API - ${error}`);
      }
    });
}

function getStartEndDate(date: Date, localTimezone: string) {
  const m = moment.tz(date, localTimezone);
  const start = m.clone().startOf('day').utc().format();
  const end = m.clone().endOf('day').utc().format();
  return [start, end];
}

export async function getSofarDailyData(
  modelId: string,
  variableID: string,
  latitude: number,
  longitude: number,
  localTimezone: string,
  date: Date,
) {
  // Get day equivalent in timezone using geo-tz to compute "start" and "end".
  // We fetch daily data from midnight to midnight LOCAL time.
  const [start, end] = getStartEndDate(date, localTimezone);
  // Get data for model and return values
  const hindcastVariables = await sofarHindcast(
    modelId,
    variableID,
    latitude,
    longitude,
    start,
    end,
  );

  // Filter out unkown values
  return (hindcastVariables
    ? hindcastVariables.values.filter(
        (data: SofarValue) => data.value && data.value !== 9999,
      )
    : []) as SofarValue[];
}

type SpotterData = {
  surfaceTemperature: number[];
  bottomTemperature: number[];
};

type SensorData = {
  sensorPosition: number;
  degrees: number;
};

function getDataBySensorPosition(data: SensorData[], sensorPosition: number) {
  return data.find((d) => d.sensorPosition === sensorPosition)?.degrees;
}

export async function getSpotterData(
  // eslint-disable-next-line no-unused-vars
  spotterId: string,
  localTimezone: string,
  // eslint-disable-next-line no-unused-vars
  date: Date,
): Promise<SpotterData> {
  // TODO - Get waves data from spotters.
  const [start, end] = getStartEndDate(date, localTimezone);
  const {
    data: { smartMooringData = [] },
  } = await sofarSpotter(spotterId, start, end);

  const [sofarBottomTemperature, sofarSurfaceTemperature]: [
    SofarValue[],
    SofarValue[],
  ] = smartMooringData.reduce(
    ([sensor0Data, sensor1Data], data) => {
      getDataBySensorPosition(data.sensorData, 0);
      return [
        sensor0Data.concat({
          timestamp: data.timestamp,
          value: getDataBySensorPosition(data.sensorData, 0),
        }),
        sensor1Data.concat({
          timestamp: data.timestamp,
          value: getDataBySensorPosition(data.sensorData, 1),
        }),
      ];
    },
    [[], []],
  );

  const bottomTemperature = sofarBottomTemperature
    .filter((data) => data.value !== undefined)
    .map(({ value }) => value);

  const surfaceTemperature = sofarSurfaceTemperature
    .filter((data) => data.value !== undefined)
    .map(({ value }) => value);

  return { surfaceTemperature, bottomTemperature };
}

/** Utility function to get the closest available data given a date in UTC. */
export function getValueClosestToDate(
  sofarValues: SofarValue[],
  utcDate: Date,
) {
  const timeDiff = (timestamp: string) =>
    Math.abs(new Date(timestamp).getTime() - utcDate.getTime());

  return sofarValues.reduce((prevClosest, nextPoint) =>
    timeDiff(prevClosest.timestamp) > timeDiff(nextPoint.timestamp)
      ? nextPoint
      : prevClosest,
  ).value;
}
