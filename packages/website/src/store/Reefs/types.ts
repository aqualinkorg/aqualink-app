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
  coordinates?: Position;
}

export interface SofarValue {
  timestamp: string;
  value: number;
}

export type Range = "day" | "week" | "month";

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

interface Region {
  name: string | null;
}

type Status = "in_review" | "rejected" | "approved" | "shipped" | "deployed";

export enum Metrics {
  alert = "alert",
  dhw = "dhw",
  satelliteTemperature = "satellite_temperature",
  surfaceTemperature = "surface_temperature",
  bottomTemperature = "bottom_temperature",
  sstAnomaly = "sst_anomaly",
}

export type HoboDataResponse = {
  [key in Metrics]: {
    value: number;
    timestamp: string;
  }[];
};

export interface HoboData {
  alert: SofarValue[];
  dhw: SofarValue[];
  satelliteTemperature: SofarValue[];
  surfaceTemperature: SofarValue[];
  bottomTemperature: SofarValue[];
  sstAnomaly: SofarValue[];
}

export interface SpotterData {
  surfaceTemperature: SofarValue[];
  bottomTemperature: SofarValue[];
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
}

export interface SpotterDataRequestParams {
  id: string;
  startDate: string;
  endDate: string;
}

export interface HoboDataRequestParams {
  reefId: string;
  pointId: string;
  start: string;
  end: string;
  metrics: Metrics[];
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
  spotterData?: SpotterData | null;
  hoboData?: HoboData;
  hoboDataLoading: boolean;
  spotterDataLoading: boolean;
  loading: boolean;
  error?: string | null;
}
