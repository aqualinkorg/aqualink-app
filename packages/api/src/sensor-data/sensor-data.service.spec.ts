import { Test, TestingModule } from '@nestjs/testing';
import { SensorDataService } from './sensor-data.service';

describe('SensorDataService', () => {
  let service: SensorDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorDataService],
    }).compile();

    service = module.get<SensorDataService>(SensorDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
