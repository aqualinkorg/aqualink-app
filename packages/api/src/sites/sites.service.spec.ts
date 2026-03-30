import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SitesService } from "./sites.service";
import { Site } from "./entities/site.entity";
import { DailyData } from "./entities/daily-data.entity";

const mockSite: Partial<Site> = {
  id: 1,
  name: "Test Reef",
  country: "Australia",
};

const mockDailyData: Partial<DailyData> = {
  id: 10,
  date: new Date("2020-03-14T00:00:00.000Z"),
  satelliteTemperature: 29.5,
  weeklyAlertLevel: 2,
};

describe("SitesService", () => {
  let service: SitesService;
  let siteRepository: jest.Mocked<Repository<Site>>;
  let dailyDataRepository: jest.Mocked<Repository<DailyData>>;

  beforeEach(async () => {
    const mockSiteRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockDailyDataRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        {
          provide: getRepositoryToken(Site),
          useValue: mockSiteRepo,
        },
        {
          provide: getRepositoryToken(DailyData),
          useValue: mockDailyDataRepo,
        },
      ],
    }).compile();

    service = module.get<SitesService>(SitesService);
    siteRepository = module.get(getRepositoryToken(Site));
    dailyDataRepository = module.get(getRepositoryToken(DailyData));
  });

  describe("findAll", () => {
    it("returns sites with default (latest) data when no date is provided", async () => {
      siteRepository.find.mockResolvedValue([mockSite as Site]);

      const result = await service.findAll();

      expect(siteRepository.find).toHaveBeenCalledWith({
        relations: ["region", "admin", "historicalMonthlyMean"],
      });
      expect(result).toEqual([mockSite]);
    });

    it("returns sites with historical daily data when date is provided", async () => {
      siteRepository.find.mockResolvedValue([mockSite as Site]);
      dailyDataRepository.findOne.mockResolvedValue(mockDailyData as DailyData);

      const result = await service.findAll("2020-03-15");

      expect(siteRepository.find).toHaveBeenCalledWith({
        relations: ["region", "admin", "historicalMonthlyMean"],
      });
      expect(dailyDataRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ site: { id: 1 } }),
          order: { date: "DESC" },
        })
      );
      expect(result[0].dailyData).toEqual([mockDailyData]);
    });

    it("returns empty dailyData array when no historical record is found", async () => {
      siteRepository.find.mockResolvedValue([mockSite as Site]);
      dailyDataRepository.findOne.mockResolvedValue(undefined as any);

      const result = await service.findAll("2014-01-01");

      expect(result[0].dailyData).toEqual([]);
    });

    it("falls back to latest data when an invalid date string is provided", async () => {
      siteRepository.find.mockResolvedValue([mockSite as Site]);

      const result = await service.findAll("not-a-date");

      expect(siteRepository.find).toHaveBeenCalledWith({
        relations: ["region", "admin", "historicalMonthlyMean"],
      });
      expect(result).toEqual([mockSite]);
    });
  });

  describe("getDailyData", () => {
    it("fetches daily data for a site between two dates", async () => {
      dailyDataRepository.find.mockResolvedValue([mockDailyData as DailyData]);

      const result = await service.getDailyData(1, "2020-01-01", "2020-12-31");

      expect(dailyDataRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockDailyData]);
    });
  });
});
