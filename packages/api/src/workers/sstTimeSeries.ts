import { Connection } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { updateSST } from '../utils/sst-time-series';

// we want to backfill at least 3 days ago, since the
// hindcast api has available data only from 2 days ago and before.
const SST_BACKFILL_DAYS = 4;

export function runSSTTimeSeriesUpdate(connection: Connection) {
  return updateSST([], SST_BACKFILL_DAYS, {
    siteRepository: connection.getRepository(Site),
    timeSeriesRepository: connection.getRepository(TimeSeries),
    sourceRepository: connection.getRepository(Sources),
  });
}
