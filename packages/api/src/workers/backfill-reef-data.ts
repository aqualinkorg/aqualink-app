import Bluebird from 'bluebird';
import { Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { getReefsDailyData } from './dailyData';

const logger = new Logger('Backfill Worker');

async function run(reefId: number, days: number) {
  const backlogArray = Array.from(Array(days).keys());
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await Bluebird.mapSeries(backlogArray.reverse(), async (past) => {
    const date = new Date(today);
    date.setDate(today.getDate() - past - 1);
    try {
      await getReefsDailyData(getConnection(), date, [reefId]);
    } catch (error) {
      logger.error(error);
    }
  });
}

export const backfillReefData = (reefId: number) => {
  logger.log(`Starting backfill data for reef ${reefId}`);
  run(reefId, 90);
  logger.log(`Finished backfill data for reef ${reefId}`);
};
