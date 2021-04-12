import { Connection } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { Sources } from '../reefs/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { updateSST } from '../utils/sst-time-series';

export function runSSTTimeSeriesUpdate(connection: Connection) {
  return updateSST(
    [],
    1,
    connection.getRepository(Reef),
    connection.getRepository(TimeSeries),
    connection.getRepository(Sources),
  );
}
