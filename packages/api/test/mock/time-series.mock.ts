import { random, times } from 'lodash';
import { DateTime } from 'luxon';
import { DeepPartial } from 'typeorm';
import { SourceType } from '../../src/sites/schemas/source-type.enum';
import { Sources } from '../../src/sites/sources.entity';
import { Metric } from '../../src/time-series/metrics.enum';
import { TimeSeries } from '../../src/time-series/time-series.entity';
import {
  athensPiraeusHoboSource,
  athensNOAASource,
  californiaNOAASource,
  californiaSpotterSource,
  floridaNOAASource,
} from './source.mock';

export const NOAAMetrics = [
  Metric.ALERT,
  Metric.SST_ANOMALY,
  Metric.DHW,
  Metric.SATELLITE_TEMPERATURE,
];

export const spotterMetrics = [
  Metric.BOTTOM_TEMPERATURE,
  Metric.TOP_TEMPERATURE,
  Metric.SIGNIFICANT_WAVE_HEIGHT,
  Metric.WAVE_MEAN_DIRECTION,
  Metric.WAVE_MEAN_PERIOD,
  Metric.WIND_DIRECTION,
  Metric.WIND_SPEED,
];

export const hoboMetrics = [Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE];

const getFakerValue = (metric: Metric) => {
  switch (metric) {
    case Metric.BOTTOM_TEMPERATURE:
    case Metric.TOP_TEMPERATURE:
    case Metric.SATELLITE_TEMPERATURE:
      return random(15, 35, true);
    case Metric.DHW:
    case Metric.WIND_SPEED:
    case Metric.SST_ANOMALY:
    case Metric.WAVE_PEAK_PERIOD:
    case Metric.SIGNIFICANT_WAVE_HEIGHT:
      return random(10, true);
    case Metric.WAVE_MEAN_DIRECTION:
    case Metric.WIND_DIRECTION:
      return random(359);
    case Metric.ALERT:
      return random(4);
    default:
      return random(1, true);
  }
};

const getMetrics = (sourceType?: SourceType) => {
  switch (sourceType) {
    case SourceType.NOAA:
      return NOAAMetrics;
    case SourceType.SPOTTER:
      return spotterMetrics;
    case SourceType.HOBO:
      return hoboMetrics;
    default:
      return [];
  }
};

const createTimeSeriesData = (
  source: DeepPartial<Sources>,
): DeepPartial<TimeSeries>[] => {
  const metrics = getMetrics(source.type);

  return metrics
    .map((metric) =>
      times(10, (i) => {
        const date = DateTime.now()
          .minus({ days: i })
          .set({ hour: random(23), minute: random(59) })
          .toJSDate();

        return {
          timestamp: date,
          value: getFakerValue(metric),
          metric,
          source,
        };
      }),
    )
    .flat();
};

export const californiaTimeSeries = [
  ...createTimeSeriesData(californiaSpotterSource),
  ...createTimeSeriesData(californiaNOAASource),
];

export const floridaTimeSeries = createTimeSeriesData(floridaNOAASource);

export const athensTimeSeries = [
  ...createTimeSeriesData(athensNOAASource),
  ...createTimeSeriesData(athensPiraeusHoboSource),
];

export const timeSeries = [
  ...californiaTimeSeries,
  ...floridaTimeSeries,
  ...athensTimeSeries,
];
