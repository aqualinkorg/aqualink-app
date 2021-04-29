import { Connection } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { Sources } from '../reefs/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { addSpotterData } from '../utils/spotter-time-series';

export function runSpotterTimeSeriesUpdate(connection: Connection) {
  return addSpotterData([], 1, connection, {
    reefRepository: connection.getRepository(Reef),
    sourceRepository: connection.getRepository(Sources),
    timeSeriesRepository: connection.getRepository(TimeSeries),
  });
}
