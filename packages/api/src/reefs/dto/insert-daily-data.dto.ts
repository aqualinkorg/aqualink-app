import { Validate, IsInt, IsDate, IsNumber } from 'class-validator';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Reef } from '../reefs.entity';

export class InsertDailyData {
  @IsDate()
  readonly date: Date;

  @IsNumber()
  readonly minBottomTemperature: number;

  @IsNumber()
  readonly maxBottomTemperature: number;

  @IsNumber()
  readonly avgBottomTemperature: number;

  @IsNumber()
  readonly degreeHeatingDays: number;

  @IsNumber()
  readonly surfaceTemperature: number;

  @IsNumber()
  readonly satelliteTemperature: number;

  @IsNumber()
  readonly minWaveHeight: number;

  @IsNumber()
  readonly maxWaveHeight: number;

  @IsNumber()
  readonly avgWaveHeight: number;

  @IsNumber()
  readonly waveDirection: number;

  @IsNumber()
  readonly wavePeriod: number;

  @IsNumber()
  readonly minWindSpeed: number;

  @IsNumber()
  readonly maxWindSpeed: number;

  @IsNumber()
  readonly avgWindSpeed: number;

  @IsNumber()
  readonly windDirection: number;

  @IsInt()
  @Validate(EntityExists, [Reef])
  readonly reef: Reef;
}
