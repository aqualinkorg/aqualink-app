import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ReefCheckSurveysController } from './reef-check-surveys.controller';
import { ReefCheckSurvey } from './reef-check-surveys.entity';
import { ReefCheckSurveysService } from './reef-check-surveys.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReefCheckSurvey])],
  providers: [ReefCheckSurveysService],
  controllers: [ReefCheckSurveysController],
})
export class ReefCheckSurveysModule {}
