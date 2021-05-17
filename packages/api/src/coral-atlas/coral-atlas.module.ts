import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reef } from '../reefs/reefs.entity';
import { Survey } from '../surveys/surveys.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { CoralAtlasController } from './coral-atlas.controller';
import { CoralAtlasService } from './coral-atlas.service';

@Module({
  controllers: [CoralAtlasController],
  providers: [CoralAtlasService],
  imports: [TypeOrmModule.forFeature([Reef, Survey, TimeSeries])],
})
export class CoralAtlasModule {}
