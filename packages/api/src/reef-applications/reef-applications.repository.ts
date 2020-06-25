import { NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository, Connection } from 'typeorm';
import { ReefApplication } from './reef-applications.entity';
import { Reef } from '../reefs/reefs.entity';
import { CreateReefDto } from '../reefs/dto/create-reef.dto';
import { UpdateReefDto } from '../reefs/dto/update-reef.dto';
import { CreateReefApplicationDto } from './dto/create-reef-application.dto';
import { UpdateReefApplicationDto } from './dto/update-reef-application.dto';

@EntityRepository(ReefApplication)
export class ReefApplicationsRepository extends Repository<ReefApplication> {
  constructor(private connection: Connection) {
    super();
  }

  async add(
    createReefApplicationDto: CreateReefApplicationDto,
    createReefDto: CreateReefDto,
  ) {
    const reef = await this.connection.getRepository(Reef).save(createReefDto);
    const reefApplication = {
      ...createReefApplicationDto,
      reefId: reef.id,
    };
    return this.save(reefApplication);
  }

  async change(
    id: number,
    uid: string,
    updateReefApplicationDto: UpdateReefApplicationDto,
    updateReefDto: UpdateReefDto,
  ) {
    const isValid = await this.findOne({ id, uid });
    if (!isValid) {
      throw new NotFoundException(
        `Reef Application with ID ${id} and UID ${uid} not found.`,
      );
    }
    const { reefId } = updateReefApplicationDto;
    if (reefId) {
      const result = await this.connection
        .getRepository(Reef)
        .update(reefId, updateReefDto);
      if (!result.affected) {
        throw new NotFoundException(`Reef with ID ${reefId} not found.`);
      }
    }
    const result = await this.update(id, updateReefApplicationDto);
    if (!result.affected) {
      throw new NotFoundException(`Reef Application with ID ${id} not found.`);
    }
  }
}
