import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateReefWithApplicationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsInt()
  readonly depth?: number;
}
