import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
  IsLowercase,
} from 'class-validator';
import { GeoJSON } from 'geojson';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly fullName?: string;

  @IsEmail()
  @IsLowercase()
  readonly email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly organization?: string;

  @IsOptional()
  @IsNotEmpty()
  readonly location?: GeoJSON;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly country?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;
}
