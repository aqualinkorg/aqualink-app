import { IsISO8601, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SiteDataDateDto {
  @ApiProperty({
    example: '2024-03-15',
    required: false,
    description:
      'Optional UTC date (YYYY-MM-DD). When set to a past day, `collectionData` holds the latest values available at the end of that day instead of the current values.',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be formatted as YYYY-MM-DD',
  })
  @IsISO8601({ strict: true })
  readonly date?: string;
}
