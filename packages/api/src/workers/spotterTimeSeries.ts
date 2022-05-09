import { Connection } from 'typeorm';
import { ExclusionDates } from '../sites/exclusion-dates.entity';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { addSpotterData, addWindWaveData } from '../utils/spotter-time-series';

export function runSpotterTimeSeriesUpdate(connection: Connection) {
  return addSpotterData([], 1, connection, {
    siteRepository: connection.getRepository(Site),
    sourceRepository: connection.getRepository(Sources),
    timeSeriesRepository: connection.getRepository(TimeSeries),
    exclusionDatesRepository: connection.getRepository(ExclusionDates),
  });
}

export function runWindWaveTimeSeriesUpdate(connection: Connection) {
  return addWindWaveData([], connection, {
    siteRepository: connection.getRepository(Site),
    sourceRepository: connection.getRepository(Sources),
    timeSeriesRepository: connection.getRepository(TimeSeries),
    exclusionDatesRepository: connection.getRepository(ExclusionDates),
  });
}
