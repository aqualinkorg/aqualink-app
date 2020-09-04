import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ReefToAdmin } from '../reefs/reef-to-admin.entity';
import { ReefApplication } from '../reef-applications/reef-applications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ReefToAdmin, ReefApplication])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
