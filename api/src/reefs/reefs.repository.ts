import { Reef } from './reefs.entity';
import { EntityRepository, Repository } from 'typeorm';
import { ReefDto } from './interfaces/reefs.dto';

@EntityRepository(Reef)
export class ReefRepository extends Repository<Reef> {
  createReef = async (reefDto: ReefDto) => {
    return await this.save(reefDto);
  };

  findOneReef = async (id: string) => {
    return this.findOneOrFail(id);
  };

  updateReef = async (id: string, reefDto: ReefDto) => {
    return this.save({ ...reefDto, id: Number(id) });
  };

  removeReef = async (id: string) => {
    await this.findOneOrFail(id);
    return this.delete(id);
  };
}
