import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";

import { Site } from "./entities/site.entity";
import { DailyData } from "./entities/daily-data.entity";

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,

    @InjectRepository(DailyData)
    private readonly dailyDataRepository: Repository<DailyData>,
  ) {}

  /**
   * Returns all sites.
   *
   * When `date` is provided, each site's `dailyData` is populated with the
   * closest available record on or before the requested date, allowing the
   * frontend to render the map as it looked on that historical day.
   *
   * When `date` is omitted, the behaviour is unchanged – the most recent
   * daily data row is attached to each site.
   */
  async findAll(date?: string): Promise<Site[]> {
    if (!date) {
      // Default behaviour – return sites with latest daily data
      return this.siteRepository.find({
        relations: ["region", "admin", "historicalMonthlyMean"],
      });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      this.logger.warn(`Invalid date received: ${date}. Falling back to latest data.`);
      return this.siteRepository.find({
        relations: ["region", "admin", "historicalMonthlyMean"],
      });
    }

    // Set to end-of-day so that records on the exact target date are included
    targetDate.setUTCHours(23, 59, 59, 999);

    this.logger.log(`Fetching historical site data for date: ${targetDate.toISOString()}`);

    const sites = await this.siteRepository.find({
      relations: ["region", "admin", "historicalMonthlyMean"],
    });

    // For each site, find the most recent DailyData record on or before targetDate
    const sitesWithHistoricalData = await Promise.all(
      sites.map(async (site) => {
        const historicalRecord = await this.dailyDataRepository.findOne({
          where: {
            site: { id: site.id },
            date: LessThanOrEqual(targetDate),
          },
          order: { date: "DESC" },
        });

        return {
          ...site,
          dailyData: historicalRecord ? [historicalRecord] : [],
        };
      })
    );

    return sitesWithHistoricalData;
  }

  async findOne(id: number): Promise<Site | undefined> {
    return this.siteRepository.findOne({
      where: { id },
      relations: [
        "region",
        "admin",
        "historicalMonthlyMean",
        "dailyData",
        "liveData",
      ],
    });
  }

  async getDailyData(
    id: number,
    start?: string,
    end?: string
  ): Promise<DailyData[]> {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    const where: Record<string, any> = { site: { id } };

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }

    return this.dailyDataRepository.find({
      where,
      order: { date: "ASC" },
    });
  }

  async getLiveData(id: number): Promise<Site | undefined> {
    return this.siteRepository.findOne({
      where: { id },
      relations: ["liveData"],
    });
  }
}
