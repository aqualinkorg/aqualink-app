import {
  Injectable,
  PipeTransform,
  BadRequestException,
  ParseArrayPipe,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class MetricArrayPipe implements PipeTransform<any, Promise<string[]>> {
  constructor(private readonly options: UniqueSubsetArrayOptions) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<string[]> {
    if (!value) {
      return this.options.defaultArray;
    }

    const parseArrayPipe = new ParseArrayPipe({
      items: String,
      separator: ',',
    });
    const parsedArray = (await parseArrayPipe.transform(
      value,
      metadata,
    )) as string[];

    const isSubset = parsedArray.every((item) =>
      this.options.predefinedSet.includes(item),
    );
    if (!isSubset) {
      throw new BadRequestException('Invalid array. Unknown elements');
    }

    const uniqueArray = [...new Set(parsedArray)];
    if (uniqueArray.length !== parsedArray.length) {
      throw new BadRequestException('Invalid array. Elements are not unique');
    }

    return uniqueArray;
  }
}

interface UniqueSubsetArrayOptions {
  predefinedSet: string[];
  defaultArray: string[];
}
