import { CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { User, AdminLevel } from '../users/users.entity';
import { Site } from '../sites/sites.entity';

export class IsSiteAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,

    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user }: { user: User } = request;
    const siteId = parseInt(request.params.site_id, 10);

    if (user.adminLevel === AdminLevel.SuperAdmin) {
      return true;
    }

    if (!Number.isNaN(siteId) && user.adminLevel === AdminLevel.SiteManager) {
      const isSiteAdmin = await this.siteRepository
        .createQueryBuilder('site')
        .innerJoin('site.admins', 'admins', 'admins.id = :userId', {
          userId: user.id,
        })
        .andWhere('site.id = :siteId', { siteId })
        .getOne();

      return !!isSiteAdmin;
    }

    return false;
  }
}
