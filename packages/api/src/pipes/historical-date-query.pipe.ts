import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { HistoricalDateDto } from '../sites/dto/historical-date.dto';

@Injectable()
export class HistoricalDateQueryPipe implements PipeTransform {
  transform(value: HistoricalDateDto): HistoricalDateDto {
    // The simple query parser preserves bracket notation as literal keys.
    // Reject it instead of silently treating an optional date as omitted.
    if (Object.keys(value).some((key) => key.startsWith('date['))) {
      throw new BadRequestException('Date must be one YYYY-MM-DD UTC date');
    }
    return value;
  }
}
