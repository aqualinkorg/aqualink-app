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
  satelliteTemperature?: number;
  degreeHeatingDays?: number;
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
  surfaceTemperature: ValueWithTimestamp[];
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
  surfaceTemperature: [],
};

export interface HindcastResponse {
  variableID: string;
  variableName: string;
  dataCategory: string;
  physicalUnit: string;
  values: ValueWithTimestamp[];
}

export interface SofarWaveDateResponse {
  spotterId: string;
  waves: {
    significantWaveHeight: number;
    peakPeriod: number;
    meanPeriod: number;
    peakDirection: number;
    peakDirectionalSpread: number;
    meanDirection: number;
    meanDirectionalSpread: number;
    timestamp: string;
    latitude: number;
    longitude: number;
  }[];
  wind: {
    speed: number;
    direction: number;
    seasurfaceId: number;
    latitude: number;
    longitude: number;
    timestamp: string;
  }[];
  surfaceTemp: {
    degrees: number;
    latitude: number;
    longitude: number;
    timestamp: string;
  }[];
  barometerData: {
    latitude: number;
    longitude: number;
    timestamp: string;
    units: string;
    value: number;
  }[];
}

export const EMPTY_SOFAR_WAVE_RESPONSE: SofarWaveDateResponse = {
  spotterId: '',
  waves: [],
  wind: [],
  surfaceTemp: [],
  barometerData: [],
};
