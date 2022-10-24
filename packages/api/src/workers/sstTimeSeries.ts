import { Connection } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import NOAAAvailability from '../utils/noaa-availability';
import { updateSST } from '../utils/sst-time-series';

export function runSSTTimeSeriesUpdate(
  connection: Connection,
  noaaAvailability: NOAAAvailability,
) {
  return updateSST(
    [],
    4,
    connection,
    {
      siteRepository: connection.getRepository(Site),
      timeSeriesRepository: connection.getRepository(TimeSeries),
      sourceRepository: connection.getRepository(Sources),
    },
    noaaAvailability,
  );
}
