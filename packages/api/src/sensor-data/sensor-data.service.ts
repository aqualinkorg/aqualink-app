import { Injectable } from '@nestjs/common';
import { getSpotterData } from '../utils/sofar';

@Injectable()
export class SensorDataService {
  get(sensorId: string, endDate?: Date, startDate?: Date) {
    return getSpotterData(sensorId, endDate, startDate);
  }
}
