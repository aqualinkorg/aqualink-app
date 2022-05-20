import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForecastData, WindWaveMetric } from './wind-wave-data.entity';

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
    const getSofarValue = (metric: WindWaveMetric) => {
      const forecast = result.find((x) => x.metric === metric);
      return { timestamp: forecast?.timestamp, value: forecast?.value };
    };
    return {
      site: { id: siteId },
      significantWaveHeight: getSofarValue(
        WindWaveMetric.SIGNIFICANT_WAVE_HEIGHT,
      ),
      waveMeanDirection: getSofarValue(WindWaveMetric.WAVE_MEAN_DIRECTION),
      waveMeanPeriod: getSofarValue(WindWaveMetric.WAVE_MEAN_PERIOD),
      windSpeed: getSofarValue(WindWaveMetric.WIND_SPEED),
      windDirection: getSofarValue(WindWaveMetric.WIND_DIRECTION),
    };
  }
}
