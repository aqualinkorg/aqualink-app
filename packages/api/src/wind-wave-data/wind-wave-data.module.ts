import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WindWaveController } from './wind-wave-data.controller';
import { ForecastData } from './forecast-data.entity';
import { WindWaveService } from './wind-wave-data.service';

@Module({
  controllers: [WindWaveController],
  providers: [WindWaveService],
  imports: [TypeOrmModule.forFeature([ForecastData])],
})
export class WindWaveModule {}
