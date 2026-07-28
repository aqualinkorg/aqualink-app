import { ValueWithTimestamp } from './sofar.types';

/**
 * Response shape from Open-Meteo Marine API.
 * Multi-coordinate requests return an array of these.
 * https://open-meteo.com/en/docs/marine-weather-api
 */
export interface OpenMeteoMarineResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  hourly?: {
    time: string[];
    wave_height?: (number | null)[];
    wave_direction?: (number | null)[];
    wave_period?: (number | null)[];
  };
  hourly_units?: Record<string, string>;
}

/**
 * Latest observed wave values for a single site, after extraction from
 * the Open-Meteo hourly response. Mirrors the per-variable shape used
 * throughout the existing wind/wave pipeline.
 */
export interface OpenMeteoWaveData {
  waveHeight?: ValueWithTimestamp;
  waveDirection?: ValueWithTimestamp;
  wavePeriod?: ValueWithTimestamp;
}
