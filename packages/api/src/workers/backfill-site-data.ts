import Bluebird from 'bluebird';
import moment from 'moment';
import { Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { getSitesDailyData } from './dailyData';

const logger = new Logger('Backfill Worker');

async function run(siteId: number, days: number) {
  const backlogArray = Array.from(Array(days).keys());
  const today = moment()
    .utc()
    .hours(23)
    .minutes(59)
    .seconds(59)
    .milliseconds(999);

  // eslint-disable-next-line fp/no-mutating-methods
  await Bluebird.mapSeries(backlogArray.reverse(), async (past) => {
    const date = moment(today);
    date.day(today.day() - past - 1);
    try {
      await getSitesDailyData(getConnection(), date.toDate(), [siteId]);
    } catch (error) {
      logger.error(error);
    }
  });
}

export const backfillSiteData = async (siteId: number, days: number = 90) => {
  logger.log(`Starting backfill data for site ${siteId}`);
  await run(siteId, days);
  logger.log(`Finished backfill data for site ${siteId}`);
};
