import { IsDateString, IsNotEmpty } from 'class-validator';

export class ExcludeSpotterDatesDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
