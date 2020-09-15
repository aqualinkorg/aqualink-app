export interface SofarDailyData {
  reef: number;
  date: Date;
  minBottomTemperature: number;
  maxBottomTemperature: number;
  avgBottomTemperature: number;
  surfaceTemperature: number;
  satelliteTemperature: number;
  degreeHeatingDays: number;
  minWaveHeight: number;
  maxWaveHeight: number;
  avgWaveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  minWindSpeed: number;
  maxWindSpeed: number;
  avgWindSpeed: number;
  windDirection: number;
}

export enum SofarModels {
  NOAAOperationalWaveModel = 'NOAAOperationalWaveModel',
  NOAACoralReefWatch = 'NOAACoralReefWatch',
  GFS = 'GFS',
}
