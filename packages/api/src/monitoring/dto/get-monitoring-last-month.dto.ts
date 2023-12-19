import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetMonitoringLastMonthDto {
  @IsOptional()
  @Transform(({ value }) => {
    return [true, 'true', 1, '1'].indexOf(value) > -1;
  })
  csv?: boolean;
}
