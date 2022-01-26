import { Test, TestingModule } from '@nestjs/testing';
import { DataUploadsService } from './data-uploads.service';

describe('DataUploadsService', () => {
  let service: DataUploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataUploadsService],
    }).compile();

    service = module.get<DataUploadsService>(DataUploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
