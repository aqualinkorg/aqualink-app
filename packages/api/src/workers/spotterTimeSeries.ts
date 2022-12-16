import { Connection } from 'typeorm';
import { ForecastData } from '../wind-wave-data/forecast-data.entity';
import { ExclusionDates } from '../sites/exclusion-dates.entity';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { addSpotterData } from '../utils/spotter-time-series';
import { addWindWaveData } from '../utils/hindcast-wind-wave';

// since this is hourly run we want to only take the latest data.
const DAYS_OF_SPOTTER_DATA = 1;

export function runSpotterTimeSeriesUpdate(connection: Connection) {
  return addSpotterData([], DAYS_OF_SPOTTER_DATA, {
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
