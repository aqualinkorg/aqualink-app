import { applyDecorators, SetMetadata } from '@nestjs/common';

export const Public = () => applyDecorators(SetMetadata('isPublic', true));
