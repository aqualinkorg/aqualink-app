import { TimeSeriesValueDto } from '../../time-series/dto/time-series-value.dto';

export class SofarLiveDataDto {
  reef: { id: number };
  dailyAlertLevel?: number;
  weeklyAlertLevel?: number;
  bottomTemperature?: TimeSeriesValueDto;
  surfaceTemperature?: TimeSeriesValueDto;
  satelliteTemperature?: TimeSeriesValueDto;
  degreeHeatingDays?: TimeSeriesValueDto;
  waveHeight?: TimeSeriesValueDto;
  waveDirection?: TimeSeriesValueDto;
  wavePeriod?: TimeSeriesValueDto;
  windSpeed?: TimeSeriesValueDto;
  windDirection?: TimeSeriesValueDto;
  spotterPosition?: {
    latitude: TimeSeriesValueDto;
    longitude: TimeSeriesValueDto;
  };
}
