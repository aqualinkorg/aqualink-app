import { DataSource } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { updateSST } from '../utils/sst-time-series';

// we want to backfill at least 3 days ago, since the
// hindcast api has available data only from 2 days ago and before.
const SST_BACKFILL_DAYS = 4;

export function runSSTTimeSeriesUpdate(dataSource: DataSource) {
  return updateSST([], SST_BACKFILL_DAYS, {
    siteRepository: dataSource.getRepository(Site),
    timeSeriesRepository: dataSource.getRepository(TimeSeries),
    sourceRepository: dataSource.getRepository(Sources),
  });
}
