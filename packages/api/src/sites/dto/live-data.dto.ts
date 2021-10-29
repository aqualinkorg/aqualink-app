import { TimeSeriesValueDto } from '../../time-series/dto/time-series-value.dto';
import { SofarLiveData } from '../../utils/sofar.types';

export class SofarLiveDataDto implements SofarLiveData {
  site: { id: number };
  dailyAlertLevel?: number;
  weeklyAlertLevel?: number;
  bottomTemperature?: TimeSeriesValueDto;
  topTemperature?: TimeSeriesValueDto;
  satelliteTemperature?: TimeSeriesValueDto;
  degreeHeatingDays?: TimeSeriesValueDto;
  waveHeight?: TimeSeriesValueDto;
  waveMeanDirection?: TimeSeriesValueDto;
  waveMeanPeriod?: TimeSeriesValueDto;
  windSpeed?: TimeSeriesValueDto;
  windDirection?: TimeSeriesValueDto;
  sstAnomaly?: number;
  spotterPosition?: {
    latitude: TimeSeriesValueDto;
    longitude: TimeSeriesValueDto;
  };
}
