import { Connection } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { Sources } from '../reefs/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { updateSST } from '../utils/sst-time-series';

export function runSSTTimeSeriesUpdate(connection: Connection) {
  return updateSST([], 3, connection, {
    reefRepository: connection.getRepository(Reef),
    timeSeriesRepository: connection.getRepository(TimeSeries),
    sourceRepository: connection.getRepository(Sources),
  });
}
