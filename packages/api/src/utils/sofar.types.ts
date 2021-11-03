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
  waveDirection?: number;
  wavePeriod?: number;
  minWindSpeed?: number;
  maxWindSpeed?: number;
  avgWindSpeed?: number;
  windDirection?: number;
}

export interface SofarLiveData {
  site: { id: number };
  dailyAlertLevel?: number;
  weeklyAlertLevel?: number;
  bottomTemperature?: SofarValue;
  topTemperature?: SofarValue;
  satelliteTemperature?: SofarValue;
  degreeHeatingDays?: SofarValue;
  waveHeight?: SofarValue;
  waveDirection?: SofarValue;
  wavePeriod?: SofarValue;
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
  wavePeakPeriod: SofarValue[];
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
  wavePeakPeriod: [],
  waveMeanDirection: [],
  windSpeed: [],
  windDirection: [],
};
