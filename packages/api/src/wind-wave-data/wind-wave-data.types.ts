import { Metric } from '../time-series/metrics.enum';

// This enum should always be a subset of Metric enum
export enum WindWaveMetric {
  SIGNIFICANT_WAVE_HEIGHT = Metric.SIGNIFICANT_WAVE_HEIGHT,
  WAVE_MEAN_DIRECTION = Metric.WAVE_MEAN_DIRECTION,
  WAVE_MEAN_PERIOD = Metric.WAVE_MEAN_PERIOD,
  WIND_SPEED = Metric.WIND_SPEED,
  WIND_DIRECTION = Metric.WIND_DIRECTION,
}
