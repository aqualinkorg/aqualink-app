import { LatestData } from '../time-series/latest-data.entity';

export interface SofarValue {
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
  latestData: LatestData[];
  dailyAlertLevel?: number;
  weeklyAlertLevel?: number;
  bottomTemperature?: SofarValue;
  topTemperature?: SofarValue;
  satelliteTemperature?: SofarValue;
  degreeHeatingDays?: SofarValue;
  waveHeight?: SofarValue;
  waveMeanDirection?: SofarValue;
  waveMeanPeriod?: SofarValue;
  windSpeed?: SofarValue;
  windDirection?: SofarValue;
  sstAnomaly?: number;
  spotterPosition?: {
    latitude: SofarValue;
    longitude: SofarValue;
  };
}

export interface SpotterData {
  topTemperature: SofarValue[];
  bottomTemperature: SofarValue[];
  significantWaveHeight: SofarValue[];
  waveMeanPeriod: SofarValue[];
  waveMeanDirection: SofarValue[];
  windSpeed: SofarValue[];
  windDirection: SofarValue[];
  latitude?: SofarValue[];
  longitude?: SofarValue[];
}

export const DEFAULT_SPOTTER_DATA_VALUE: SpotterData = {
  topTemperature: [],
  bottomTemperature: [],
  significantWaveHeight: [],
  waveMeanPeriod: [],
  waveMeanDirection: [],
  windSpeed: [],
  windDirection: [],
};
