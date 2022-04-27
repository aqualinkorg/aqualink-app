/* eslint-disable no-console */
/** Utility function to access the Sofar API and retrieve relevant data. */
import axios from 'axios';
import { isNil } from 'lodash';
import axiosRetry from 'axios-retry';
import moment from 'moment';
import { getStartEndDate } from './dates';
import {
  SOFAR_MARINE_URL,
  SOFAR_SENSOR_DATA_URL,
  SOFAR_WAVE_DATA_URL,
} from './constants';
import { SofarValue, SpotterData } from './sofar.types';

export const getLatestData = (
  sofarValues: SofarValue[] | undefined,
): SofarValue | undefined => {
  if (!sofarValues) {
    return undefined;
  }

  return sofarValues.reduce(
    (max, entry) =>
      new Date(entry.timestamp) > new Date(max.timestamp) ? entry : max,
    sofarValues[0],
  );
};

export const extractSofarValues = (sofarValues?: SofarValue[]): number[] =>
  sofarValues?.filter((data) => !isNil(data.value)).map(({ value }) => value) ||
  [];

export const filterSofarResponse = (responseData: any) => {
  return (
    responseData
      ? responseData.values.filter(
          (data: SofarValue) => !isNil(data.value) && data.value !== 9999,
        )
      : []
  ) as SofarValue[];
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
          `Sofar Hindcast API responded with a ${error.response.status} status. ${error.response.data.message}`,
        );
      } else {
        console.error(
          `An error occurred accessing the Sofar Hindcast API - ${error}`,
        );
      }
    });
}

export async function sofarForecast(
  modelId: string,
  variableID: string,
  latitude: number,
  longitude: number,
): Promise<SofarValue> {
  console.time(`sofarForecast for ${modelId}-${variableID}`);
  const forecast = await axios
    .get(`${SOFAR_MARINE_URL}${modelId}/forecast/point`, {
      params: {
        variableIDs: [variableID],
        latitude,
        longitude,
        token: process.env.SOFAR_API_TOKEN,
      },
    })
    .then((response) => {
      // Get latest live (forecast) data
      return response.data.forecastVariables[0].values[0];
    })
    .catch((error) => {
      if (error.response) {
        console.error(
          `Sofar Forecast API responded with a ${error.response.status} status. ${error.response.data.message}`,
        );
      } else {
        console.error(
          `An error occurred accessing the Sofar Forecast API - ${error}`,
        );
      }
    });
  console.timeEnd(`sofarForecast for ${modelId}-${variableID}`);
  return forecast;
}

