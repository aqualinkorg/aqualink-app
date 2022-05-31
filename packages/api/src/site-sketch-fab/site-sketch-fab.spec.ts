import { Test, TestingModule } from '@nestjs/testing';
import { SiteSketchFabService } from './site-sketch-fab.service';

describe('SiteSketchFabService', () => {
  let service: SiteSketchFabService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteSketchFabService],
    }).compile();

    service = module.get<SiteSketchFabService>(SiteSketchFabService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
