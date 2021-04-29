import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyData } from '../reefs/daily-data.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { CollectionsController } from './collections.controller';
import { Collection } from './collections.entity';
import { CollectionsService } from './collections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, LatestData, DailyData])],
  controllers: [CollectionsController],
  providers: [CollectionsService, EntityExists],
})
export class CollectionsModule {}
