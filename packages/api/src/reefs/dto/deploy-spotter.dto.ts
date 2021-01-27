import { IsDateString, IsNotEmpty } from 'class-validator';

export class DeploySpotterDto {
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
