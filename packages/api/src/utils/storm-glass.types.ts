export type StormGlassSourceType =
  | 'sg'
  | 'icon'
  | 'dwd'
  | 'noaa'
  | 'meteo'
  | 'meto'
  | 'fcoo'
  | 'fmi'
  | 'yr'
  | 'smhi';

export type StormGlassParamsType =
  | 'airTemperature'
  | 'airTemperature80m'
  | 'airTemperature100m'
  | 'airTemperature1000hpa'
  | 'airTemperature800hpa'
  | 'airTemperature500hpa'
  | 'airTemperature200hpa'
  | 'pressure'
  | 'cloudCover'
  | 'currentDirection'
  | 'currentSpeed'
  | 'gust'
  | 'humidity'
  | 'iceCover'
  | 'precipitation'
  | 'snowDepth'
  | 'seaLevel'
  | 'swellDirection'
  | 'swellHeight'
  | 'swellPeriod'
  | 'secondarySwellPeriod'
  | 'secondarySwellDirection'
  | 'secondarySwellHeight'
  | 'visibility'
  | 'waterTemperature'
  | 'waveDirection'
  | 'waveHeight'
  | 'wavePeriod'
  | 'windWaveDirection'
  | 'windWaveHeight'
  | 'windWavePeriod'
  | 'windDirection'
  | 'windDirection20m'
  | 'windDirection30m'
  | 'windDirection40m'
  | 'windDirection50m'
  | 'windDirection80m'
  | 'windDirection100m'
  | 'windDirection1000hpa'
  | 'windDirection800hpa'
  | 'windDirection500hpa'
  | 'windDirection200hpa'
  | 'windSpeed'
  | 'windSpeed20m'
  | 'windSpeed30m'
  | 'windSpeed40m'
  | 'windSpeed50m'
  | 'windSpeed80m'
  | 'windSpeed100m'
  | 'windSpeed1000hpa'
  | 'windSpeed800hpa'
  | 'windSpeed500hpa'
  | 'windSpeed200hpa';

export interface StormGlassWeatherProps {
  latitude: number;
  longitude: number;
  params: StormGlassParamsType[];
  start?: string;
  end?: string;
  source?: StormGlassSourceType | StormGlassSourceType[];
  raw?: boolean;
}

export interface StormGlassWeatherQueryProps {
  lat: number;
  lng: number;
  params: string;
  start?: string;
  end?: string;
  source?: string;
}
