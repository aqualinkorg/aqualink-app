import { Injectable } from '@nestjs/common';
import { sofarSensor } from '../utils/sofar';

@Injectable()
export class SensorDataService {
  get(sensorId: string, endDate?: string, startDate?: string) {
    return sofarSensor(sensorId, startDate, endDate);
  }
}
