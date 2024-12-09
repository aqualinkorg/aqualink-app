import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ReefCheckSitesController } from './reef-check-sites.controller';
import { ReefCheckSite } from './reef-check-sites.entity';
import { ReefCheckSitesService } from './reef-check-sites.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReefCheckSite])],
  providers: [ReefCheckSitesService],
  controllers: [ReefCheckSitesController],
})
export class ReefCheckSitesModule {}
