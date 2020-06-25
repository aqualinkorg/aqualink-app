import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReefApplication } from './reef-applications.entity';
import { ReefApplicationsRepository } from './reef-applications.repository';
import { CreateReefApplicationDto } from './dto/create-reef-application.dto';
import { CreateReefDto } from '../reefs/dto/create-reef.dto';

@Injectable()
export class ReefApplicationsService {
  constructor(
    @InjectRepository(ReefApplicationsRepository)
    private reefApplicationsRepository: ReefApplicationsRepository,
  ) {}

  async create(
    createReefApplicationDto: CreateReefApplicationDto,
    createReefDto: CreateReefDto,
  ): Promise<ReefApplication> {
    return this.reefApplicationsRepository.add(
      createReefApplicationDto,
      createReefDto,
    );
  }

  async findOne(id: number, uid: string): Promise<ReefApplication> {
    const found = await this.reefApplicationsRepository.findOne({
      where: { id, uid },
      relations: ['reefId', 'userId'],
    });
    if (!found || found.uid !== uid) {
      throw new NotFoundException(
        `ReefApplication with ID ${id} and UID ${uid} not found.`,
      );
    }
    return found;
  }
}
