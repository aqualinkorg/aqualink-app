import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { CollectionsController } from './collections.controller';
import { Collection } from './collections.entity';
import { CollectionsService } from './collections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, LatestData, Site, Sources])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
