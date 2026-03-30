export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface Region {
  name: string | null;
}

export interface Admin {
  name: string | null;
}

export interface HistoricalMonthlyMean {
  id: number;
  month: number;
  temperature: number;
}

export interface DailyData {
  id: number;
  date: string;
  minBottomTemperature: number | null;
  maxBottomTemperature: number | null;
  avgBottomTemperature: number | null;
  surfaceTemperature: number | null;
  satelliteTemperature: number | null;
  degreeHeatingDays: number | null;
  minWaveHeight: number | null;
  maxWaveHeight: number | null;
  avgWaveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
  minWindSpeed: number | null;
  maxWindSpeed: number | null;
  avgWindSpeed: number | null;
  windDirection: number | null;
  weeklyAlertLevel: number | null;
}

export interface LiveData {
  site: { id: number };
  bottomTemperature: TimeSeriesPoint | null;
  surfaceTemperature: TimeSeriesPoint | null;
  satelliteTemperature: number | null;
  degreeHeatingDays: number | null;
  weeklyAlertLevel: number | null;
  waveHeight: TimeSeriesPoint | null;
  waveDirection: TimeSeriesPoint | null;
  wavePeriod: TimeSeriesPoint | null;
  windSpeed: TimeSeriesPoint | null;
  windDirection: TimeSeriesPoint | null;
}

export interface TimeSeriesPoint {
  value: number;
  timestamp: string;
}

export interface Site {
  id: number;
  name: string | null;
  polygon: GeoJSON.Polygon | GeoJSON.Point;
  coordinates: Coordinates;
  depth: number | null;
  status: string;
  videoStream: string | null;
  region: Region | null;
  admin: Admin | null;
  country: string | null;
  timezone: string | null;
  maxMonthlyMean: number | null;
  historicalMonthlyMean: HistoricalMonthlyMean[];
  dailyData: DailyData[];
  liveData: LiveData | null;
  collectionData: CollectionData | null;
  hasHobo: boolean;
}

export interface CollectionData {
  bottom_temperature: TimeSeriesPoint | null;
  surface_temperature: TimeSeriesPoint | null;
  dhw: number | null;
  satellite_temperature: number | null;
  weekly_alert: number | null;
  wind_speed: TimeSeriesPoint | null;
  wave_height: TimeSeriesPoint | null;
}

export interface SitesListState {
  list: Site[];
  loading: boolean;
  error: string | null;
  reefOnMap: Site | null;
}

export interface SiteState {
  details: Site | null;
  loading: boolean;
  error: string | null;
  dailyDataLoading: boolean;
  dailyDataError: string | null;
  timeSeriesDataLoading: boolean;
  timeSeriesDataError: string | null;
  liveDataLoading: boolean;
  liveDataError: string | null;
}
