import { Connection } from 'typeorm';
import { ForecastData } from '../wind-wave-data/forecast-data.entity';
import { ExclusionDates } from '../sites/exclusion-dates.entity';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { addSpotterData } from '../utils/spotter-time-series';
import { addWindWaveData } from '../utils/hindcast-wind-wave';

export function runSpotterTimeSeriesUpdate(connection: Connection) {
  return addSpotterData([], 1, {
    siteRepository: connection.getRepository(Site),
    sourceRepository: connection.getRepository(Sources),
    timeSeriesRepository: connection.getRepository(TimeSeries),
    exclusionDatesRepository: connection.getRepository(ExclusionDates),
  });
}

export function runWindWaveTimeSeriesUpdate(connection: Connection) {
  return addWindWaveData([], {
    siteRepository: connection.getRepository(Site),
    hindcastRepository: connection.getRepository(ForecastData),
  });
}
