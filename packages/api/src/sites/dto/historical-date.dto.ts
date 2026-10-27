import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class HistoricalDateDto {
  @ApiPropertyOptional({
    example: '2024-01-02',
    description:
      'UTC calendar date for an exact-day historical snapshot. Omit for live data.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  readonly date?: string;
}
