import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityExists } from '../validations/entity-exists.constraint';
import { WindWaveController } from './wind-wave-data.controller';
import { ForecastData } from './wind-wave-data.entity';
import { WindWaveService } from './wind-wave-data.service';

@Module({
  controllers: [WindWaveController],
  providers: [WindWaveService, EntityExists],
  imports: [TypeOrmModule.forFeature([ForecastData])],
})
export class WindWaveModule {}
