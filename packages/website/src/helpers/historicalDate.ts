import { Site } from 'store/Sites/types';
import { convertToLocalTime } from './dates';
import { alertColorFinder } from './bleachingAlertIntervals';

export const utcToday = () => new Date().toISOString().slice(0, 10);

export const isHistoricalDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  date.slice(0, 4) !== '0000' &&
  Number.isFinite(Date.parse(`${date}T00:00:00.000Z`)) &&
  new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) === date &&
  date <= utcToday();

export const historicalDateError = (search: string) => {
  const params = new URLSearchParams(search);
  const dates = params.getAll('date');
  const malformedKey = [...params.keys()].some((key) =>
    key.startsWith('date['),
  );
  return malformedKey ||
    (dates.length > 0 && (dates.length !== 1 || !isHistoricalDate(dates[0])))
    ? 'Choose one valid calendar date on or before today (UTC).'
    : undefined;
};

export const withHistoricalDate = (path: string, date?: string) =>
  date ? `${path}?date=${encodeURIComponent(date)}` : path;

export const changeHistoricalDate = (search: string, date?: string) => {
  const params = new URLSearchParams(search);
  [...params.keys()]
    .filter((key) => key === 'date' || key.startsWith('date['))
    .forEach((key) => params.delete(key));
  if (date) params.set('date', date);
  return params.toString();
};

export const historicalDayRange = (date: string) => {
  const end = new Date(`${date}T23:59:59.999Z`);
  const start = new Date(`${date}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - 89);
  return { start: start.toISOString(), end: end.toISOString() };
};

export const historicalAlertColor = (site: Site) =>
  site.historicalDate && site.collectionData?.tempWeeklyAlert == null
    ? '#808080'
    : alertColorFinder(site.collectionData?.tempWeeklyAlert);

// Chart datasets represent UTC clock values in the browser's local zone.
export const historicalChartRange = (date: string) => {
  const range = historicalDayRange(date);
  return {
    start: convertToLocalTime(range.start, 'UTC'),
    end: convertToLocalTime(range.end, 'UTC'),
  };
};
