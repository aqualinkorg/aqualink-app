import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReefsController } from './reefs.controller';
import { ReefsService } from './reefs.service';
import { Reef } from './reefs.entity';
import { DailyData } from './daily-data.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reef, User, DailyData])],
  controllers: [ReefsController],
  providers: [ReefsService, UsersService, EntityExists],
})
export class ReefsModule {}
