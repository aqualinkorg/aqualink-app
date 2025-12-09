/* eslint-disable no-console */
/** Utility function to access the Sofar API and retrieve relevant data. */
import { isNil } from 'lodash';
import { DateTime } from '../luxon-extensions';
import axios from './retry-axios';
import { getStartEndDate } from './dates';
import {
  SOFAR_LATEST_DATA_URL,
  SOFAR_MARINE_URL,
  SOFAR_SENSOR_DATA_URL,
  SOFAR_WAVE_DATA_URL,
} from './constants';
import {
  ValueWithTimestamp,
  SpotterData,
  HindcastResponse,
  EMPTY_SOFAR_WAVE_RESPONSE,
  SofarWaveDateResponse,
} from './sofar.types';
import { sendSlackMessage, SlackMessage } from './slack.utils';

export const getLatestData = (
  sofarValues: ValueWithTimestamp[] | undefined,
): ValueWithTimestamp | undefined => {
  if (!sofarValues) {
    return undefined;
  }

  return sofarValues.reduce(
    (max, entry) =>
      new Date(entry.timestamp) > new Date(max.timestamp) ? entry : max,
    sofarValues[0],
  );
};

export const filterSofarResponse = (responseData: any) => {
  return (
    responseData
      ? responseData.values.filter(
          (data: ValueWithTimestamp) =>
            !isNil(data?.value) && data.value !== 9999,
        )
      : []
  ) as ValueWithTimestamp[];
};

async function sofarErrorHandler({
  error,
  sensorId,
  sendToSlack = false,
}: {
  error: any;
  sensorId?: string;
  sendToSlack?: boolean;
}) {
  if (error.response) {
    const spotterMessagePart = sensorId ? `for spotter ${sensorId}.` : '.';
    const message = `Sofar API responded with a ${error.response.status} status ${spotterMessagePart} ${error.response.data.message}`;
    console.error(message);

    if (!sendToSlack) {
      return;
    }
    if ([401, 403].includes(error.response.status)) {
      const messageTemplate: SlackMessage = {
        channel: process.env.SLACK_BOT_CHANNEL as string,
        text: message,
        mrkdwn: true,
      };

      await sendSlackMessage(
        messageTemplate,
        process.env.SLACK_BOT_TOKEN as string,
      );
    }
  } else {
    console.error(`An error occurred accessing the Sofar API - ${error}`);
  }
}

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
      paramsSerializer: {
        indexes: null,
      },
    })
    .then((response) => {
      // The api return an array of requested variables, but since we request one, ours it's always first
      if (!response.data.hindcastVariables[0]) {
        console.error(
          `No Hindcast variable '${variableID}' available for ${latitude}, ${longitude}`,
        );
        return undefined;
      }
      return response.data.hindcastVariables[0] as HindcastResponse;
    })
    .catch((error) => sofarErrorHandler({ error }));
}

export function sofarSensor(
  sensorId: string,
  token?: string,
  start?: string,
  end?: string,
  includeSmartMooringData?: boolean,
) {
  return axios
    .get(SOFAR_SENSOR_DATA_URL, {
      params: {
        spotterId: sensorId,
        startDate: start,
        endDate: end,
        token,
        ...(includeSmartMooringData && { includeSmartMooringData: true }),
      },
    })
    .then((response) => response.data)
    .catch((error) =>
      sofarErrorHandler({ error, sensorId, sendToSlack: true }),
    );
}

export function sofarWaveData(
  sensorId: string,
  token?: string,
  start?: string,
  end?: string,
) {
  return axios
    .get(SOFAR_WAVE_DATA_URL, {
      params: {
        spotterId: sensorId,
        startDate: start,
        endDate: end,
        limit: start && end ? 500 : 100,
        token,
        includeSurfaceTempData: true,
        includeWindData: true,
        includeBarometerData: true,
      },
    })
    .then((response) => {
      // API returns { data: { spotterId, waves, ... } }
      // axios wraps it, so response.data = { data: { spotterId, waves, ... } }
      const waveData = response.data?.data || response.data;
      return { data: waveData as SofarWaveDateResponse };
    })
    .catch((error) => {
      sofarErrorHandler({ error, sensorId });
      return undefined;
    });
}

export async function sofarLatest({
  sensorId,
  token,
}: {
  sensorId: string;
  token?: string;
}) {
  return axios
    .get(SOFAR_LATEST_DATA_URL, {
      params: {
        spotterId: sensorId,
        token,
      },
    })
    .then((response) => response.data.data)
    .catch((error) =>
      sofarErrorHandler({ error, sensorId, sendToSlack: true }),
    );
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
  // console.time(`getSofarHindcast ${modelId}-${variableID} for lat ${latitude}`);
  const hindcastVariables = await sofarHindcast(
    modelId,
    variableID,
    latitude,
    longitude,
    start,
    end,
  );
  // console.timeEnd(
  //   `getSofarHindcast ${modelId}-${variableID} for lat ${latitude}`,
  // );

  // Filter out unknown values
  return filterSofarResponse(hindcastVariables);
}

