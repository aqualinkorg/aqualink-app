import Bluebird from 'bluebird';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DateTime } from 'luxon';
import { getSitesDailyData } from './dailyData';

const logger = new Logger('Backfill Worker');

async function run(siteId: number, days: number, dataSource: DataSource) {
  const backlogArray = Array.from(Array(days).keys());
  const today = DateTime.utc().endOf('day');

  // eslint-disable-next-line fp/no-mutating-methods
  await Bluebird.mapSeries(backlogArray.reverse(), async (past) => {
    const date = today.set({ day: today.day - past - 1 });
    try {
      await getSitesDailyData(dataSource, date.toJSDate(), [siteId]);
    } catch (error) {
      logger.error(error);
    }
  });
}

export const backfillSiteData = async ({
  dataSource,
  siteId,
  days = 90,
}: {
  dataSource: DataSource;
  siteId: number;
  days?: number;
}) => {
  logger.log(`Starting backfill data for site ${siteId}`);
  await run(siteId, days, dataSource);
  logger.log(`Finished backfill data for site ${siteId}`);
};
