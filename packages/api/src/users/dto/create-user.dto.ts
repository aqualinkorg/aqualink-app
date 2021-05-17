import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'User full name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly fullName?: string;

  @ApiProperty({ example: 'fullname@example.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'Random Organization' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly organization?: string;

  @ApiPointProperty()
  @IsOptional()
  @IsNotEmpty()
  readonly location?: GeoJSON;

  @ApiProperty({ example: 'Some country' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly country?: string;

  @ApiProperty({ example: 'Some description' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @ApiProperty({ example: 'http://some-sample-url.com' })
  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;
}
