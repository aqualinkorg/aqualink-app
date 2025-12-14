import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetMonitoringLastMonthDto {
  @IsOptional()
  @Transform(({ value }) => [true, 'true', 1, '1'].indexOf(value) > -1)
  csv?: boolean;
}
