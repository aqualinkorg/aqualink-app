import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from 'sites/sites.entity';
import { SensorDataController } from './sensor-data.controller';
import { SensorDataService } from './sensor-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([Site])],
  controllers: [SensorDataController],
  providers: [SensorDataService],
})
export class SensorDataModule {}
