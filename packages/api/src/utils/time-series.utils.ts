import { Metric } from '../time-series/metrics.entity';

// Convert Metric enum to camelCase keys
export const metricToKey = (metric: Metric) => {
  switch (metric) {
    case Metric.BOTTOM_TEMPERATURE:
      return 'bottomTemperature';
    case Metric.SATELLITE_TEMPERATURE:
      return 'satelliteTemperature';
    case Metric.TOP_TEMPERATURE:
      return 'topTemperature';
    case Metric.SST_ANOMALY:
      return 'sstAnomaly';
    case Metric.SIGNIFICANT_WAVE_HEIGHT:
      return 'significantWaveHeight';
    case Metric.WAVE_PEAK_PERIOD:
      return 'wavePeakPeriod';
    case Metric.WAVE_MEAN_DIRECTION:
      return 'waveMeanDirection';
    case Metric.WIND_SPEED:
      return 'windSpeed';
    case Metric.WIND_DIRECTION:
      return 'windDirection';
    default:
      return metric;
  }
};
