import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';
import { Region } from './regions.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Region, User])],
  controllers: [RegionsController],
  providers: [RegionsService, UsersService, EntityExists],
})
export class RegionsModule {}
