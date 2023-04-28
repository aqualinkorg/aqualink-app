import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteApplication } from './site-applications.entity';
import { UpdateSiteApplicationDto } from './dto/update-site-application.dto';

@Injectable()
export class SiteApplicationsService {
  private logger = new Logger(SiteApplicationsService.name);
  constructor(
    @InjectRepository(SiteApplication)
    private siteApplicationRepository: Repository<SiteApplication>,
  ) {}

  async findOneFromSite(siteId: number): Promise<SiteApplication> {
    const application = await this.siteApplicationRepository.findOne({
      where: {
        site: { id: siteId },
      },
      relations: ['site', 'user'],
    });

    if (!application) {
      throw new NotFoundException(
        `Site Application for site with ID ${siteId} not found.`,
      );
    }

    return application;
  }

  async update(
    id: number,
    appParams: UpdateSiteApplicationDto,
  ): Promise<SiteApplication> {
    const app = await this.siteApplicationRepository.findOne({
      where: { id },
      relations: ['site'],
    });
    if (!app) {
      throw new NotFoundException(`Site Application with ID ${id} not found.`);
    }

    await this.siteApplicationRepository.update(app.id, appParams);

    const updatedApp = await this.siteApplicationRepository.findOne({
      where: { id },
    });

    return updatedApp!;
  }
}
