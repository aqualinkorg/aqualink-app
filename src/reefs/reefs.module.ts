import { Module } from '@nestjs/common';
import { ReefsController } from './reefs.controller';

@Module({
  controllers: [ReefsController]
})
export class ReefsModule {}
