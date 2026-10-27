import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, Matches } from 'class-validator';

export class HistoricalDateQueryDto {
  @ApiPropertyOptional({
    example: '2024-06-15',
    description: 'Show observations through this UTC date (YYYY-MM-DD).',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  readonly asOf?: string;
}
