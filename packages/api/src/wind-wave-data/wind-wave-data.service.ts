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
    return this.forecastDataRepository.findOne({
      where: { site: siteId },
    });
  }
}
