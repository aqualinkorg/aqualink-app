import { useEffect, useState } from 'react';
import { DateTime } from 'luxon-extensions';
import siteServices from 'services/siteServices';
import type { DailyData } from 'store/Sites/types';

/**
 * Daily data for the `days` days ending on `day` (YYYY-MM-DD, UTC), newest first, the same order
 * as `site.dailyData`. Returns undefined while loading or when no day is given.
 */
export const useHistoricalDailyData = (
  siteId: number | undefined,
  day: string | null | undefined,
  days: number,
): DailyData[] | undefined => {
  const [dailyData, setDailyData] = useState<DailyData[]>();

  useEffect(() => {
    setDailyData(undefined);
    if (!siteId || !day) return undefined;

    let cancelled = false;
    const end = DateTime.fromISO(day, { zone: 'utc' }).endOf('day');
    const start = end.minus({ days: days - 1 }).startOf('day');
    siteServices
      .getSiteDailyData(String(siteId), start.toISOString(), end.toISOString())
      .then(({ data }) => {
        if (!cancelled) setDailyData(data);
      })
      .catch(() => {
        if (!cancelled) setDailyData([]);
      });

    return () => {
      // eslint-disable-next-line fp/no-mutation
      cancelled = true;
    };
  }, [siteId, day, days]);

  return dailyData;
};
