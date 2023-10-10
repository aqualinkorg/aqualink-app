import { DataSource } from 'typeorm';
import { ForecastData } from '../wind-wave-data/forecast-data.entity';
import { ExclusionDates } from '../sites/exclusion-dates.entity';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { addSpotterData } from '../utils/spotter-time-series';
import { addWindWaveData } from '../utils/hindcast-wind-wave';

// since this is hourly run we want to only take the latest data.
const DAYS_OF_SPOTTER_DATA = 1;

export function runSpotterTimeSeriesUpdate(
  dataSource: DataSource,
  skipDistanceCheck: boolean,
) {
  return addSpotterData(
    [],
    DAYS_OF_SPOTTER_DATA,
    {
      siteRepository: dataSource.getRepository(Site),
      sourceRepository: dataSource.getRepository(Sources),
      timeSeriesRepository: dataSource.getRepository(TimeSeries),
      exclusionDatesRepository: dataSource.getRepository(ExclusionDates),
    },
    skipDistanceCheck,
  );
}

export function runWindWaveTimeSeriesUpdate(dataSource: DataSource) {
  return addWindWaveData([], {
    siteRepository: dataSource.getRepository(Site),
    hindcastRepository: dataSource.getRepository(ForecastData),
  });
}
