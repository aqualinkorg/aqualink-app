import { Reef } from './reefs.entity';
import { EntityRepository, Repository } from 'typeorm';
import { ReefDto } from './interfaces/reef.dto';

@EntityRepository(Reef)
export class ReefRepository extends Repository<Reef> {
  createReef = async (reefDto: ReefDto) => {
    return await this.save(reefDto);
  };
}