export async function getSpotterData(
  sensorId: string,
  sofarToken?: string,
  endDate?: Date,
  startDate?: Date,
  includeSeapHOxData?: boolean,
): Promise<SpotterData> {
  console.time(`getSpotterData for sensor ${sensorId}`);
  const [start, end] =
    endDate && !startDate
      ? getStartEndDate(endDate)
      : [
          startDate && DateTime.fromJSDate(startDate).toString(),
          endDate && DateTime.fromJSDate(endDate).toString(),
        ];

  const {
    data: { waves = [], wind = [], barometerData = [], surfaceTemp = [] },
  } = (await sofarWaveData(sensorId, sofarToken, start, end)) || {
    data: EMPTY_SOFAR_WAVE_RESPONSE,
  };
  const { data: smartMooringData } = (await sofarSensor(
    sensorId,
    sofarToken,
    start,
    end,
    includeSeapHOxData,
  )) || { data: [] };

  const sofarSpotterSurfaceTemp: ValueWithTimestamp[] = surfaceTemp.map(
    (x) => ({
      timestamp: x.timestamp,
      value: x.degrees,
    }),
  );

  const [
    sofarSignificantWaveHeight,
    sofarMeanPeriod,
    sofarMeanDirection,
    spotterLatitude,
    spotterLongitude,
  ] = waves.reduce(
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
    [[], [], [], [], []] as [
      ValueWithTimestamp[],
      ValueWithTimestamp[],
      ValueWithTimestamp[],
      ValueWithTimestamp[],
      ValueWithTimestamp[],
    ],
  );

  const [sofarWindSpeed, sofarWindDirection] = wind.reduce(
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
    [[], []] as [ValueWithTimestamp[], ValueWithTimestamp[]],
  );

  const spotterBarometerTop: ValueWithTimestamp[] = barometerData.map(
    (data) => ({
      timestamp: data.timestamp,
      value: data.value,
    }),
  );

  const spotterBarometricTopDiff = getBarometricDiff(spotterBarometerTop);

  // Sofar increments sensors by distance to the spotter.
  // Sensor 1 -> top and Sensor 2 -> bottom
  const [sofarTopTemperature, sofarBottomTemperature, sofarBottomPressure]: [
    ValueWithTimestamp[],
    ValueWithTimestamp[],
    ValueWithTimestamp[],
  ] = smartMooringData.reduce(
    ([topTemp, bottomTemp, bottomPressure], data) => {
      const { sensorPosition, unit_type: unitType } = data;

      if (sensorPosition === 1 && unitType === 'temperature') {
        return [
          topTemp.concat({
            timestamp: data.timestamp,
            value: data.value,
          }),
          bottomTemp,
          bottomPressure,
        ];
      }
      if (sensorPosition === 2 && unitType === 'temperature') {
        return [
          topTemp,
          bottomTemp.concat({
            timestamp: data.timestamp,
            value: data.value,
          }),
          bottomPressure,
        ];
      }
      if (sensorPosition === 2 && unitType === 'pressure') {
        return [
          topTemp,
          bottomTemp,
          bottomPressure.concat({
            timestamp: data.timestamp,
            // convert micro bar to hPa
            value: data.value / 1000,
          }),
        ];
      }

      return [topTemp, bottomTemp, bottomPressure];
    },
    [[], [], []],
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
    barometerTop: spotterBarometerTop,
    barometerBottom: sofarBottomPressure.filter((data) => !isNil(data.value)),
    barometricTopDiff: spotterBarometricTopDiff
      ? [spotterBarometricTopDiff]
      : [],
    surfaceTemperature: sofarSpotterSurfaceTemp,
    latitude: spotterLatitude,
    longitude: spotterLongitude,
    raw: smartMooringData,
  };
}

/** Utility function to get the closest available data given a date in UTC. */
export function getValueClosestToDate(
  sofarValues: ValueWithTimestamp[],
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

export function getBarometricDiff(spotterBarometer: ValueWithTimestamp[]) {
  const lastTowPressures = spotterBarometer?.slice(-2);
  const valueDiff =
    lastTowPressures?.length === 2
      ? lastTowPressures[1].value - lastTowPressures[0].value
      : undefined;

  const spotterBarometricDiff: ValueWithTimestamp | null = valueDiff
    ? {
        value: valueDiff,
        timestamp: lastTowPressures![1].timestamp,
      }
    : null;

  return spotterBarometricDiff;
}
