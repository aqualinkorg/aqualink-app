import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ReefApplication } from '../reef-applications/reef-applications.entity';
import { Reef } from '../reefs/reefs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Reef, ReefApplication])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
