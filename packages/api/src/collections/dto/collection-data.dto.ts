import { ApiProperty } from '@nestjs/swagger';

export class CollectionDataDto {
  @ApiProperty({ example: 28.05 })
  bottomTemperature?: number;

  @ApiProperty({ example: 29.05 })
  topTemperature?: number;

  @ApiProperty({ example: 29.13 })
  satelliteTemperature?: number;

  @ApiProperty({ example: 0 })
  degreeHeatingDays?: number;

  @ApiProperty({ example: 1 })
  weeklyAlertLevel?: number;

  @ApiProperty({ example: -0.101 })
  sstAnomaly?: number;

  @ApiProperty({ example: 1.32 })
  significantWaveHeight?: number;

  @ApiProperty({ example: 2 })
  waveMeanDirection?: number;

  @ApiProperty({ example: 12 })
  wavePeakPeriod?: number;

  @ApiProperty({ example: 153 })
  windDirection?: number;

  @ApiProperty({ example: 10.4 })
  windSpeed?: number;
}
