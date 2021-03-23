/* eslint-disable camelcase */
import { User } from "../User/types";

export type Position = [number, number];

export interface Polygon {
  coordinates: [Position[]];
  type: "Polygon";
}

export interface Point {
  coordinates: Position;
  type: "Point";
}

export interface Pois {
  id: number;
  name: string | null;
  polygon: Polygon | Point | null;
}

export interface SofarValue {
  timestamp: string;
  value: number;
}

export type Range = "day" | "week" | "month" | "year";

export interface SpotterPosition {
  latitude: {
    timestamp: string;
    value: number;
  };
  longitude: {
    timestamp: string;
    value: number;
  };
}

export interface DeploySpotterParams {
  endDate: string;
}

export interface MaintainSpotterParams {
  startDate: string;
  endDate: string;
}

export type ExclusionDateResponse = {
  id: number;
  spotterId: string;
  startDate: string | null;
  endDate: string;
}[];

export interface LiveData {
  reef: { id: number };
  bottomTemperature?: SofarValue;
  surfaceTemperature?: SofarValue;
  satelliteTemperature?: SofarValue;
  degreeHeatingDays?: SofarValue;
  waveHeight?: SofarValue;
  waveDirection?: SofarValue;
  wavePeriod?: SofarValue;
  windSpeed?: SofarValue;
  windDirection?: SofarValue;
  weeklyAlertLevel?: number;
  spotterPosition?: SpotterPosition;
}

export interface DailyData {
  id: number;
  date: string;

  minBottomTemperature: number;
  maxBottomTemperature: number;
  avgBottomTemperature: number;

  degreeHeatingDays: number;
  surfaceTemperature: number;
  satelliteTemperature: number;

  minWindSpeed: number;
  maxWindSpeed: number;
  avgWindSpeed: number;
  windDirection: number;

  minWaveHeight: number;
  maxWaveHeight: number;
  avgWaveHeight: number;
  waveDirection: number;
  wavePeriod: number;

  weeklyAlertLevel?: number;
}

export interface MonthlyMaxData {
  value: number;
  date: string;
}

interface Region {
  name: string | null;
}

interface DataRange {
  minDate: string;
  maxDate: string;
}

type Status = "in_review" | "rejected" | "approved" | "shipped" | "deployed";

// The API sends HOBO data with the following snake_case keys.
// We need to create a new type with the same keys but in camelCase
// TODO: Combine these two types when we upgrade typescript to V4.1
// as described in https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
export type MetricsKeys =
  | "alert"
  | "dhw"
  | "satellite_temperature"
  | "surface_temperature"
  | "bottom_temperature"
  | "sst_anomaly"
  | "significant_wave_height"
  | "wave_peak_period"
  | "wave_mean_direction"
  | "wind_speed"
  | "wind_direction";

export type Metrics =
  | "alert"
  | "dhw"
  | "satelliteTemperature"
  | "surfaceTemperature"
  | "bottomTemperature"
  | "sstAnomaly"
  | "significantWaveHeight"
  | "wavePeakPeriod"
  | "waveMeanDirection"
  | "windSpeed"
  | "windDirection";

export type SourcesKeys = "spotter" | "hobo" | "sofar_api";

export type Sources = "spotter" | "hobo" | "sofarApi";

export type TimeSeries = Record<Metrics, SofarValue[]>;

export type TimeSeriesRange = Record<Metrics, DataRange[]>;

export type TimeSeriesDataResponse = Record<
  SourcesKeys,
  Record<MetricsKeys, SofarValue[]>
>;

export type TimeSeriesData = Record<Sources, TimeSeries>;

export type TimeSeriesDataRangeResponse = Record<
  SourcesKeys,
  Record<MetricsKeys, DataRange[]>
>;

export type TimeSeriesDataRange = Record<Sources, TimeSeriesRange>;

export interface MonthlyMax {
  id: number;
  month: number;
  temperature: number;
}

export interface Reef {
  id: number;
  name: string | null;
  polygon: Polygon | Point;
  maxMonthlyMean: number | null;
  depth: number | null;
  status: Status;
  videoStream: string | null;
  region: Region | null;
  admins: User[];
  stream: string | null;
  dailyData: DailyData[];
  liveData: LiveData;
  latestDailyData: DailyData;
  featuredImage?: string;
  applied?: boolean;
  spotterId: string | null;
  timezone?: string | null;
  surveyPoints: Pois[];
  monthlyMax: MonthlyMax[];
}

export interface TimeSeriesDataRequestParams {
  reefId: string;
  pointId?: string;
  start: string;
  end: string;
  metrics: MetricsKeys[];
  hourly: boolean;
}

export interface TimeSeriesDataRangeRequestParams {
  reefId: string;
  pointId?: string;
}

export interface ReefRegisterResponseData {
  fundingSource: string | null;
  id: number;
  installationResources: string | null;
  installationSchedule: string | null;
  permitRequirements: string | null;
  reef: Reef;
  uid: string;
  user: User;
}

export interface ReefApplyParams {
  permitRequirements: string;
  fundingSource: string;
  installationSchedule: string;
  installationResources: string;
}

export interface ReefUpdateParams {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  name?: string;
  depth?: number;
}

export interface ReefApplication {
  permitRequirements: string | null;
  fundingSource: string | null;
  installationSchedule: string | null;
  installationResources: string | null;
  appId: string;
  applied: boolean;
}

export interface ReefsRequestData {
  list: Reef[];
  reefsToDisplay: Reef[];
}

export interface ReefsListState {
  list?: Reef[];
  reefsToDisplay?: Reef[];
  loading: boolean;
  error?: string | null;
}

export interface SelectedReefState {
  draft: ReefUpdateParams | null;
  details?: Reef | null;
  granularDailyData?: DailyData[];
  timeSeriesData?: TimeSeriesData;
  timeSeriesDataLoading: boolean;
  timeSeriesDataRange?: TimeSeriesDataRange;
  timeSeriesDataRangeLoading: boolean;
  loading: boolean;
  error?: string | null;
}
