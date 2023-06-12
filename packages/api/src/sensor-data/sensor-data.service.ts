import { Injectable } from '@nestjs/common';
import { sofarSensor } from '../utils/sofar';

@Injectable()
export class SensorDataService {
  get(sensorId: string, startDate?: string, endDate?: string) {
    return sofarSensor(
      sensorId,
      process.env.SOFAR_API_TOKEN,
      startDate,
      endDate,
    );
  }
}
