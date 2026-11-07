import { isNil } from 'lodash';
import type { DailyData, LatestData, MetricsKeys, SiteRequestArgs } from './types';

const HISTORICAL_DATE_PARAM = 'date';
const ISO_CALENDAR_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns today's UTC calendar date formatted as YYYY-MM-DD to bound
 * historical date selection to today or dates in the past.
 */
export const getTodayUtcDateString = (): string =>
  new Date().toISOString().slice(0, 10);

/**
 * Validates that a candidate date string is a well-formed YYYY-MM-DD calendar
 * date that is not in the future relative to UTC today.
 */
export const isValidHistoricalDate = (
  value?: string | null,
): value is string => {
  if (!value || !ISO_CALENDAR_DATE_REGEX.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const normalized = parsed.toISOString().slice(0, 10);
  return normalized === value && value <= getTodayUtcDateString();
};

/**
 * Reads the validated historical date parameter from the browser query string.
 */
export const readHistoricalDateFromUrl = (
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): string | null => {
  const params = new URLSearchParams(search);
  const candidate = params.get(HISTORICAL_DATE_PARAM);
  return isValidHistoricalDate(candidate) ? candidate : null;
};

/**
 * Synchronizes the selected historical date with the browser URL query string
 * while preserving existing map, site, and filter parameters.
 */
export const writeHistoricalDateToUrl = (date?: string | null): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  if (isValidHistoricalDate(date)) {
    params.set(HISTORICAL_DATE_PARAM, date);
  } else {
    params.delete(HISTORICAL_DATE_PARAM);
  }
  const queryString = params.toString();
  const nextUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;
  window.history.replaceState(null, '', nextUrl);
};

/**
 * Converts a YYYY-MM-DD date string into the inclusive UTC end-of-day ISO timestamp
 * used to bound historical daily_data queries.
 */
export const toHistoricalEndOfDayIso = (date: string): string =>
  `${date}T23:59:59.999Z`;

/**
 * Normalizes the polymorphic SiteRequestArgs input into a structured { id, date } pair.
 */
export const normalizeSiteRequestArgs = (
  args: SiteRequestArgs,
): { id: string; date?: string } => {
  if (typeof args === 'string') {
    return { id: args };
  }
  return {
    id: args.id,
    date: isValidHistoricalDate(args.date) ? args.date : undefined,
  };
};

const createHistoricalMetricEntry = (
  base: { id: number; timestamp: string },
  entry: { metric: MetricsKeys; value: number | null | undefined },
): LatestData | null => {
  if (isNil(entry.value)) {
    return null;
  }
  return {
    id: base.id,
    timestamp: base.timestamp,
    value: entry.value,
    site: { id: base.id },
    source: 'noaa',
    metric: entry.metric,
  };
};

/**
 * Converts the most recent daily_data observation on or before a selected historical
 * date into LatestData items preserving the true observation timestamp so site cards
 * never relabel older observations or fall back to live telemetry.
 */
export const buildHistoricalLatestData = (
  dailyData?: DailyData[],
): LatestData[] => {
  const latestObservation = dailyData?.[0];
  if (!latestObservation) {
    return [];
  }

  const base = {
    id: latestObservation.id,
    timestamp: latestObservation.date,
  };
  const weeklyAlert =
    latestObservation.weeklyAlertLevel ?? latestObservation.dailyAlertLevel;

  const candidates: Array<{
    metric: MetricsKeys;
    value: number | null | undefined;
  }> = [
    {
      metric: 'satellite_temperature',
      value: latestObservation.satelliteTemperature,
    },
    {
      metric: 'dhw',
      value: isNil(latestObservation.degreeHeatingDays)
        ? null
        : latestObservation.degreeHeatingDays / 7,
    },
    {
      metric: 'temp_alert',
      value: latestObservation.dailyAlertLevel,
    },
    {
      metric: 'temp_weekly_alert',
      value: weeklyAlert,
    },
  ];

  return candidates
    .map((candidate) => createHistoricalMetricEntry(base, candidate))
    .filter((item): item is LatestData => item !== null);
};
