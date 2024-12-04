import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReefCheckSite } from './reef-check-sites.entity';

@Injectable()
export class ReefCheckSitesService {
  private readonly logger = new Logger(ReefCheckSitesService.name);

  constructor(
    @InjectRepository(ReefCheckSite)
    private reefCheckRepository: Repository<ReefCheckSite>,
  ) {}

  async findOne(id: string): Promise<ReefCheckSite> {
    const reefCheckSite = await this.reefCheckRepository.findOne({
      where: { id },
    });

    if (!reefCheckSite) {
      throw new NotFoundException(`No site was found with the specified id`);
    }

    return reefCheckSite;
  }
}
