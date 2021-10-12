import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class ExcludeSpotterDatesDto {
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
