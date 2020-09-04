import { CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReefToAdmin } from '../reefs/reef-to-admin.entity';
import { User, AdminLevel } from '../users/users.entity';

export class IsReefAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(ReefToAdmin)
    private reefToAdminRepository: Repository<ReefToAdmin>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user }: { user: User } = request;
    const reefId: number = request.params.reef_id;

    if (user.adminLevel === AdminLevel.SuperAdmin) {
      return true;
    }

    if (reefId) {
      const isReefAdmin = await this.reefToAdminRepository.findOne({
        where: {
          reefId,
          adminId: user.id,
        },
      });

      return !!isReefAdmin;
    }

    return true;
  }
}
