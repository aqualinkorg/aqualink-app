import { CollectionData, CollectionDataResponse } from '../Sites/types';
import { CollectionDetails, CollectionDetailsResponse } from './types';

export const mapCollectionData = (
  data: CollectionDataResponse,
): CollectionData => ({
  bottomTemperature: data.bottom_temperature,
  dhw: data.dhw,
  satelliteTemperature: data.satellite_temperature,
  sstAnomaly: data.sst_anomaly,
  topTemperature: data.top_temperature,
  significantWaveHeight: data.significant_wave_height,
  tempAlert: data.temp_alert,
  tempWeeklyAlert: data.temp_weekly_alert,
  waveMeanDirection: data.wave_mean_direction,
  waveMeanPeriod: data.wave_mean_period,
  windDirection: data.wind_direction,
  windSpeed: data.wind_speed,
});

export const constructCollection = (
  data: CollectionDetailsResponse,
): CollectionDetails => ({
  ...data,
  sites: data.sites.map((item) => ({
    ...item,
    collectionData: mapCollectionData(item.collectionData || {}),
  })),
});
