/* eslint-disable no-console */
/** Utility functions to access the Open-Meteo Marine API for wave data. */
import { chunk, isNil } from 'lodash';
import pLimit from 'p-limit';
import axios from './retry-axios';
import {
  OPEN_METEO_BATCH_SIZE,
  OPEN_METEO_CONCURRENCY,
  OPEN_METEO_CUSTOMER_URL,
  OPEN_METEO_FREE_URL,
} from './constants';
import { OpenMeteoMarineResponse, OpenMeteoWaveData } from './open-meteo.types';
import { sendSlackMessage, SlackMessage } from './slack.utils';
import { ValueWithTimestamp } from './sofar.types';

/**
 * Resolve the Marine API endpoint based on env config.
 * Priority: OPEN_METEO_BASE_URL > customer URL (if API key set) > free URL.
 */
function getOpenMeteoUrl(): string {
  if (process.env.OPEN_METEO_BASE_URL) {
    return process.env.OPEN_METEO_BASE_URL;
  }
  return process.env.OPEN_METEO_API_KEY
    ? OPEN_METEO_CUSTOMER_URL
    : OPEN_METEO_FREE_URL;
}

async function openMeteoErrorHandler({
  error,
  sendToSlack = false,
}: {
  error: any;
  sendToSlack?: boolean;
}) {
  if (error.response) {
    const reason = error.response.data?.reason || '';
    const message = `Open-Meteo API responded with a ${error.response.status} status. ${reason}`;
    console.error(message);

    if (!sendToSlack) return;

    if ([401, 403, 429].includes(error.response.status)) {
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
    console.error(`An error occurred accessing the Open-Meteo API - ${error}`);
  }
}

/**
 * Pick the most recent non-null hourly value at or before "now".
 *
 * Open-Meteo returns hourly arrays that include past + forecast values.
 * We want the latest observed/hindcast value, matching the prior Sofar
 * behaviour (which returned the last entry of a past-only response).
 *
 * Implemented functionally (map + filter) rather than an imperative
 * backwards loop, per project ESLint rules disallowing mutation/continue.
 */
function extractLatestValue(
  times: string[],
  values: (number | null)[] | undefined,
): ValueWithTimestamp | undefined {
  if (!values || values.length === 0) return undefined;

  const now = Date.now();

  const validEntries = values
    .map((value, index) => ({ value, timestamp: times[index] }))
    .filter(
      (entry): entry is { value: number; timestamp: string } =>
        !isNil(entry.value) &&
        !Number.isNaN(entry.value) &&
        new Date(entry.timestamp).getTime() <= now,
    );

  return validEntries.length > 0
    ? validEntries[validEntries.length - 1]
    : undefined;
}

/**
 * Fetch wave data for one batch of sites in a single Marine API call.
 * Returns one OpenMeteoWaveData per input coordinate, in the same order.
 * On error, returns an array of undefined so callers can skip those sites.
 */
async function openMeteoMarineFetch(
  coordinates: Array<[number, number]>,
): Promise<(OpenMeteoWaveData | undefined)[]> {
  if (coordinates.length === 0) return [];

  const latitudes = coordinates.map(([lat]) => lat).join(',');
  const longitudes = coordinates.map(([, lng]) => lng).join(',');

  try {
    const response = await axios.get(getOpenMeteoUrl(), {
      params: {
        latitude: latitudes,
        longitude: longitudes,
        hourly: 'wave_height,wave_direction,wave_period',
        cell_selection: 'sea',
        past_days: 1,
        forecast_days: 1,
        ...(process.env.OPEN_METEO_API_KEY && {
          apikey: process.env.OPEN_METEO_API_KEY,
        }),
      },
    });

    const results: OpenMeteoMarineResponse[] = Array.isArray(response.data)
      ? response.data
      : [response.data];

    return coordinates.map((_, i) => {
      const r = results[i];
      if (!r) return undefined;

      const times = r.hourly?.time ?? [];
      return {
        waveHeight: extractLatestValue(times, r.hourly?.wave_height),
        waveDirection: extractLatestValue(times, r.hourly?.wave_direction),
        wavePeriod: extractLatestValue(times, r.hourly?.wave_period),
      };
    });
  } catch (error) {
    await openMeteoErrorHandler({ error, sendToSlack: true });
    return coordinates.map(() => undefined);
  }
}

/**
 * Fetch wave data for an arbitrary number of sites, split into batched
 * Marine API calls. Returns results in the same order as input.
 *
 * Uses lodash `chunk` rather than a manual loop + push, per project
 * ESLint rules disallowing mutating array methods.
 */
export async function openMeteoMarineBatch(
  coordinates: Array<[number, number]>,
): Promise<(OpenMeteoWaveData | undefined)[]> {
  const batches = chunk(coordinates, OPEN_METEO_BATCH_SIZE);

  const limit = pLimit(OPEN_METEO_CONCURRENCY);
  const batchResults = await Promise.all(
    batches.map((batch) => limit(() => openMeteoMarineFetch(batch))),
  );

  return batchResults.flat();
}
