import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReefsController } from './reefs.controller';
import { Reef } from './reefs.entity';
import { EntityExists } from '../validations/entity-exists.constraint';

@Module({
  imports: [TypeOrmModule.forFeature([Reef])],
  controllers: [ReefsController],
  providers: [EntityExists],
})
export class ReefsModule {}
