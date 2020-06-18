import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';
import { RegionsRepository } from './regions.repository';
import { EntityExists } from '../validations/entity-exists.constraint';

@Module({
  imports: [TypeOrmModule.forFeature([RegionsRepository])],
  controllers: [RegionsController],
  providers: [RegionsService, EntityExists],
})
export class RegionsModule {}
