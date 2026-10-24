import { DateTime } from 'luxon-extensions';

export const getSiteDetailPath = (
  siteId: string | number,
  historicalDate?: string,
) => {
  const path = `/sites/${siteId}`;
  if (!historicalDate) return path;

  const startDate =
    DateTime.fromISO(historicalDate).minus({ months: 1 }).toISODate() ||
    historicalDate;
  const params = new URLSearchParams({
    date: historicalDate,
    start: startDate,
    end: historicalDate,
  });
  return `${path}?${params.toString()}`;
};
