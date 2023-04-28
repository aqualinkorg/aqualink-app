import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForecastData } from './forecast-data.entity';

@Injectable()
export class WindWaveService {
  constructor(
    @InjectRepository(ForecastData)
    private forecastDataRepository: Repository<ForecastData>,
  ) {}

  async getWindWaveDate(siteId: number) {
    const result = await this.forecastDataRepository.find({
      where: { site: { id: siteId } },
    });
    return result.map((item) => ({
      ...item,
      site: { id: siteId },
    }));
  }
}
