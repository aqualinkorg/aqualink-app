import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { GeoJSON } from 'geojson';
import { ApiPointProperty } from '../../docs/api-properties';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly fullName?: string;

  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly organization?: string;

  @ApiPointProperty()
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