export function sofarSensor(sensorId: string, start?: string, end?: string) {
  return axios
    .get(SOFAR_SENSOR_DATA_URL, {
      params: {
        spotterId: sensorId,
        startDate: start,
        endDate: end,
        token: process.env.SOFAR_API_TOKEN,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      if (error.response) {
        console.error(
          `Sofar API responded with a ${error.response.status} status for spotter ${sensorId}. ${error.response.data.message}`,
        );
      } else {
        console.error(`An error occured accessing the Sofar API - ${error}`);
      }
    });
}

export function sofarWaveData(sensorId: string, start?: string, end?: string) {
  return axios
    .get(SOFAR_WAVE_DATA_URL, {
      params: {
        spotterId: sensorId,
        startDate: start,
        endDate: end,
        limit: start && end ? 500 : 100,
        token: process.env.SOFAR_API_TOKEN,
        includeSurfaceTempData: true,
        includeWindData: true,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      if (error.response) {
        console.error(
          `Sofar API responded with a ${error.response.status} status for spotter ${sensorId}. ${error.response.data.message}`,
        );
      } else {
        console.error(`An error occured accessing the Sofar API - ${error}`);
      }
    });
}

export async function getSofarHindcastData(
  modelId: string,
  variableID: string,
  latitude: number,
  longitude: number,
  endDate: Date,
  hours?: number,
) {
  const [start, end] = getStartEndDate(endDate, hours);
  // Get data for model and return values
  console.time(`getSofarHindcast for ${modelId}-${variableID}`);
  const hindcastVariables = await sofarHindcast(
    modelId,
    variableID,
    latitude,
    longitude,
    start,
    end,
  );
  console.timeEnd(`getSofarHindcast for ${modelId}-${variableID}`);

  // Filter out unkown values
  return filterSofarResponse(hindcastVariables);
}

export async function getSpotterData(
  sensorId: string,
  endDate?: Date,
  startDate?: Date,
): Promise<SpotterData> {
  console.time(`getSpotterData for sensor ${sensorId}`);
  const [start, end] =
    endDate && !startDate
      ? getStartEndDate(endDate)
      : [
          startDate && moment(startDate).format(),
          endDate && moment(endDate).format(),
        ];

  const {
    data: { waves = [], wind = [] },
  } = (await sofarWaveData(sensorId, start, end)) || { data: {} };
  const { data: smartMooringData } = (await sofarSensor(
    sensorId,
    start,
    end,
  )) || { data: [] };

  const [
    sofarSignificantWaveHeight,
    sofarMeanPeriod,
    sofarMeanDirection,
    spotterLatitude,
    spotterLongitude,
  ]: [SofarValue[], SofarValue[], SofarValue[], SofarValue[], SofarValue[]] =
    waves.reduce(
      (
        [
          significantWaveHeights,
          meanPeriods,
          meanDirections,
          latitude,
          longitude,
        ],
        data,
      ) => {
        return [
          significantWaveHeights.concat({
            timestamp: data.timestamp,
            value: data.significantWaveHeight,
          }),
          meanPeriods.concat({
            timestamp: data.timestamp,
            value: data.meanPeriod,
          }),
          meanDirections.concat({
            timestamp: data.timestamp,
            value: data.meanDirection,
          }),
          latitude.concat({
            timestamp: data.timestamp,
            value: data.latitude,
          }),
          longitude.concat({
            timestamp: data.timestamp,
            value: data.longitude,
          }),
        ];
      },
      [[], [], [], [], []],
    );

  const [sofarWindSpeed, sofarWindDirection]: [SofarValue[], SofarValue[]] =
    wind.reduce(
      ([speed, direction], data) => {
        return [
          speed.concat({
            timestamp: data.timestamp,
            value: data.speed,
          }),
          direction.concat({
            timestamp: data.timestamp,
            value: data.direction,
          }),
        ];
      },
      [[], []],
    );

  // Sofar increments sensors by distance to the spotter.
  // Sensor 1 -> topTemp and Sensor 2 -> bottomTemp
  const [sofarTopTemperature, sofarBottomTemperature]: [
    SofarValue[],
    SofarValue[],
  ] = smartMooringData.reduce(
    ([sensor1Data, sensor2Data], data) => {
      const { sensorPosition, unit_type: unitType } = data;

      if (sensorPosition === 1 && unitType === 'temperature') {
        return [
          sensor1Data.concat({
            timestamp: data.timestamp,
            value: data.value,
          }),
          sensor2Data,
        ];
      }
      if (sensorPosition === 2 && unitType === 'temperature') {
        return [
          sensor1Data,
          sensor2Data.concat({
            timestamp: data.timestamp,
            value: data.value,
          }),
        ];
      }

      return [sensor1Data, sensor2Data];
    },
    [[], []],
  );

  console.timeEnd(`getSpotterData for sensor ${sensorId}`);

  return {
    topTemperature: sofarTopTemperature.filter((data) => !isNil(data.value)),
    bottomTemperature: sofarBottomTemperature.filter(
      (data) => !isNil(data.value),
    ),
    significantWaveHeight: sofarSignificantWaveHeight,
    waveMeanPeriod: sofarMeanPeriod,
    waveMeanDirection: sofarMeanDirection,
    windSpeed: sofarWindSpeed,
    windDirection: sofarWindDirection,
    latitude: spotterLatitude,
    longitude: spotterLongitude,
  };
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
