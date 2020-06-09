import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReefsController } from './reefs.controller';
import { Reef } from './reefs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reef])],
  controllers: [ReefsController],
})
export class ReefsModule {}
