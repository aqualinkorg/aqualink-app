import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReefController } from './reefs.controller';
import { Reef } from './reefs.entity';
import { ReefRepository } from './reefs.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Reef, ReefRepository])],
  controllers: [ReefController],
})
export class ReefsModule {}
