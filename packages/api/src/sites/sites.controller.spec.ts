import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SitesController } from './sites.controller';
import { Site } from './sites.entity';
import { DailyData } from './daily-data.entity';
import { SitesService } from './sites.service';
import { Region } from '../regions/regions.entity';
import { ExclusionDates } from './exclusion-dates.entity';
import { HistoricalMonthlyMean } from './historical-monthly-mean.entity';
import { User } from '../users/users.entity';
import { SiteApplication } from '../site-applications/site-applications.entity';
import { Sources } from './sources.entity';
import { LatestData } from '../time-series/latest-data.entity';

describe('Sites Controller', () => {
  let controller: SitesController;
  let service: SitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Mock version of SiteRepository - it will inject the `useValue` as the service in the controller, so you can add
      // mock implementations there.
      providers: [
        SitesService,
        { provide: getRepositoryToken(Site), useClass: Repository },
        { provide: getRepositoryToken(DailyData), useClass: Repository },
        { provide: getRepositoryToken(Region), useClass: Repository },
        { provide: getRepositoryToken(ExclusionDates), useClass: Repository },
        {
          provide: getRepositoryToken(HistoricalMonthlyMean),
          useClass: Repository,
        },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(SiteApplication), useClass: Repository },
        { provide: getRepositoryToken(Sources), useClass: Repository },
        { provide: getRepositoryToken(LatestData), useClass: Repository },
      ],
      // You could also provide it the real SiteRepository, but then you'll also have to take care of providing *its*
      // dependencies too (e.g. with an `imports` block.
      // providers: [SiteRepository],
      controllers: [SitesController],
    }).compile();

    service = module.get<SitesService>(SitesService);
    controller = module.get<SitesController>(SitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
