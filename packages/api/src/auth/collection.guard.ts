import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../collections/collections.entity';
import { User } from '../users/users.entity';

export class CollectionGuard implements CanActivate {
  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,

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
    const { collectionId }: { collectionId: string } = request.params;

    if (!Number.isNaN(parseInt(collectionId, 10))) {
      const hasCollection = await this.collectionRepository.findOne({
        where: {
          id: Number(collectionId),
          user: { id: user.id },
        },
      });

      return !!hasCollection;
    }

    return false;
  }
}
