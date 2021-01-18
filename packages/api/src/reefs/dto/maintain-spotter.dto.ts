import { IsDateString, IsNotEmpty } from 'class-validator';

export class MaintainSpotterDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
