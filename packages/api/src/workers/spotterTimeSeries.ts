import { Connection } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { addSpotterData } from '../utils/spotter-time-series';

export function runSpotterTimeSeriesUpdate(connection: Connection) {
  return addSpotterData([], 1, connection, {
    siteRepository: connection.getRepository(Site),
    sourceRepository: connection.getRepository(Sources),
    timeSeriesRepository: connection.getRepository(TimeSeries),
  });
}
