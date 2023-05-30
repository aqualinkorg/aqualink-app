import { Injectable } from '@nestjs/common';
import { SOFAR_API_TOKEN } from '../utils/constants';
import { sofarSensor } from '../utils/sofar';

@Injectable()
export class SensorDataService {
  get(sensorId: string, startDate?: string, endDate?: string) {
    return sofarSensor(sensorId, SOFAR_API_TOKEN, startDate, endDate);
  }
}
