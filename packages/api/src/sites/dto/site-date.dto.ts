import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches, Validate } from 'class-validator';
import {
  HISTORICAL_DATE_REGEX,
  IsValidCalendarDate,
} from '../../utils/historical-date.utils';

/**
 * Optional historical date (YYYY-MM-DD, UTC) used to retrieve the state of
 * the site(s) as it was at the end of that day instead of the latest data.
 */
export class SiteDateDto {
  @ApiProperty({
    example: '2024-04-01',
    required: false,
    description:
      'Historical date (YYYY-MM-DD). When provided, collectionData is built from daily_data as of the end of that day instead of latest_data.',
  })
  @IsOptional()
  @Matches(HISTORICAL_DATE_REGEX, {
    message: 'date must be formatted as YYYY-MM-DD',
  })
  @Validate(IsValidCalendarDate)
  readonly date?: string;
}
