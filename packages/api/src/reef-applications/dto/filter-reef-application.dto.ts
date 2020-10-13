import { IsOptional, Validate } from 'class-validator';
import { Reef } from '../../reefs/reefs.entity';
import { User } from '../../users/users.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class FilterReefApplication {
  @IsOptional()
  @Validate(EntityExists, [User])
  readonly user?: User;

  @IsOptional()
  @Validate(EntityExists, [Reef])
  readonly reef?: Reef;
}
