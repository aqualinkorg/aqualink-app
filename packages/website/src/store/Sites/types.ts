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

// The API sends time series data with the following snake_case keys.
// We need to create a new type with the same keys but in camelCase
export const metricsKeysList = [
  "dhw",
  "satellite_temperature",
  "air_temperature",
  "top_temperature",
  "bottom_temperature",
  "sst_anomaly",
  "significant_wave_height",
  "temp_alert",
  "temp_weekly_alert",
  "wave_mean_period",
  "wave_mean_direction",
  "wind_speed",
  "wind_direction",
  "odo_concentration",
  "cholorophyll_concentration",
  "ph",
  "salinity",
  "turbidity",
  "water_depth",
  "conductivity",
  "cholorophyll_rfu",
  "odo_saturation",
  "specific_conductance",
  "tds",
  "total_suspended_solids",
  "sonde_wiper_position",
  "ph_mv",
  "sonde_battery_voltage",
  "sonde_cable_power_voltage",
  "pressure",
  "precipitation",
  "rh",
  "wind_gust_speed",
] as const;

export type MetricsKeys = typeof metricsKeysList[number];

type Status = "in_review" | "rejected" | "approved" | "shipped" | "deployed";

// This recursive type converts string literals from snake_case to camelCase.
// It splits the input string into three parts: P1, P2 and P3.
// For example, the string "temp_weekly_alert" is split to:
// P1 = temp, P2 = w, P3 = eekly_alert.
// Then, applies Lowercase P1 as is, applies Uppercase to P2, and then recursively applies Camelcase to P3.
// After that, it concatenates these 3 results.
type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

export type Metrics = CamelCase<MetricsKeys>;

export type Sources = "spotter" | "hobo" | "noaa" | "gfs" | "sonde" | "metlog";

export interface LatestData {
  id: number;
  timestamp: Date;
  value: number;
  site: { id: number };
  siteId: number;
  surveyPoint: { id: number };
  source: Sources;
  metric: Metrics;
}
export interface LiveData {
  site: { id: number };
  latestData: LatestData[];
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

export type TimeSeriesSurveyPoint = Pick<SurveyPoints, "id" | "name">;

export type TimeSeries = Partial<
  Record<Sources, { surveyPoint?: TimeSeriesSurveyPoint; data: SofarValue[] }>
>;

export type TimeSeriesRange = Partial<
  Record<Sources, { surveyPoint?: TimeSeriesSurveyPoint; data: DataRange[] }>
>;

export type TimeSeriesDataResponse = Partial<Record<MetricsKeys, TimeSeries>>;

export type TimeSeriesData = Partial<Record<Metrics, TimeSeries>>;

export type TimeSeriesDataRangeResponse = Partial<
  Record<MetricsKeys, TimeSeriesRange>
>;

export type TimeSeriesDataRange = Partial<Record<Metrics, TimeSeriesRange>>;

export const OceanSenseKeysList = ["DO", "EC", "ORP", "PH", "PRESS"] as const;

export type OceanSenseKeys = typeof OceanSenseKeysList[number];

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

export interface SiteUploadHistoryItem {
  id: number;
  sensorType: Sources;
  file: string;
  minDate: string;
  maxDate: string;
  createdAt: string;
  updatedAt: string;
  metrics: MetricsKeys[];
  surveyPoint: {
    id: number;
    name: string;
  };
}

export type SiteUploadHistory = SiteUploadHistoryItem[];

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
  liveData?: LiveData;
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
