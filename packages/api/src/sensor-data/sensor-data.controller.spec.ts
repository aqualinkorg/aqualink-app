import { Test, TestingModule } from '@nestjs/testing';
import { SensorDataController } from './sensor-data.controller';

describe('SensorDataController', () => {
  let controller: SensorDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorDataController],
    }).compile();

    controller = module.get<SensorDataController>(SensorDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
