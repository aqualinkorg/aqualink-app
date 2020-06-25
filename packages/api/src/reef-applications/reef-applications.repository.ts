import { EntityRepository, Repository, Connection } from 'typeorm';
import { ReefApplication } from './reef-applications.entity';
import { Reef } from '../reefs/reefs.entity';
import { CreateReefDto } from '../reefs/dto/create-reef.dto';
import { CreateReefApplicationDto } from './dto/create-reef-application.dto';

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
}
