import { Test, TestingModule } from '@nestjs/testing';
import { DataUploadsController } from './data-uploads.controller';

describe('DataUploadsController', () => {
  let controller: DataUploadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataUploadsController],
    }).compile();

    controller = module.get<DataUploadsController>(DataUploadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
