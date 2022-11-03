import type { LatestData } from '../time-series/latest-data.entity';

export interface ValueWithTimestamp {
  timestamp: string;
  value: number;
}

export interface SofarDailyData {
  site: { id: number };
  date: Date;
  dailyAlertLevel?: number;
  weeklyAlertLevel?: number;
  minBottomTemperature?: number;
  maxBottomTemperature?: number;
  avgBottomTemperature?: number;
  topTemperature?: number;
  satelliteTemperature?: number;
  degreeHeatingDays?: number;
  minWaveHeight?: number;
  maxWaveHeight?: number;
  avgWaveHeight?: number;
  waveMeanDirection?: number;
  waveMeanPeriod?: number;
  minWindSpeed?: number;
  maxWindSpeed?: number;
  avgWindSpeed?: number;
  windDirection?: number;
}

export interface SofarLiveData {
  site: { id: number };
  latestData?: LatestData[];
  dailyAlertLevel?: number;
  weeklyAlertLevel?: number;
  bottomTemperature?: ValueWithTimestamp;
  topTemperature?: ValueWithTimestamp;
  satelliteTemperature?: ValueWithTimestamp;
  degreeHeatingDays?: ValueWithTimestamp;
  waveHeight?: ValueWithTimestamp;
  waveMeanDirection?: ValueWithTimestamp;
  waveMeanPeriod?: ValueWithTimestamp;
  windSpeed?: ValueWithTimestamp;
  windDirection?: ValueWithTimestamp;
  sstAnomaly?: number;
  spotterPosition?: {
    latitude: ValueWithTimestamp;
    longitude: ValueWithTimestamp;
  };
}

export interface SpotterData {
  topTemperature: ValueWithTimestamp[];
  bottomTemperature: ValueWithTimestamp[];
  significantWaveHeight: ValueWithTimestamp[];
  waveMeanPeriod: ValueWithTimestamp[];
  waveMeanDirection: ValueWithTimestamp[];
  windSpeed: ValueWithTimestamp[];
  windDirection: ValueWithTimestamp[];
  barometerTop: ValueWithTimestamp[];
  barometerBottom: ValueWithTimestamp[];
  barometricTopDiff: ValueWithTimestamp[];
  latitude?: ValueWithTimestamp[];
  longitude?: ValueWithTimestamp[];
}

export const DEFAULT_SPOTTER_DATA_VALUE: SpotterData = {
  topTemperature: [],
  bottomTemperature: [],
  significantWaveHeight: [],
  waveMeanPeriod: [],
  waveMeanDirection: [],
  windSpeed: [],
  windDirection: [],
  barometerTop: [],
  barometerBottom: [],
  barometricTopDiff: [],
};
