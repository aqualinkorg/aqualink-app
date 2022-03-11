import { ApiPropertyOptional } from '@nestjs/swagger';
import { TimeSeriesValueDto } from '../../time-series/dto/time-series-value.dto';
import type { LatestData } from '../../time-series/latest-data.entity';
import { SofarLiveData } from '../../utils/sofar.types';

export class SofarLiveDataDto implements SofarLiveData {
  site: { id: number };
  latestData?: LatestData[];
  @ApiPropertyOptional({ example: 1 })
  dailyAlertLevel?: number;
  @ApiPropertyOptional({ example: 1 })
  weeklyAlertLevel?: number;
  @ApiPropertyOptional({ example: 1 })
  bottomTemperature?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  topTemperature?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  satelliteTemperature?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  degreeHeatingDays?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  waveHeight?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  waveMeanDirection?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  waveMeanPeriod?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  windSpeed?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  windDirection?: TimeSeriesValueDto;
  @ApiPropertyOptional({ example: 1 })
  sstAnomaly?: number;
  @ApiPropertyOptional({ example: 1 })
  spotterPosition?: {
    latitude: TimeSeriesValueDto;
    longitude: TimeSeriesValueDto;
  };
}
