import type { TimeSeriesDataRange } from 'store/Sites/types';
import { DateTime } from 'luxon-extensions';

export const validHistoricalDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  DateTime.fromISO(value, { zone: 'utc' }).isValid &&
  value <= DateTime.utc().toISODate()!;

export const historicalEnd = (asOf: string) =>
  DateTime.fromISO(asOf, { zone: 'utc' }).endOf('day').toISOString();

export const withHistoricalDate = (path: string, asOf?: string) => {
  const url = new URL(path, 'https://aqualink.org');
  if (asOf) url.searchParams.set('asOf', asOf);
  else url.searchParams.delete('asOf');
  return `${url.pathname}${url.search}${url.hash}`;
};

export const historicalRequestEnd = (
  end: string | undefined,
  asOf?: string,
) => {
  if (!asOf) return end;
  const cutoff = historicalEnd(asOf);
  return end && DateTime.fromISO(end) < DateTime.fromISO(cutoff) ? end : cutoff;
};

export const historicalRanges = (
  ranges: TimeSeriesDataRange,
  asOf?: string,
): TimeSeriesDataRange => {
  if (!asOf) return ranges;
  const cutoff = historicalEnd(asOf);
  return Object.fromEntries(
    Object.entries(ranges).map(([metric, sources]) => [
      metric,
      sources
        .map((source) => ({
          ...source,
          data: source.data
            .filter(
              (range) =>
                DateTime.fromISO(range.minDate) <= DateTime.fromISO(cutoff),
            )
            .map((range) => ({
              ...range,
              maxDate: historicalRequestEnd(range.maxDate, asOf)!,
            })),
        }))
        .filter((source) => source.data.length > 0),
    ]),
  );
};

export const onOrBeforeHistoricalDate = (
  date: string | null | undefined,
  asOf?: string,
) =>
  !asOf ||
  Boolean(
    date && DateTime.fromISO(date) <= DateTime.fromISO(historicalEnd(asOf)),
  );
