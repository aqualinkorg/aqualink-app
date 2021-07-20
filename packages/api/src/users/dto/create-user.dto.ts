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
  readonly fullName?: string | null;

  @ApiProperty({ example: 'fullname@example.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'Ovio' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly organization?: string | null;

  @ApiPointProperty()
  @IsOptional()
  @IsNotEmpty()
  readonly location?: GeoJSON | null;

  @ApiProperty({ example: 'United States' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly country?: string | null;

  @ApiProperty({ example: 'Some description' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string | null;

  @ApiProperty({ example: 'http://some-sample-url.com' })
  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string | null;
}
