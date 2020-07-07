import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReefsController } from './reefs.controller';
import { ReefsService } from './reefs.service';
import { Reef } from './reefs.entity';
import { EntityExists } from '../validations/entity-exists.constraint';

@Module({
  imports: [TypeOrmModule.forFeature([Reef])],
  controllers: [ReefsController],
  providers: [ReefsService, EntityExists],
})
export class ReefsModule {}
