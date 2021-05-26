import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class DeploySpotterDto {
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
