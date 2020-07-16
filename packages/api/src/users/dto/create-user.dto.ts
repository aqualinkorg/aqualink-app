import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';
import { GeoJSON } from 'geojson';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly fullName?: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  readonly firebaseUid: string;

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
