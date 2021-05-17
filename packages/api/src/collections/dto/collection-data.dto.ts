import { ApiProperty } from '@nestjs/swagger';

export class CollectionDataDto {
  @ApiProperty({ example: 28.05 })
  bottomTemperature: number | undefined;

  @ApiProperty({ example: 29.05 })
  topTemperature: number | undefined;

  @ApiProperty({ example: 29.13 })
  satelliteTemperature: number | undefined;

  @ApiProperty({ example: 0 })
  degreeHeatingDays: number | undefined;

  @ApiProperty({ example: 1 })
  weeklyAlertLevel: number | undefined;

  @ApiProperty({ example: -0.101 })
  sstAnomaly: number | undefined;
}
