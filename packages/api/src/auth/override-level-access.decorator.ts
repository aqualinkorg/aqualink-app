import { applyDecorators, SetMetadata } from '@nestjs/common';
import { AdminLevel } from '../users/users.entity';

export const OverrideLevelAccess = (...levels: AdminLevel[]) =>
  applyDecorators(SetMetadata('levels', levels));
