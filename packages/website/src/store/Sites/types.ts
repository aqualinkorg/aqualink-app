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

export interface SurveyPoints {
  id: number;
  name: string | null;
  polygon: Polygon | Point | null;
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

export interface UpdateSiteNameFromListArgs {
  id: number;
  list?: Site[];
  name?: string;
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
  sensorId: string;
  startDate: string | null;
  endDate: string;
}[];

export interface LiveData {
  site: { id: number };
  bottomTemperature?: SofarValue;
  topTemperature?: SofarValue;
  satelliteTemperature?: SofarValue;
  degreeHeatingDays?: SofarValue;
  waveHeight?: SofarValue;
  waveMeanDirection?: SofarValue;
  waveMeanPeriod?: SofarValue;
  windSpeed?: SofarValue;
  windDirection?: SofarValue;
  weeklyAlertLevel?: number;
  spotterPosition?: SpotterPosition;
  sstAnomaly?: number;
}

export interface DailyData {
  id: number;
  date: string;

  minBottomTemperature: number;
  maxBottomTemperature: number;
  avgBottomTemperature: number;

  degreeHeatingDays: number;
  topTemperature: number;
  satelliteTemperature: number;

  minWindSpeed: number;
  maxWindSpeed: number;
  avgWindSpeed: number;
  windDirection: number;

  minWaveHeight: number;
  maxWaveHeight: number;
  avgWaveHeight: number;
  waveMeanDirection: number;
  waveMeanPeriod: number;

  weeklyAlertLevel?: number;
}

export interface HistoricalMonthlyMeanData {
  value: number;
  date: string;
}

export interface SofarValue {
  timestamp: string;
  value: number;
}

interface Region {
  name: string | null;
}

export interface DataRange {
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
  | "top_temperature"
  | "bottom_temperature"
  | "sst_anomaly"
  | "significant_wave_height"
  | "wave_mean_period"
  | "wave_mean_direction"
  | "wind_speed"
  | "wind_direction"
  | "weekly_alert";

export type Metrics =
  | "alert"
  | "dhw"
  | "satelliteTemperature"
  | "topTemperature"
  | "bottomTemperature"
  | "sstAnomaly"
  | "significantWaveHeight"
  | "waveMeanPeriod"
  | "waveMeanDirection"
  | "windSpeed"
  | "windDirection"
  | "weeklyAlert";

export type SourcesKeys = "spotter" | "hobo" | "noaa" | "gfs";

export type Sources = "spotter" | "hobo" | "sofarNoaa" | "sofarGfs";

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

export type OceanSenseKeys = "DO" | "EC" | "ORP" | "PH" | "PRESS";

export interface OceanSenseDataRequestParams {
  sensorID: string;
  startDate: string;
  endDate: string;
}

export interface OceanSenseDataResponse {
  data: Record<OceanSenseKeys, number[]>;
  timestamps: string[];
}

export type OceanSenseData = Record<OceanSenseKeys, SofarValue[]>;

export interface HistoricalMonthlyMean {
  id: number;
  month: number;
  temperature: number;
}

export interface CollectionMetrics {
  topTemperature?: number;
  bottomTemperature?: number;
  satelliteTemperature?: number;
  degreeHeatingDays?: number;
  weeklyAlertLevel?: number;
  sstAnomaly?: number;
}

export type CollectionDataResponse = Partial<Record<MetricsKeys, number>>;

export type CollectionData = Partial<Record<Metrics, number>>;

export interface Site {
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
  featuredImage?: string;
  applied?: boolean;
  sensorId: string | null;
  timezone?: string | null;
  surveyPoints: SurveyPoints[];
  historicalMonthlyMean: HistoricalMonthlyMean[];
  hasHobo: boolean;
  collectionData?: CollectionData;
}

export interface SiteResponse extends Site {
  collectionData?: CollectionDataResponse;
}

export interface TimeSeriesDataRequestParams {
  siteId: string;
  pointId?: string;
  start?: string;
  end?: string;
  metrics?: MetricsKeys[];
  hourly?: boolean;
}

export interface TimeSeriesDataRangeRequestParams {
  siteId: string;
  pointId?: string;
}

export interface SiteRegisterResponseData {
  fundingSource: string | null;
  id: number;
  installationResources: string | null;
  installationSchedule: string | null;
  permitRequirements: string | null;
  site: Site;
  uid: string;
  user: User;
}

export interface SiteApplyParams {
  permitRequirements: string;
  fundingSource: string;
  installationSchedule: string;
  installationResources: string;
}

export interface SiteUpdateParams {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  name?: string;
  depth?: number;
}

export interface SiteApplication {
  permitRequirements: string | null;
  fundingSource: string | null;
  installationSchedule: string | null;
  installationResources: string | null;
  appId: string;
  applied: boolean;
}

export interface SitesRequestData {
  list: Site[];
  sitesToDisplay: Site[];
}

export interface SitesListState {
  list?: Site[];
  sitesToDisplay?: Site[];
  loading: boolean;
  error?: string | null;
}

export interface SelectedSiteState {
  draft: SiteUpdateParams | null;
  details?: Site | null;
  latestOceanSenseData?: OceanSenseData;
  latestOceanSenseDataLoading: boolean;
  latestOceanSenseDataError?: string | null;
  oceanSenseData?: OceanSenseData;
  oceanSenseDataLoading: boolean;
  oceanSenseDataError?: string | null;
  granularDailyData?: DailyData[];
  timeSeriesData?: TimeSeriesData;
  timeSeriesDataLoading: boolean;
  timeSeriesDataRange?: TimeSeriesDataRange;
  timeSeriesDataRangeLoading: boolean;
  timeSeriesMinRequestDate?: string;
  timeSeriesMaxRequestDate?: string;
  loading: boolean;
  error?: string | null;
}
