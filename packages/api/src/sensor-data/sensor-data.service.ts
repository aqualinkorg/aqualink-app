import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from 'sites/sites.entity';
import { Repository } from 'typeorm';
import { AdminLevel, User } from 'users/users.entity';
import { sofarLatest, sofarSensor } from '../utils/sofar';

@Injectable()
export class SensorDataService {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

  get(sensorId: string, startDate?: string, endDate?: string) {
    return sofarSensor(
      sensorId,
      process.env.SOFAR_API_TOKEN,
      startDate,
      endDate,
    );
  }

  async getSensorInfo(siteId?: number, sensorId?: string, user?: User) {
    if (!user) throw new UnauthorizedException('Unauthorized');

    if ((!siteId && !sensorId) || (siteId && sensorId))
      throw new BadRequestException('Provide one of siteId or sensorId');

    const condition = siteId ? { id: siteId } : { sensorId };
    const site = await this.siteRepository.findOne({
      where: condition,
      relations: ['admins'],
    });

    if (!site) throw new BadRequestException('Invalid siteId or sensorId');
    if (
      !site.admins.find((x) => x.id === user.id) &&
      !(user.adminLevel === AdminLevel.SuperAdmin)
    )
      throw new ForbiddenException('Forbidden');
    if (!site.sensorId)
      throw new BadRequestException('No deployed spotter for this site');

    return sofarLatest({
      sensorId: site.sensorId,
      token: process.env.SOFAR_API_TOKEN,
    });
  }
}
