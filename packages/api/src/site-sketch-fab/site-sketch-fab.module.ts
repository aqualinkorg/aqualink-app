import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSketchFabService } from './site-sketch-fab.service';
import { SiteSketchFabController } from './site-sketch-fab.controller';
import { SiteSketchFab } from './site-sketch-fab.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSketchFab])],
  providers: [SiteSketchFabService],
  controllers: [SiteSketchFabController],
})
export class SiteSketchFabModule {}
