import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'entityExists', async: true })
@Injectable()
export class EntityExists {
  constructor(private dataSource: DataSource) {}

  async validate(id: number, args: ValidationArguments) {
    if (typeof id !== 'number' || Number.isNaN(id) || !Number.isInteger(id)) {
      return false;
    }

    if (id < 1 || id > Number.MAX_SAFE_INTEGER) {
      return false;
    }

    const found = await this.dataSource
      .getRepository(args.constraints[0])
      .findOneBy({ id });
    if (!found) return false;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Foreign-key constraint error on ${args.constraints[0].name}.`;
  }
}
