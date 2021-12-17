import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isISO8601 } from 'class-validator';
import { isUndefined } from 'lodash';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string | undefined, metadata: ArgumentMetadata) {
    if (!isUndefined(value) && !isISO8601(value)) {
      throw new BadRequestException(`Date '${metadata.data}' is not valid`);
    }

    return value;
  }
}
