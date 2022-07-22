import { Module } from '@nestjs/common';
import { SensorDataController } from './sensor-data.controller';
import { SensorDataService } from './sensor-data.service';

@Module({
  controllers: [SensorDataController],
  providers: [SensorDataService],
})
export class SensorDataModule {}
