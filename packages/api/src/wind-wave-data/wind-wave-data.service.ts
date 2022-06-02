import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForecastData } from './wind-wave-data.entity';

@Injectable()
export class WindWaveService {
  constructor(
    @InjectRepository(ForecastData)
    private forecastDataRepository: Repository<ForecastData>,
  ) {}

  async getWindWaveDate(siteId: number) {
    const result = await this.forecastDataRepository.find({
      where: { site: siteId },
    });
    return result.map((item) => ({
      timestamp: item.timestamp,
      value: item.value,
      source: item.source,
      metric: item.metric,
      site: { id: siteId },
    }));
  }
}
