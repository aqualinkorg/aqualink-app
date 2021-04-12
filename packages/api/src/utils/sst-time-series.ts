import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
import { In, Repository } from 'typeorm';
import { Point } from 'geojson';
import { keyBy, times } from 'lodash';
import moment from 'moment';

import { Reef } from '../reefs/reefs.entity';
import { Sources } from '../reefs/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import { filterSofarResponse, sofarHindcast } from './sofar';
import { getNOAASource, insertSSTToTimeSeries } from './time-series.utils';

const logger = new Logger('SSTTimeSeries');

const getReefs = (reefIds: number[], reefRepository: Repository<Reef>) => {
  return reefRepository.find({
    where: reefIds.length > 0 ? { id: In(reefIds) } : {},
  });
};

export const updateSST = async (
  reefIds: number[],
  days: number,
  reefRepository: Repository<Reef>,
  timeSeriesRepository: Repository<TimeSeries>,
  sourcesRepository: Repository<Sources>,
) => {
  logger.log('Fetching reefs');
  const reefs = await getReefs(reefIds, reefRepository);

  const sources = await Promise.all(
    reefs.map((reef) => {
      return getNOAASource(reef, sourcesRepository);
    }),
  );

  const reefToSource: Record<number, Sources> = keyBy(
    sources,
    (source) => source.reef.id,
  );

  Bluebird.map(
    reefs,
    (reef) => {
      logger.log(`Back-filling reef with id ${reef.id}.`);
      return Bluebird.map(
        times(days, (i) => i),
        (i) => {
          const endDate =
            i === 0
              ? moment().format()
              : moment().subtract(i, 'd').endOf('day').format();
          const startDate = moment().subtract(i, 'd').startOf('day').format();
          const point = reef.polygon as Point;

          return sofarHindcast(
            SofarModels.NOAACoralReefWatch,
            sofarVariableIDs[SofarModels.NOAACoralReefWatch]
              .analysedSeaSurfaceTemperature,
            point.coordinates[1], // latitude
            point.coordinates[0], // longitude
            startDate,
            endDate,
          ).then(filterSofarResponse);
        },
        { concurrency: 100 },
      ).then((sstData) => {
        return Promise.all(
          sstData.flat().map((data) => {
            return insertSSTToTimeSeries(
              reef,
              data.value,
              new Date(data.timestamp),
              reefToSource[reef.id],
              timeSeriesRepository,
            );
          }),
        );
      });
    },
    { concurrency: 1 },
  );
};
