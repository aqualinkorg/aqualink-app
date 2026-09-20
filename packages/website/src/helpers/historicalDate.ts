import { DateTime } from 'luxon-extensions';
import type { CollectionData, LatestDataASSofarValue } from 'store/Sites/types';

const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const todayDateParam = () => DateTime.now().toFormat('yyyy-MM-dd');

/**
 * A `date` query parameter is only honored as a calendar date (YYYY-MM-DD)
 * that is not in the future.
 */
export const isHistoricalDateParam = (value: string) => {
  if (!DATE_PARAM_REGEX.test(value)) {
    return false;
  }

  const date = DateTime.fromISO(value, { zone: 'UTC' });
  return date.isValid && date <= DateTime.now().endOf('day');
};

/**
 * Shape historical collection data (resolved by the API from daily_data) like
 * the live `latestData` values so the site detail cards can render it.
 * Timestamps point at the actual observation, not the requested date.
 */
export const getHistoricalCardData = (
  data?: CollectionData,
): LatestDataASSofarValue => {
  if (!data?.observationDate) {
    return {};
  }
  const timestamp = data.observationDate;
  return {
    ...(data.dhw !== undefined ? { dhw: { value: data.dhw, timestamp } } : {}),
    ...(data.satelliteTemperature !== undefined
      ? {
          satelliteTemperature: {
            value: data.satelliteTemperature,
            timestamp,
          },
        }
      : {}),
    ...(data.tempAlert !== undefined
      ? { tempAlert: { value: data.tempAlert, timestamp } }
      : {}),
    ...(data.tempWeeklyAlert !== undefined
      ? { tempWeeklyAlert: { value: data.tempWeeklyAlert, timestamp } }
      : {}),
  };
};
