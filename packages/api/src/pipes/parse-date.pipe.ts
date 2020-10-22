import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import moment from 'moment-timezone';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const date = moment(value);
    if (!date.isValid()) {
      throw new BadRequestException(`Date '${metadata.data}' is not valid`);
    }
    return date.toDate();
  }
}
